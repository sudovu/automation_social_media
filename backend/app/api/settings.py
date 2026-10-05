import json
from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.analytics_and_reports import SystemSetting
from app.config import settings
from app.api.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(SystemSetting).where(SystemSetting.key == "system_config")
    res = await db.execute(stmt)
    setting = res.scalar_one_or_none()

    if setting:
        return json.loads(setting.value_json)

    # Defaults from config
    return {
        "timezone": settings.DEFAULT_TIMEZONE,
        "business_hours_start": settings.BUSINESS_HOURS_START,
        "business_hours_end": settings.BUSINESS_HOURS_END,
        "business_days": settings.BUSINESS_DAYS.split(","),
        "ai_provider": settings.AI_PROVIDER,
        "ai_default_mode": settings.AI_DEFAULT_MODE,
        "max_messages_per_hour": settings.MAX_MESSAGES_PER_HOUR,
        "max_posts_per_day": settings.MAX_POSTS_PER_DAY,
        "global_cooldown_seconds": settings.GLOBAL_COOLDOWN_SECONDS,
        "auto_reply_loop_limit": settings.AUTO_REPLY_LOOP_LIMIT
    }

@router.put("")
async def update_settings(
    updated_values: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(SystemSetting).where(SystemSetting.key == "system_config")
    res = await db.execute(stmt)
    setting = res.scalar_one_or_none()

    if not setting:
        setting = SystemSetting(key="system_config", value_json=json.dumps(updated_values))
        db.add(setting)
    else:
        current = json.loads(setting.value_json or "{}")
        current.update(updated_values)
        setting.value_json = json.dumps(current)

    await db.commit()
    return {"status": "saved", "settings": updated_values}
