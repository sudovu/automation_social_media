import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)
    participant_id = Column(String(255), nullable=False)
    participant_name = Column(String(255), nullable=False)
    status = Column(String(50), default="unread", nullable=False) # unread, read, waiting, replied, escalated, closed
    last_message_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    summary = Column(Text, nullable=True)
    customer_wants = Column(Text, nullable=True)
    customer_asked = Column(Text, nullable=True)
    suggested_action = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=True, index=True)
    account_id = Column(String(36), ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    external_id = Column(String(255), nullable=True)
    sender_id = Column(String(255), nullable=False)
    sender_name = Column(String(255), nullable=False)
    direction = Column(String(20), default="incoming", nullable=False) # incoming, outgoing
    content = Column(Text, nullable=False)
    status = Column(String(50), default="unread", nullable=False) # unread, read, waiting, replied, escalated, closed
    is_auto_reply = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    post_id = Column(String(36), nullable=True, index=True) # internal post ID or external post ID
    external_id = Column(String(255), nullable=True)
    author_name = Column(String(255), nullable=False)
    author_id = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    sentiment = Column(String(50), default="neutral", nullable=False) # positive, neutral, negative
    status = Column(String(50), default="pending", nullable=False) # pending, replied, hidden, flagged, reviewed
    reply_content = Column(Text, nullable=True)
    replied_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

class Mention(Base):
    __tablename__ = "mentions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("social_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    external_id = Column(String(255), nullable=True)
    author_name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(50), default="unread", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
