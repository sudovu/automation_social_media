import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    post_type = Column(String(50), default="TEXT", nullable=False) # TEXT, IMAGE, VIDEO, CAROUSEL, LINK, POLL
    poll_options_json = Column(Text, default="[]", nullable=False)
    platforms_json = Column(Text, default="[]", nullable=False) # JSON list e.g. ["twitter", "linkedin"]
    account_ids_json = Column(Text, default="[]", nullable=False) # Specific social account IDs
    media_urls_json = Column(Text, default="[]", nullable=False) # JSON list of URLs
    status = Column(String(50), default="draft", nullable=False, index=True) # draft, pending_approval, approved, scheduled, published, failed, cancelled
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    idempotency_key = Column(String(128), unique=True, nullable=True, index=True)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    variants = relationship("PostVariant", back_populates="post", cascade="all, delete-orphan")

class PostVariant(Base):
    __tablename__ = "post_variants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    account_id = Column(String(36), nullable=True)
    adapted_content = Column(Text, nullable=False)
    media_urls_json = Column(Text, default="[]", nullable=False)
    status = Column(String(50), default="pending", nullable=False) # pending, published, failed
    external_post_id = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)

    post = relationship("Post", back_populates="variants")

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    run_at = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(50), default="pending", nullable=False, index=True) # pending, running, completed, failed
    attempts = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class RecurringSchedule(Base):
    __tablename__ = "recurring_schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    content_template = Column(Text, nullable=False)
    post_type = Column(String(50), default="TEXT", nullable=False)
    platforms_json = Column(Text, default="[]", nullable=False)
    account_ids_json = Column(Text, default="[]", nullable=False)
    schedule_type = Column(String(50), default="daily", nullable=False) # daily, twice_daily, weekly, monthly, cron
    cron_expression = Column(String(100), nullable=True)
    days_of_week_json = Column(Text, default="[]", nullable=False) # e.g. ["Monday", "Wednesday", "Friday"]
    times_of_day_json = Column(Text, default='["09:00"]', nullable=False) # e.g. ["09:00", "18:00"]
    timezone = Column(String(100), default="UTC", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_run = Column(DateTime(timezone=True), nullable=True)
    next_run = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
