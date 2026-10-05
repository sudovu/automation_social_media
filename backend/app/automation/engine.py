import re
import json
from datetime import datetime, timezone, time
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.config import settings
from app.models import AutomationRule, AutomationRun, Notification, AuditLog
from app.ai.service import ai_service
from app.connectors.registry import get_connector

# Global in-memory safeguards state
SYSTEM_AUTOMATIONS_PAUSED = False
HOURLY_MESSAGE_COUNTS: Dict[str, List[datetime]] = {} # account_id -> list of message timestamps

def is_automations_paused() -> bool:
    return SYSTEM_AUTOMATIONS_PAUSED

def set_automations_paused(paused: bool) -> None:
    global SYSTEM_AUTOMATIONS_PAUSED
    SYSTEM_AUTOMATIONS_PAUSED = paused

def check_rate_limit(account_id: str, max_per_hour: int) -> bool:
    """Verifies that an account has not exceeded the maximum messages per hour."""
    now = datetime.now(timezone.utc)
    timestamps = HOURLY_MESSAGE_COUNTS.get(account_id, [])
    # Keep only timestamps within last 60 minutes
    valid_timestamps = [t for t in timestamps if (now - t).total_seconds() < 3600]
    HOURLY_MESSAGE_COUNTS[account_id] = valid_timestamps
    if len(valid_timestamps) >= max_per_hour:
        return False # Rate limit reached
    return True

def record_sent_message(account_id: str) -> None:
    now = datetime.now(timezone.utc)
    if account_id not in HOURLY_MESSAGE_COUNTS:
        HOURLY_MESSAGE_COUNTS[account_id] = []
    HOURLY_MESSAGE_COUNTS[account_id].append(now)

def is_within_business_hours(user_time: Optional[datetime] = None) -> bool:
    """Checks whether the current time is within configured business hours and days."""
    now = user_time or datetime.now(timezone.utc)
    day_name = now.strftime("%A")
    allowed_days = [d.strip() for d in settings.BUSINESS_DAYS.split(",") if d.strip()]
    if day_name not in allowed_days:
        return False
    
    try:
        start_h, start_m = map(int, settings.BUSINESS_HOURS_START.split(":"))
        end_h, end_m = map(int, settings.BUSINESS_HOURS_END.split(":"))
        start_time = time(start_h, start_m)
        end_time = time(end_h, end_m)
        current_time = now.time()
        return start_time <= current_time <= end_time
    except Exception:
        return True

def evaluate_keyword_condition(text: str, keyword: str, match_type: str = "contains") -> bool:
    """Evaluates keyword rule against input text."""
    if not text or not keyword:
        return False
    t = text.strip().lower()
    k = keyword.strip().lower()

    if match_type == "exact":
        return t == k
    elif match_type == "starts_with":
        return t.startswith(k)
    elif match_type == "regex":
        try:
            return bool(re.search(keyword, text, re.IGNORECASE))
        except Exception:
            return False
    # Default 'contains'
    return k in t

