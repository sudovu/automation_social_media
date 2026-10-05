import json
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.inbox import Conversation, Message, Comment, Mention
from app.models.account import SocialAccount
from app.schemas import SendMessageRequest, ReplyCommentRequest
from app.connectors.registry import get_connector
from app.ai.service import ai_service
from app.automation.engine import automation_engine, record_sent_message
from app.api.auth import get_current_user

router = APIRouter(prefix="/inbox", tags=["Unified Inbox"])

@router.get("/conversations")
async def list_conversations(
    status_filter: Optional[str] = Query(None, alias="status"),
    platform_filter: Optional[str] = Query(None, alias="platform"),
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    query = select(Conversation).order_by(desc(Conversation.last_message_at)).limit(limit)
    if status_filter:
        query = query.where(Conversation.status == status_filter)
    if platform_filter:
        query = query.where(Conversation.platform == platform_filter)

    res = await db.execute(query)
    convs = res.scalars().all()

    # Pre-populate sample mock conversation if completely empty
    if not convs:
        sample = Conversation(
            account_id="acc_default",
            platform="instagram",
            participant_id="user_sarah",
            participant_name="Sarah Miller",
            status="unread",
            last_message_at=datetime.now(timezone.utc),
            customer_wants="Pricing and onboarding assistance",
            customer_asked="What are the monthly subscription options?",
            suggested_action="Send pricing sheet or link to plans"
        )
        db.add(sample)
        await db.flush()

        msg = Message(
            conversation_id=sample.id,
            account_id="acc_default",
            platform="instagram",
            sender_id="user_sarah",
            sender_name="Sarah Miller",
            direction="incoming",
            content="Hello! How much does your social automation plan cost per month?",
            status="unread"
        )
        db.add(msg)
        await db.commit()
        await db.refresh(sample)
        convs = [sample]

    return convs

@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/conversations/{conversation_id}/summarize")
async def summarize_conversation_route(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_stmt = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    msg_res = await db.execute(msg_stmt)
    messages = [{"sender": m.sender_name, "content": m.content} for m in msg_res.scalars().all()]

    analysis = await ai_service.summarize_conversation(messages)
    conv.summary = analysis.summary
    conv.customer_wants = analysis.customer_wants
    conv.customer_asked = analysis.customer_asked
    conv.suggested_action = analysis.suggested_action
    await db.commit()
    await db.refresh(conv)

    return analysis.model_dump()

@router.post("/messages/send")
async def send_message_route(
    req: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    connector = get_connector(req.platform)
    await connector.send_message(req.recipient_id, req.content)
    record_sent_message(req.account_id)

    # Store in database
    msg = Message(
        account_id=req.account_id,
        platform=req.platform,
        sender_id=user.id,
        sender_name="Agent / Hub",
        direction="outgoing",
        content=req.content,
        status="replied"
    )
    db.add(msg)
    await db.commit()
    return {"status": "sent", "content": req.content}

@router.get("/comments")
async def list_comments(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Comment).order_by(desc(Comment.created_at)).limit(limit)
    res = await db.execute(stmt)
    comments = res.scalars().all()

    if not comments:
        # Create sample comments for demonstration
        c1 = Comment(
            account_id="acc_default",
            platform="instagram",
            post_id="post_1",
            author_name="alex_dev",
            content="Can this integrate directly with our CRM?",
            sentiment="positive",
            status="pending"
        )
        c2 = Comment(
            account_id="acc_default",
            platform="twitter",
            post_id="post_2",
            author_name="GrowthMarketer",
            content="Super sleek interface! Loving the multi-platform preview feature.",
            sentiment="positive",
            status="pending"
        )
        db.add_all([c1, c2])
        await db.commit()
        comments = [c1, c2]

    return comments

@router.post("/comments/reply")
async def reply_to_comment_route(
    req: ReplyCommentRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    connector = get_connector(req.platform)
    await connector.reply_to_comment(req.comment_id, req.reply_text)

    stmt = select(Comment).where(Comment.id == req.comment_id)
    res = await db.execute(stmt)
    comment = res.scalar_one_or_none()
    if comment:
        comment.status = "replied"
        comment.reply_content = req.reply_text
        comment.replied_at = datetime.now(timezone.utc)
        await db.commit()

    return {"status": "replied", "comment_id": req.comment_id}

@router.get("/mentions")
async def list_mentions(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Mention).order_by(desc(Mention.created_at)).limit(limit)
    res = await db.execute(stmt)
    mentions = res.scalars().all()
    return mentions
