from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Auth
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    timezone: str = "UTC"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    timezone: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Accounts
class ConnectAccountRequest(BaseModel):
    platform: str
    account_name: str
    auth_token_or_code: Optional[str] = "mock_token"
    timezone: Optional[str] = "UTC"
    metadata: Optional[Dict[str, Any]] = None

class SocialAccountResponse(BaseModel):
    id: str
    platform: str
    account_name: str
    account_id: str
    status: str
    timezone: str
    connected_at: datetime
    last_sync: Optional[datetime] = None
    metadata: Dict[str, Any] = {}

# Posts
class CreatePostRequest(BaseModel):
    title: Optional[str] = None
    content: str
    post_type: str = "TEXT" # TEXT, IMAGE, VIDEO, CAROUSEL, LINK, POLL
    platforms: List[str] = Field(default_factory=list)
    account_ids: List[str] = Field(default_factory=list)
    media_urls: List[str] = Field(default_factory=list)
    poll_options: List[str] = Field(default_factory=list)
    status: str = "draft" # draft, published, scheduled, pending_approval
    scheduled_at: Optional[datetime] = None
    idempotency_key: Optional[str] = None

class PostVariantResponse(BaseModel):
    id: str
    platform: str
    adapted_content: str
    status: str
    external_post_id: Optional[str] = None
    error_message: Optional[str] = None
    published_at: Optional[datetime] = None

class PostResponse(BaseModel):
    id: str
    title: Optional[str] = None
    content: str
    post_type: str
    platforms: List[str]
    media_urls: List[str]
    poll_options: List[str]
    status: str
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: datetime
    variants: List[PostVariantResponse] = []

# Recurring Schedule
class CreateRecurringScheduleRequest(BaseModel):
    title: str
    content_template: str
    post_type: str = "TEXT"
    platforms: List[str]
    schedule_type: str = "daily" # daily, twice_daily, weekly, monthly, cron
    cron_expression: Optional[str] = None
    days_of_week: List[str] = Field(default_factory=list)
    times_of_day: List[str] = Field(default_factory=lambda: ["09:00"])
    timezone: str = "UTC"

# Queue
class QueueItemResponse(BaseModel):
    id: str
    post_id: str
    queue_order: int
    status: str
    scheduled_slot: Optional[datetime] = None
    published_at: Optional[datetime] = None
    post: Optional[PostResponse] = None

# Inbox
class SendMessageRequest(BaseModel):
    account_id: str
    platform: str
    recipient_id: str
    content: str

class ReplyCommentRequest(BaseModel):
    comment_id: str
    account_id: str
    platform: str
    reply_text: str

# Automation
class AutomationRuleRequest(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    conditions: List[Dict[str, Any]] = Field(default_factory=list)
    actions: List[Dict[str, Any]] = Field(default_factory=list)
    is_active: bool = True

# AI Requests
class AIGeneratePostRequest(BaseModel):
    idea: str
    tone: str = "engaging"
    platforms: Optional[List[str]] = None

class AIRewriteRequest(BaseModel):
    content: str
    instruction: str = "rewrite"

class AIRepurposeRequest(BaseModel):
    source_text: str
    source_type: str = "article"

# Template
class TemplateRequest(BaseModel):
    name: str
    platform: str = "all"
    content: str
    hashtags: List[str] = Field(default_factory=list)
    cta: Optional[str] = None
    variables: List[str] = Field(default_factory=list)