class AutomationEngine:
    """Core Automation Engine: evaluates triggers, tests conditions, executes actions."""

    async def evaluate_incoming_message(
        self,
        db: AsyncSession,
        account_id: str,
        platform: str,
        sender_id: str,
        sender_name: str,
        content: str
    ) -> Dict[str, Any]:
        """
        Executes matching rules for incoming messages/DMs.
        Handles emergency pause, rate-limiting, business hours, and AI response modes.
        """
        if SYSTEM_AUTOMATIONS_PAUSED:
            return {"status": "paused", "reason": "All automations are currently paused via Emergency Control."}

        # Anti-spam safeguard
        if not check_rate_limit(account_id, settings.MAX_MESSAGES_PER_HOUR):
            return {"status": "rate_limited", "reason": "Hourly safeguard limit reached for this account."}

        # Check offline/business hours rule first
        within_hours = is_within_business_hours()
        offline_reply_triggered = False

        # Load active rules for new_message trigger
        stmt = select(AutomationRule).where(
            AutomationRule.is_active == True,
            AutomationRule.trigger_type.in_(["new_message", "keyword_detected", "business_hours_offline"])
        )
        res = await db.execute(stmt)
        rules = res.scalars().all()

        results = []

        for rule in rules:
            try:
                conditions = json.loads(rule.conditions_json or "[]")
                actions = json.loads(rule.actions_json or "[]")

                # Check conditions
                conditions_met = True
                for cond in conditions:
                    c_type = cond.get("type")
                    if c_type == "platform" and cond.get("value") and cond.get("value") != platform:
                        conditions_met = False
                        break
                    if c_type == "account" and cond.get("value") and cond.get("value") != account_id:
                        conditions_met = False
                        break
                    if c_type == "business_hours_offline" and within_hours:
                        # Only triggers if outside business hours
                        conditions_met = False
                        break
                    if c_type == "keyword":
                        kw = cond.get("keyword", "")
                        m_type = cond.get("match_type", "contains")
                        if not evaluate_keyword_condition(content, kw, m_type):
                            conditions_met = False
                            break

                if not conditions_met:
                    continue

                # Execute actions
                action_logs = []
                for action in actions:
                    act_type = action.get("type")
                    if act_type == "send_reply":
                        reply_text = action.get("text", "Thank you for contacting us!")
                        # Send reply via connector
                        try:
                            connector = get_connector(platform)
                            await connector.send_message(sender_id, reply_text)
                            record_sent_message(account_id)
                            action_logs.append({"action": "send_reply", "success": True, "text": reply_text})
                        except Exception as e:
                            action_logs.append({"action": "send_reply", "success": False, "error": str(e)})

                    elif act_type == "offline_reply":
                        offline_text = action.get(
                            "text",
                            "Thank you for contacting us. We are currently offline. Our team will respond during business hours."
                        )
                        try:
                            connector = get_connector(platform)
                            await connector.send_message(sender_id, offline_text)
                            record_sent_message(account_id)
                            action_logs.append({"action": "offline_reply", "success": True, "text": offline_text})
                            offline_reply_triggered = True
                        except Exception as e:
                            action_logs.append({"action": "offline_reply", "success": False, "error": str(e)})

                    elif act_type == "ai_reply":
                        tone = action.get("tone", "professional")
                        mode = action.get("mode", settings.AI_DEFAULT_MODE)
                        ai_res = await ai_service.generate_reply(content, context=f"Sender: {sender_name}", tone=tone, mode=mode)
                        
                        if ai_res.get("can_auto_send"):
                            connector = get_connector(platform)
                            await connector.send_message(sender_id, ai_res["reply"])
                            record_sent_message(account_id)
                            action_logs.append({"action": "ai_reply", "mode": "AUTO_SEND", "sent": True, "reply": ai_res["reply"]})
                        else:
                            # Approval required or suggest only -> create notification
                            notif = Notification(
                                title=f"AI Reply Approval Needed ({platform.capitalize()})",
                                message=f"Sender {sender_name}: '{content[:60]}...'\nSuggested AI response: '{ai_res.get('reply')}'",
                                notification_type="approval_required",
                                severity="info",
                                metadata_json=json.dumps({"sender_id": sender_id, "suggested_reply": ai_res.get("reply"), "account_id": account_id})
                            )
                            db.add(notif)
                            action_logs.append({"action": "ai_reply", "mode": mode, "sent": False, "pending_approval": True, "suggested_reply": ai_res.get("reply")})

                    elif act_type == "send_notification":
                        notif = Notification(
                            title=action.get("title", f"Automation Alert: {rule.name}"),
                            message=action.get("message", f"Event triggered by {sender_name}: {content}"),
                            notification_type="automation_alert",
                            severity=action.get("severity", "info")
                        )
                        db.add(notif)
                        action_logs.append({"action": "send_notification", "success": True})

                # Record rule run
                run_record = AutomationRun(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    trigger_event="new_message",
                    platform=platform,
                    account_id=account_id,
                    status="success",
                    execution_log_json=json.dumps(action_logs)
                )
                db.add(run_record)
                rule.execution_count += 1
                rule.last_executed_at = datetime.now(timezone.utc)
                results.append({"rule_id": rule.id, "rule_name": rule.name, "actions": action_logs})

            except Exception as ex:
                err_record = AutomationRun(
                    rule_id=rule.id,
                    rule_name=rule.name,
                    trigger_event="new_message",
                    platform=platform,
                    account_id=account_id,
                    status="failed",
                    error_message=str(ex),
                    execution_log_json=json.dumps({"error": str(ex)})
                )
                db.add(err_record)

        await db.commit()
        return {"status": "executed", "rules_matched": len(results), "details": results}

automation_engine = AutomationEngine()
