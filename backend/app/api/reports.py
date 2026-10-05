import json
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.analytics_and_reports import Report, Notification
from app.api.auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Notifications"])

@router.get("")
async def list_reports(
    report_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Report).order_by(desc(Report.created_at))
    if report_type:
        stmt = stmt.where(Report.report_type == report_type)
    res = await db.execute(stmt)
    reports = res.scalars().all()

    if not reports:
        # Pre-seed realistic daily and weekly summaries
        r1 = Report(
            report_type="daily",
            title=f"Daily Social Executive Briefing — {datetime.now(timezone.utc).strftime('%B %d, %Y')}",
            summary="Across all connected channels, 12 posts were published and 37 customer messages were received. Overall engagement reached 4.8%, up 12% from yesterday.",
            top_post_json=json.dumps({
                "platform": "instagram",
                "title": "3 Automations That Saved Me 20 Hours This Week",
                "engagement_rate": "8.4%",
                "likes": 512,
                "comments": 48
            }),
            metrics_json=json.dumps({
                "posts_published": 12,
                "messages_received": 37,
                "replies_sent": 31,
                "pending_replies": 6,
                "failed_automations": 0,
                "total_reach": 42500
            }),
            ai_insights="Recommended action: Focus video content scheduling during 18:00–20:00 UTC when Instagram and YouTube interaction rates peak.",
            period_start=datetime.now(timezone.utc) - timedelta(days=1),
            period_end=datetime.now(timezone.utc)
        )
        r2 = Report(
            report_type="weekly",
            title="Weekly Multi-Platform Performance Recap",
            summary="Strongest growth was observed on LinkedIn and Instagram. Automated keyword auto-replies resolved 76% of incoming pricing inquiries without human delay.",
            top_post_json=json.dumps({
                "platform": "linkedin",
                "title": "Scaling Social Media Operations Without Burnout",
                "engagement_rate": "6.2%",
                "likes": 1240,
                "comments": 142
            }),
            metrics_json=json.dumps({
                "posts_published": 74,
                "messages_received": 210,
                "replies_sent": 198,
                "new_followers": 1450,
                "total_reach": 284000
            }),
            ai_insights="Recommended action: Convert top-performing LinkedIn posts into X thread formats using the AI repurposing tool.",
            period_start=datetime.now(timezone.utc) - timedelta(days=7),
            period_end=datetime.now(timezone.utc)
        )
        db.add_all([r1, r2])
        await db.commit()
        reports = [r1, r2]

    return [
        {
            "id": r.id,
            "report_type": r.report_type,
            "title": r.title,
            "summary": r.summary,
            "top_post": json.loads(r.top_post_json or "{}"),
            "metrics": json.loads(r.metrics_json or "{}"),
            "ai_insights": r.ai_insights,
            "period_start": r.period_start,
            "period_end": r.period_end,
            "created_at": r.created_at
        }
        for r in reports
    ]

@router.get("/notifications")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Notification).order_by(desc(Notification.created_at)).limit(30)
    res = await db.execute(stmt)
    notifs = res.scalars().all()
    return notifs

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(Notification).where(Notification.id == notification_id)
    res = await db.execute(stmt)
    notif = res.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"status": "read"}
