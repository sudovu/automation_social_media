import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    platform = Column(String(50), nullable=False, index=True) # facebook, instagram, twitter, etc.
    account_name = Column(String(255), nullable=False)
    account_id = Column(String(255), nullable=False) # External ID on platform
    access_token_enc = Column(Text, nullable=True) # Encrypted
    refresh_token_enc = Column(Text, nullable=True) # Encrypted
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="connected", nullable=False) # connected, expiring, reauth_required, disconnected
    timezone = Column(String(100), default="UTC", nullable=False)
    connected_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_sync = Column(DateTime(timezone=True), nullable=True)
    metadata_json = Column(Text, default="{}", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
