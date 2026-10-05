from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.automation.engine import is_automations_paused, set_automations_paused
from app.models import AuditLog
from app.api.auth import get_current_user

router = APIRouter(prefix="/emergency", tags=["Emergency Controls"])

@router.get("/status")
async def get_emergency_status(user=Depends(get_current_user)):
    return {"automations_paused": is_automations_paused()}

@router.post("/pause-all")
async def pause_all_automations(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    set_automations_paused(True)
    audit = AuditLog(
        user_id=user.id,
        action="PAUSE_ALL_AUTOMATIONS",
        resource_type="system",
        resource_id="global"
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "automations_paused": True, "message": "All automations and posting queues paused immediately."}

@router.post("/resume-all")
async def resume_all_automations(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    set_automations_paused(False)
    audit = AuditLog(
        user_id=user.id,
        action="RESUME_ALL_AUTOMATIONS",
        resource_type="system",
        resource_id="global"
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "automations_paused": False, "message": "Automations and background queues resumed."}

@router.post("/stop-all")
async def stop_all_automations(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    set_automations_paused(True)
    audit = AuditLog(
        user_id=user.id,
        action="STOP_ALL_AUTOMATIONS",
        resource_type="system",
        resource_id="global"
    )
    db.add(audit)
    await db.commit()
    return {"status": "success", "automations_paused": True, "message": "Emergency shutdown: All active rules and scheduled runs aborted."}
