import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import AsyncSessionLocal
from app.models import (
    Post, 
    ScheduledPost, 
    RecurringSchedule, 
    ContentQueueItem, 
    SocialAccount,
    Notification,
    Report,
    AnalyticsMetric
)
from app.connectors.registry import get_connector
from app.connectors.base import PostPayload
from app.scheduler.service import compute_next_run, scheduler_service
from app.automation.engine import is_automations_paused
from app.security import decrypt_secret

logger = logging.getLogger("worker.tasks")

async def task_process_due_posts() -> Dict[str, Any]:
    """Scans and publishes due scheduled posts with retries and exponential backoff."""
    if is_automations_paused():
        return {"status": "paused"}

    async with AsyncSessionLocal() as session:
        await scheduler_service.process_due_posts(session)
    return {"status": "completed"}

async def task_process_recurring_schedules() -> Dict[str, Any]:
    """Generates and schedules posts from active recurring templates."""
    if is_automations_paused():
        return {"status": "paused"}

    async with AsyncSessionLocal() as session:
        await scheduler_service.process_recurring_schedules(session)
    return {"status": "completed"}

async def task_process_content_queue() -> Dict[str, Any]:
    """Publishes next queued item."""
    if is_automations_paused():
        return {"status": "paused"}

    async with AsyncSessionLocal() as session:
        await scheduler_service.process_content_queue(session)
    return {"status": "completed"}

async def task_sync_channel_metrics() -> Dict[str, Any]:
    """Periodically fetches channel engagement metrics and stores historical telemetry."""
    if is_automations_paused():
        return {"status": "paused"}

    async with AsyncSessionLocal() as session:
        stmt = select(SocialAccount).where(SocialAccount.is_active == True)
        res = await session.execute(stmt)
        accounts = res.scalars().all()

        synced_count = 0
        for acc in accounts:
            try:
                connector = get_connector(acc.platform, access_token=decrypt_secret(acc.access_token_enc))
                caps = connector.get_capabilities()
                if caps.analytics:
                    m = await connector.get_analytics()
                    metric = AnalyticsMetric(
                        account_id=acc.id,
                        platform=acc.platform,
                        metric_date=datetime.now(timezone.utc),
                        followers=m.followers,
                        impressions=m.impressions,
                        reach=m.reach,
                        engagement=m.engagement,
                        likes=m.likes,
                        comments=m.comments,
                        shares=m.shares,
                        clicks=m.clicks,
                        views=m.views,
                        engagement_rate=m.engagement_rate
                    )
                    session.add(metric)
                    acc.last_sync = datetime.now(timezone.utc)
                    synced_count += 1
            except Exception as e:
                logger.error(f"Failed to sync metrics for {acc.platform} ({acc.account_name}): {e}")

        await session.commit()
    return {"status": "completed", "accounts_synced": synced_count}

async def task_refresh_expiring_tokens() -> Dict[str, Any]:
    now = datetime.now(timezone.utc)
    threshold = now + timedelta(days=3)
    async with AsyncSessionLocal() as session:
        stmt = select(SocialAccount).where(
            SocialAccount.is_active == True,
            SocialAccount.token_expiry != None
        )
        res = await session.execute(stmt)
        all_accounts = res.scalars().all()
        expiring = [
            acc for acc in all_accounts
            if acc.token_expiry and (
                (acc.token_expiry.tzinfo and acc.token_expiry <= threshold) or
                (not acc.token_expiry.tzinfo and acc.token_expiry <= threshold.replace(tzinfo=None))
            )
        ]

        refreshed = 0
        for acc in expiring:
            try:
                acc_token = decrypt_secret(acc.access_token_enc) if acc.access_token_enc else None
                ref_token = decrypt_secret(acc.refresh_token_enc) if acc.refresh_token_enc else None
                connector = get_connector(acc.platform, access_token=acc_token, refresh_token=ref_token)
                ref = await connector.refresh_access_token()
                if ref.get("access_token"):
                    acc.status = "connected"
                    acc.last_sync = datetime.now(timezone.utc)
                    refreshed += 1
                else:
                    logger.warning(f"Refresh token returned non-access token response: {ref}")
            except Exception as e:
                logger.exception(f"Failed to refresh token: {e}")
                acc.status = "reauth_required"
                session.add(Notification(
                    title=f"Reauthorization Required ({acc.platform.capitalize()})",
                    message=f"Token refresh failed for account {acc.account_name}. Please re-authenticate.",
                    notification_type="token_expired",
                    severity="error"
                ))
        await session.commit()
    return {"status": "completed", "tokens_refreshed": refreshed}
