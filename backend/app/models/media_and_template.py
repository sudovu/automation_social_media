import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class MediaItem(Base):
    __tablename__ = "media_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False, index=True) # SHA-256 to avoid duplicates
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False) # bytes
    tags_json = Column(Text, default="[]", nullable=False)
    folder = Column(String(100), default="default", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

class Template(Base):
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    platform = Column(String(50), default="all", nullable=False) # specific platform or 'all'
    content = Column(Text, nullable=False)
    media_urls_json = Column(Text, default="[]", nullable=False)
    hashtags_json = Column(Text, default="[]", nullable=False)
    cta = Column(String(255), nullable=True)
    variables_json = Column(Text, default="[]", nullable=False) # e.g. ["{{name}}", "{{date}}", "{{product}}"]
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
