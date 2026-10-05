import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    trigger_type = Column(String(100), nullable=False, index=True) 
    # new_message, new_comment, new_mention, keyword_detected, business_hours_offline, scheduled_time
    conditions_json = Column(Text, default="[]", nullable=False) # JSON array of condition objects
    actions_json = Column(Text, default="[]", nullable=False) # JSON array of action objects
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    execution_count = Column(Integer, default=0, nullable=False)
    last_executed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

class AutomationRun(Base):
    __tablename__ = "automation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_id = Column(String(36), ForeignKey("automation_rules.id", ondelete="SET NULL"), nullable=True, index=True)
    rule_name = Column(String(255), nullable=True)
    trigger_event = Column(String(100), nullable=False)
    platform = Column(String(50), nullable=True)
    account_id = Column(String(36), nullable=True)
    status = Column(String(50), default="success", nullable=False, index=True) # success, failed, skipped, approval_pending
    execution_log_json = Column(Text, default="{}", nullable=False)
    error_message = Column(Text, nullable=True)
    executed_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
