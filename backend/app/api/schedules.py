import json
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.post import RecurringSchedule
from app.schemas import CreateRecurringScheduleRequest
from app.scheduler.service import compute_next_run
from app.api.auth import get_current_user

router = APIRouter(prefix="/schedules", tags=["Recurring Schedules"])

@router.get("/recurring")
async def list_recurring_schedules(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(RecurringSchedule).order_by(RecurringSchedule.created_at.desc())
    res = await db.execute(stmt)
    schedules = res.scalars().all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "content_template": s.content_template,
            "post_type": s.post_type,
            "platforms": json.loads(s.platforms_json or "[]"),
            "schedule_type": s.schedule_type,
            "cron_expression": s.cron_expression,
            "days_of_week": json.loads(s.days_of_week_json or "[]"),
            "times_of_day": json.loads(s.times_of_day_json or "[]"),
            "timezone": s.timezone,
            "is_active": s.is_active,
            "last_run": s.last_run,
            "next_run": s.next_run,
            "created_at": s.created_at
        }
        for s in schedules
    ]

@router.post("/recurring")
async def create_recurring_schedule(
    req: CreateRecurringScheduleRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    next_dt = compute_next_run(
        schedule_type=req.schedule_type,
        cron_expr=req.cron_expression,
        times_of_day=req.times_of_day,
        days_of_week=req.days_of_week,
        from_time=now
    )

    sched = RecurringSchedule(
        title=req.title,
        content_template=req.content_template,
        post_type=req.post_type,
        platforms_json=json.dumps(req.platforms),
        schedule_type=req.schedule_type,
        cron_expression=req.cron_expression,
        days_of_week_json=json.dumps(req.days_of_week),
        times_of_day_json=json.dumps(req.times_of_day),
        timezone=req.timezone,
        is_active=True,
        next_run=next_dt
    )
    db.add(sched)
    await db.commit()
    await db.refresh(sched)
    return {"status": "created", "id": sched.id, "next_run": sched.next_run}

@router.post("/recurring/{schedule_id}/toggle")
async def toggle_recurring_schedule(
    schedule_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(RecurringSchedule).where(RecurringSchedule.id == schedule_id)
    res = await db.execute(stmt)
    sched = res.scalar_one_or_none()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")

    sched.is_active = not sched.is_active
    await db.commit()
    return {"status": "updated", "is_active": sched.is_active}

@router.delete("/recurring/{schedule_id}")
async def delete_recurring_schedule(
    schedule_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(RecurringSchedule).where(RecurringSchedule.id == schedule_id)
    res = await db.execute(stmt)
    sched = res.scalar_one_or_none()
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")

    await db.delete(sched)
    await db.commit()
    return {"status": "deleted"}
