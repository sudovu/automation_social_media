import json
from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models.queue import ContentQueueItem
from app.models.post import Post
from app.schemas import QueueItemResponse, PostResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/queue", tags=["Content Queue"])

@router.get("", response_model=List[QueueItemResponse])
async def get_queue(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(ContentQueueItem).order_by(ContentQueueItem.queue_order.asc())
    res = await db.execute(stmt)
    items = res.scalars().all()

    results = []
    for it in items:
        post_stmt = select(Post).where(Post.id == it.post_id)
        post_res = await db.execute(post_stmt)
        post = post_res.scalar_one_or_none()

        post_data = None
        if post:
            post_data = PostResponse(
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

        results.append(
            QueueItemResponse(
                id=it.id,
                post_id=it.post_id,
                queue_order=it.queue_order,
                status=it.status,
                scheduled_slot=it.scheduled_slot,
                published_at=it.published_at,
                post=post_data
            )
        )
    return results

@router.post("/add/{post_id}")
async def add_post_to_queue(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    # Determine next order number
    stmt = select(ContentQueueItem).order_by(ContentQueueItem.queue_order.desc()).limit(1)
    res = await db.execute(stmt)
    last = res.scalar_one_or_none()
    next_order = (last.queue_order + 1) if last else 1

    item = ContentQueueItem(
        post_id=post_id,
        queue_order=next_order,
        status="queued"
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"status": "queued", "id": item.id, "order": next_order}

@router.post("/reorder")
async def reorder_queue(
    order_mapping: List[str], # list of item IDs in desired order
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    for idx, item_id in enumerate(order_mapping):
        stmt = update(ContentQueueItem).where(ContentQueueItem.id == item_id).values(queue_order=idx + 1)
        await db.execute(stmt)
    await db.commit()
    return {"status": "reordered"}

@router.post("/{item_id}/skip")
async def skip_queue_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(ContentQueueItem).where(ContentQueueItem.id == item_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    item.status = "skipped"
    await db.commit()
    return {"status": "skipped", "item_id": item_id}

@router.delete("/{item_id}")
async def delete_queue_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(ContentQueueItem).where(ContentQueueItem.id == item_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    await db.delete(item)
    await db.commit()
    return {"status": "deleted"}
