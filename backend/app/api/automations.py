import json
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.automation import AutomationRule, AutomationRun
from app.schemas import AutomationRuleRequest
from app.automation.engine import automation_engine
from app.api.auth import get_current_user

router = APIRouter(prefix="/automations", tags=["Automation Rules"])

@router.get("/rules")
async def list_rules(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(AutomationRule).order_by(desc(AutomationRule.created_at))
    res = await db.execute(stmt)
    rules = res.scalars().all()

    # Pre-populate sensible defaults if empty
    if not rules:
        r1 = AutomationRule(
            name="Instant Pricing Auto-Reply",
            description="Replies automatically whenever a user asks about price or cost.",
            trigger_type="keyword_detected",
            conditions_json=json.dumps([
                {"type": "keyword", "keyword": "price", "match_type": "contains"}
            ]),
            actions_json=json.dumps([
                {
                    "type": "send_reply",
                    "text": "Thank you for reaching out! Check out our latest pricing plans at https://example.com/pricing or let us know your requirements."
                }
            ]),
            is_active=True
        )
        r2 = AutomationRule(
            name="After-Hours Offline Responder",
            description="Sends polite offline notice during weekends and outside 09:00-18:00.",
            trigger_type="business_hours_offline",
            conditions_json=json.dumps([
                {"type": "business_hours_offline"}
            ]),
            actions_json=json.dumps([
                {
                    "type": "offline_reply",
                    "text": "Thank you for contacting us. We are currently offline. Our team will review your message and reply during normal business hours."
                }
            ]),
            is_active=True
        )
        r3 = AutomationRule(
            name="AI Assist: Support Inquiry Draft",
            description="Classifies support messages and drafts suggested AI response for approval.",
            trigger_type="new_message",
            conditions_json=json.dumps([
                {"type": "keyword", "keyword": "help", "match_type": "contains"}
            ]),
            actions_json=json.dumps([
                {"type": "ai_reply", "tone": "empathetic", "mode": "APPROVAL_REQUIRED"}
            ]),
            is_active=True
        )
        db.add_all([r1, r2, r3])
        await db.commit()
        rules = [r1, r2, r3]

    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "trigger_type": r.trigger_type,
            "conditions": json.loads(r.conditions_json or "[]"),
            "actions": json.loads(r.actions_json or "[]"),
            "is_active": r.is_active,
            "execution_count": r.execution_count,
            "last_executed_at": r.last_executed_at,
            "created_at": r.created_at
        }
        for r in rules
    ]

@router.post("/rules")
async def create_rule(
    req: AutomationRuleRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    rule = AutomationRule(
        name=req.name,
        description=req.description,
        trigger_type=req.trigger_type,
        conditions_json=json.dumps(req.conditions),
        actions_json=json.dumps(req.actions),
        is_active=req.is_active
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return {"status": "created", "id": rule.id}

@router.put("/rules/{rule_id}")
async def update_rule(
    rule_id: str,
    req: AutomationRuleRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(AutomationRule).where(AutomationRule.id == rule_id)
    res = await db.execute(stmt)
    rule = res.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    rule.name = req.name
    rule.description = req.description
    rule.trigger_type = req.trigger_type
    rule.conditions_json = json.dumps(req.conditions)
    rule.actions_json = json.dumps(req.actions)
    rule.is_active = req.is_active
    await db.commit()
    return {"status": "updated", "id": rule.id}

@router.post("/rules/{rule_id}/toggle")
async def toggle_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(AutomationRule).where(AutomationRule.id == rule_id)
    res = await db.execute(stmt)
    rule = res.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    rule.is_active = not rule.is_active
    await db.commit()
    return {"status": "toggled", "is_active": rule.is_active}

@router.delete("/rules/{rule_id}")
async def delete_rule(
    rule_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(AutomationRule).where(AutomationRule.id == rule_id)
    res = await db.execute(stmt)
    rule = res.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    await db.delete(rule)
    await db.commit()
    return {"status": "deleted"}

@router.get("/runs")
async def list_runs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(AutomationRun).order_by(desc(AutomationRun.executed_at)).limit(limit)
    res = await db.execute(stmt)
    runs = res.scalars().all()
    return [
        {
            "id": run.id,
            "rule_id": run.rule_id,
            "rule_name": run.rule_name,
            "trigger_event": run.trigger_event,
            "platform": run.platform,
            "status": run.status,
            "error_message": run.error_message,
            "execution_log": json.loads(run.execution_log_json or "{}"),
            "executed_at": run.executed_at
        }
        for run in runs
    ]
