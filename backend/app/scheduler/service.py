import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from croniter import croniter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import AsyncSessionLocal
from app.models import Post, PostVariant, ScheduledPost, RecurringSchedule, ContentQueueItem, Notification
from app.connectors.registry import get_connector
from app.connectors.base import PostPayload, UnsupportedFeatureError
from app.automation.engine import is_automations_paused

def compute_next_run(
    schedule_type: str,
    cron_expr: Optional[str] = None,
    times_of_day: Optional[List[str]] = None,
    days_of_week: Optional[List[str]] = None,
    from_time: Optional[datetime] = None
) -> datetime:
    """Calculates next execution datetime in UTC based on schedule parameters."""
    base = from_time or datetime.now(timezone.utc)

    if schedule_type == "cron" and cron_expr:
        try:
            itr = croniter(cron_expr, base)
            return itr.get_next(datetime)
        except Exception:
            return base + timedelta(days=1)

    if schedule_type == "every_6_hours":
        return base + timedelta(hours=6)

    if schedule_type == "every_12_hours":
        return base + timedelta(hours=12)

    times = times_of_day or ["09:00"]
    # Sort times
    parsed_times = []
    for t_str in times:
        try:
            h, m = map(int, t_str.split(":"))
            parsed_times.append((h, m))
        except Exception:
            parsed_times.append((9, 0))
    parsed_times.sort()

    if schedule_type in ["daily", "twice_daily", "three_times_daily"]:
        # Find the next time today or advance to tomorrow
        for h, m in parsed_times:
            candidate = base.replace(hour=h, minute=m, second=0, microsecond=0)
            if candidate > base:
                return candidate
        # None today, take first time tomorrow
        h, m = parsed_times[0]
        return (base + timedelta(days=1)).replace(hour=h, minute=m, second=0, microsecond=0)

    if schedule_type == "weekly":
        target_days = [d.capitalize() for d in (days_of_week or ["Monday"])]
        # Scan up to 7 days ahead
        for day_offset in range(1, 8):
            cand_day = base + timedelta(days=day_offset)
            if cand_day.strftime("%A") in target_days:
                h, m = parsed_times[0]
                return cand_day.replace(hour=h, minute=m, second=0, microsecond=0)

    # Default fallback: 24 hours ahead
    return base + timedelta(days=1)

