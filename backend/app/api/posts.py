import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.post import Post, PostVariant, ScheduledPost
from app.schemas import CreatePostRequest, PostResponse, PostVariantResponse
from app.scheduler.service import scheduler_service
from app.api.auth import get_current_user

router = APIRouter(prefix="/posts", tags=["Posts & Scheduling"])

@router.get("", response_model=List[PostResponse])
async def list_posts(
    status_filter: Optional[str] = Query(None, alias="status"),
    platform_filter: Optional[str] = Query(None, alias="platform"),
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    query = select(Post).order_by(desc(Post.created_at)).limit(limit)
    if status_filter:
        query = query.where(Post.status == status_filter)
    res = await db.execute(query)
    posts = res.scalars().all()

    result = []
    for p in posts:
        # Load variants
        var_stmt = select(PostVariant).where(PostVariant.post_id == p.id)
        var_res = await db.execute(var_stmt)
        variants = var_res.scalars().all()

        platforms_list = json.loads(p.platforms_json or "[]")
        if platform_filter and platform_filter not in platforms_list:
            continue

        result.append(
            PostResponse(
                id=p.id,
                title=p.title,
                content=p.content,
                post_type=p.post_type,
                platforms=platforms_list,
                media_urls=json.loads(p.media_urls_json or "[]"),
                poll_options=json.loads(p.poll_options_json or "[]"),
                status=p.status,
                scheduled_at=p.scheduled_at,
                published_at=p.published_at,
                created_at=p.created_at,
                variants=[
                    PostVariantResponse(
                        id=v.id,
                        platform=v.platform,
                        adapted_content=v.adapted_content,
                        status=v.status,
                        external_post_id=v.external_post_id,
                        error_message=v.error_message,
                        published_at=v.published_at
                    )
                    for v in variants
                ]
            )
        )
    return result

@router.post("", response_model=PostResponse)
async def create_post(
    req: CreatePostRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    # Idempotency check to prevent duplicate publishing
    if req.idempotency_key:
        stmt = select(Post).where(Post.idempotency_key == req.idempotency_key)
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            # Return existing post without creating duplicate
            return PostResponse(
                id=existing.id,
                title=existing.title,
                content=existing.content,
                post_type=existing.post_type,
                platforms=json.loads(existing.platforms_json or "[]"),
                media_urls=json.loads(existing.media_urls_json or "[]"),
                poll_options=json.loads(existing.poll_options_json or "[]"),
                status=existing.status,
                scheduled_at=existing.scheduled_at,
                published_at=existing.published_at,
                created_at=existing.created_at
            )

    post = Post(
        title=req.title,
        content=req.content,
        post_type=req.post_type,
        platforms_json=json.dumps(req.platforms),
        account_ids_json=json.dumps(req.account_ids),
        media_urls_json=json.dumps(req.media_urls),
        poll_options_json=json.dumps(req.poll_options),
        status=req.status,
        scheduled_at=req.scheduled_at,
        idempotency_key=req.idempotency_key or str(uuid.uuid4()),
        created_by=user.id
    )
    db.add(post)
    await db.flush()

    # If immediate publishing requested
    if req.status == "published":
        success, err = await scheduler_service.publish_post(db, post)
        if success:
            post.published_at = datetime.now(timezone.utc)
        else:
            post.status = "failed"
    elif req.status == "scheduled" and req.scheduled_at:
        sched = ScheduledPost(
            post_id=post.id,
            run_at=req.scheduled_at,
            status="pending"
        )
        db.add(sched)

    await db.commit()
    await db.refresh(post)

    var_stmt = select(PostVariant).where(PostVariant.post_id == post.id)
    var_res = await db.execute(var_stmt)
    variants = var_res.scalars().all()

    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        post_type=post.post_type,
        platforms=req.platforms,
        media_urls=req.media_urls,
        poll_options=req.poll_options,
        status=post.status,
        scheduled_at=post.scheduled_at,
        published_at=post.published_at,
        created_at=post.created_at,
        variants=[
            PostVariantResponse(
                id=v.id,
                platform=v.platform,
                adapted_content=v.adapted_content,
                status=v.status,
                external_post_id=v.external_post_id,
                error_message=v.error_message,
                published_at=v.published_at
            )
            for v in variants
        ]
    )

@router.post("/{post_id}/approve", response_model=PostResponse)
async def approve_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Post).where(Post.id == post_id)
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.scheduled_at and post.scheduled_at > datetime.now(timezone.utc):
        post.status = "scheduled"
        sched = ScheduledPost(post_id=post.id, run_at=post.scheduled_at, status="pending")
        db.add(sched)
    else:
        post.status = "published"
        await scheduler_service.publish_post(db, post)
        post.published_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(post)

    return PostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        post_type=post.post_type,
        platforms=json.loads(post.platforms_json or "[]"),
        media_urls=json.loads(post.media_urls_json or "[]"),
        poll_options=json.loads(post.poll_options_json or "[]"),
        status=post.status,
        scheduled_at=post.scheduled_at,
        published_at=post.published_at,
        created_at=post.created_at
    )

@router.post("/{post_id}/duplicate", response_model=PostResponse)
async def duplicate_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Post).where(Post.id == post_id)
    res = await db.execute(stmt)
    orig = res.scalar_one_or_none()
    if not orig:
        raise HTTPException(status_code=404, detail="Post not found")

    copy_post = Post(
        title=f"{orig.title or 'Post'} (Copy)",
        content=orig.content,
        post_type=orig.post_type,
        platforms_json=orig.platforms_json,
        account_ids_json=orig.account_ids_json,
        media_urls_json=orig.media_urls_json,
        poll_options_json=orig.poll_options_json,
        status="draft",
        idempotency_key=str(uuid.uuid4()),
        created_by=user.id
    )
    db.add(copy_post)
    await db.commit()
    await db.refresh(copy_post)

    return PostResponse(
        id=copy_post.id,
        title=copy_post.title,
        content=copy_post.content,
        post_type=copy_post.post_type,
        platforms=json.loads(copy_post.platforms_json or "[]"),
        media_urls=json.loads(copy_post.media_urls_json or "[]"),
        poll_options=json.loads(copy_post.poll_options_json or "[]"),
        status=copy_post.status,
        scheduled_at=None,
        published_at=None,
        created_at=copy_post.created_at
    )

@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Post).where(Post.id == post_id)
    res = await db.execute(stmt)
    post = res.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    await db.delete(post)
    await db.commit()
    return {"status": "deleted", "post_id": post_id}
