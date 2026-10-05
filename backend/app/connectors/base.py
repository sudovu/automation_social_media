from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class UnsupportedFeatureError(Exception):
    """Raised when an action is not officially permitted or supported by a platform's API."""
    def __init__(self, message: str = "Not supported by this platform API."):
        super().__init__(message)
        self.message = message

class RateLimitError(Exception):
    """Raised when hitting platform rate limits."""
    def __init__(self, message: str = "Platform rate limit reached.", retry_after_seconds: int = 60):
        super().__init__(message)
        self.retry_after_seconds = retry_after_seconds

class ConnectorCapabilities(BaseModel):
    platform: str
    publishing: bool = True
    scheduled_publishing: bool = False
    messaging: bool = False
    comments: bool = False
    mentions: bool = False
    analytics: bool = False
    media_upload: bool = True
    polls: bool = False
    carousels: bool = False
    supported_post_types: List[str] = Field(default_factory=lambda: ["TEXT", "IMAGE"])
    unsupported_features: List[str] = Field(default_factory=list)
    required_permissions: List[str] = Field(default_factory=list)
    rate_limits: Dict[str, Any] = Field(default_factory=dict)
    auth_type: str = "OAuth2" # OAuth2, BotToken, APIKey

class PostPayload(BaseModel):
    content: str
    post_type: str = "TEXT" # TEXT, IMAGE, VIDEO, CAROUSEL, LINK, POLL
    media_urls: List[str] = Field(default_factory=list)
    poll_options: List[str] = Field(default_factory=list)
    link_url: Optional[str] = None
    custom_params: Dict[str, Any] = Field(default_factory=dict)

class PostResult(BaseModel):
    success: bool
    post_id: Optional[str] = None
    external_url: Optional[str] = None
    error_message: Optional[str] = None
    raw_response: Dict[str, Any] = Field(default_factory=dict)

class ProfileResult(BaseModel):
    account_id: str
    account_name: str
    display_name: str
    avatar_url: Optional[str] = None
    followers_count: int = 0
    raw_data: Dict[str, Any] = Field(default_factory=dict)

class CommentItem(BaseModel):
    id: str
    post_id: Optional[str] = None
    author_name: str
    author_id: Optional[str] = None
    content: str
    created_at: Optional[datetime] = None

class MessageItem(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    content: str
    created_at: Optional[datetime] = None
    direction: str = "incoming"

class AnalyticsResult(BaseModel):
    followers: int = 0
    impressions: int = 0
    reach: int = 0
    engagement: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    views: int = 0
    clicks: int = 0
    engagement_rate: float = 0.0
    raw_metrics: Dict[str, Any] = Field(default_factory=dict)

class SocialConnector(ABC):
    """
    Abstract Base Class for all Social Media Connectors.
    All platform-specific implementations adhere to this contract.
    """

    def __init__(self, access_token: Optional[str] = None, refresh_token: Optional[str] = None, config: Optional[Dict[str, Any]] = None):
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.config = config or {}

    @abstractmethod
    def get_capabilities(self) -> ConnectorCapabilities:
        """Returns the capabilities, limits, and supported features of the platform."""
        pass

    @abstractmethod
    async def connect(self, auth_code_or_token: str) -> Dict[str, Any]:
        """Exchanges auth credentials or token to establish connection."""
        pass

    @abstractmethod
    async def disconnect(self) -> bool:
        """Revokes tokens and disconnects account."""
        pass

    @abstractmethod
    async def refresh_token(self) -> Dict[str, Any]:
        """Refreshes expired access token if supported."""
        pass

    @abstractmethod
    async def get_profile(self) -> ProfileResult:
        """Fetches current user/page profile information."""
        pass

    @abstractmethod
    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves published posts from the platform."""
        pass

    @abstractmethod
    async def create_post(self, payload: PostPayload) -> PostResult:
        """Publishes post to the platform immediately."""
        pass

    @abstractmethod
    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        """Schedules post via native API if supported, or indicates delegated scheduling."""
        pass

    @abstractmethod
    async def delete_post(self, post_id: str) -> bool:
        """Deletes a post by ID."""
        pass

    @abstractmethod
    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        """Fetches comments on posts."""
        pass

    @abstractmethod
    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        """Replies to a specific comment."""
        pass

    @abstractmethod
    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        """Retrieves direct messages/inbox items."""
        pass

    @abstractmethod
    async def send_message(self, recipient_id: str, text: str) -> bool:
        """Sends a direct message to a user."""
        pass

    @abstractmethod
    async def get_mentions(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves recent mentions or tags."""
        pass

    @abstractmethod
    async def get_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves platform notifications if supported."""
        pass

    @abstractmethod
    async def get_analytics(self) -> AnalyticsResult:
        """Retrieves account performance metrics."""
        pass

    @abstractmethod
    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        """Uploads media asset to platform storage."""
        pass