class SchedulerService:
    """Core scheduler & background execution orchestrator."""

    def __init__(self):
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._scheduler_loop())

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()

    async def _scheduler_loop(self):
        """Polls due scheduled items every 15 seconds."""
        while self._running:
            try:
                if not is_automations_paused():
                    async with AsyncSessionLocal() as session:
                        await self.process_due_posts(session)
                        await self.process_recurring_schedules(session)
                        await self.process_content_queue(session)
            except Exception as e:
                pass
            await asyncio.sleep(15)

    async def process_due_posts(self, session: AsyncSession):
        """Processes scheduled posts whose run_at timestamp has passed."""
        now = datetime.now(timezone.utc)
        stmt = select(ScheduledPost).where(
            ScheduledPost.status == "pending",
            ScheduledPost.run_at <= now
        ).limit(10)
        res = await session.execute(stmt)
        due_items = res.scalars().all()

        for item in due_items:
            item.status = "running"
            item.attempts += 1
            await session.commit()

            # Fetch the associated post
            post_stmt = select(Post).where(Post.id == item.post_id)
            post_res = await session.execute(post_stmt)
            post = post_res.scalar_one_or_none()

            if not post:
                item.status = "failed"
                item.error_message = "Post not found"
                await session.commit()
                continue

            # Publish the post
            success, err = await self.publish_post(session, post)
            if success:
                item.status = "completed"
                post.status = "published"
                post.published_at = datetime.now(timezone.utc)
                # Notification
                notif = Notification(
                    title="Post Published",
                    message=f"Post '{post.title or post.content[:40]}' was successfully published.",
                    notification_type="post_published",
                    severity="success"
                )
                session.add(notif)
            else:
                if item.attempts >= 3:
                    item.status = "failed" # Dead-letter
                    post.status = "failed"
                    notif = Notification(
                        title="Post Publishing Failed (Dead-letter)",
                        message=f"Post failed after 3 attempts: {err}",
                        notification_type="post_failed",
                        severity="error"
                    )
                    session.add(notif)
                else:
                    item.status = "pending" # Exponential backoff
                    item.run_at = datetime.now(timezone.utc) + timedelta(minutes=2 ** item.attempts)
                item.error_message = err

            await session.commit()

    async def publish_post(self, session: AsyncSession, post: Post) -> Tuple[bool, Optional[str]]:
        """Publishes post across all its configured platforms using connectors."""
        platforms = json.loads(post.platforms_json or "[]")
        media_urls = json.loads(post.media_urls_json or "[]")
        poll_options = json.loads(post.poll_options_json or "[]")

        if not platforms:
            return False, "No platforms selected for post"

        all_success = True
        errors = []

        for plat in platforms:
            try:
                connector = get_connector(plat)
                payload = PostPayload(
                    content=post.content,
                    post_type=post.post_type,
                    media_urls=media_urls,
                    poll_options=poll_options
                )
                res = await connector.create_post(payload)

                # Record post variant
                variant = PostVariant(
                    post_id=post.id,
                    platform=plat,
                    adapted_content=post.content,
                    media_urls_json=post.media_urls_json,
                    status="published" if res.success else "failed",
                    external_post_id=res.post_id,
                    error_message=res.error_message,
                    published_at=datetime.now(timezone.utc) if res.success else None
                )
                session.add(variant)

                if not res.success:
                    all_success = False
                    errors.append(f"{plat}: {res.error_message}")

            except UnsupportedFeatureError as ufe:
                all_success = False
                errors.append(f"{plat}: {ufe.message}")
            except Exception as e:
                all_success = False
                errors.append(f"{plat}: {str(e)}")

        return all_success, "; ".join(errors) if errors else None

    async def process_recurring_schedules(self, session: AsyncSession):
        """Checks recurring schedules and spawns posts when due."""
        now = datetime.now(timezone.utc)
        stmt = select(RecurringSchedule).where(
            RecurringSchedule.is_active == True,
            (RecurringSchedule.next_run <= now) | (RecurringSchedule.next_run == None)
        ).limit(5)
        res = await session.execute(stmt)
        schedules = res.scalars().all()

        for sched in schedules:
            # Create a post from template
            post = Post(
                title=f"{sched.title} - {now.strftime('%Y-%m-%d')}",
                content=sched.content_template,
                post_type=sched.post_type,
                platforms_json=sched.platforms_json,
                account_ids_json=sched.account_ids_json,
                status="published",
                published_at=now
            )
            session.add(post)
            await session.flush()

            # Publish
            await self.publish_post(session, post)

            # Advance schedule
            times = json.loads(sched.times_of_day_json or '["09:00"]')
            days = json.loads(sched.days_of_week_json or '[]')
            sched.last_run = now
            sched.next_run = compute_next_run(
                schedule_type=sched.schedule_type,
                cron_expr=sched.cron_expression,
                times_of_day=times,
                days_of_week=days,
                from_time=now
            )
        await session.commit()

    async def process_content_queue(self, session: AsyncSession):
        """Picks the next queued post and publishes if ready."""
        stmt = select(ContentQueueItem).where(
            ContentQueueItem.status == "queued"
        ).order_by(ContentQueueItem.queue_order.asc()).limit(1)
        res = await session.execute(stmt)
        item = res.scalar_one_or_none()

        if item and item.scheduled_slot and item.scheduled_slot <= datetime.now(timezone.utc):
            item.status = "processing"
            await session.commit()

            post_stmt = select(Post).where(Post.id == item.post_id)
            post_res = await session.execute(post_stmt)
            post = post_res.scalar_one_or_none()

            if post:
                success, err = await self.publish_post(session, post)
                if success:
                    item.status = "completed"
                    item.published_at = datetime.now(timezone.utc)
                    post.status = "published"
                    post.published_at = datetime.now(timezone.utc)
                else:
                    item.status = "failed"
                    item.error_message = err
            await session.commit()

scheduler_service = SchedulerService()
