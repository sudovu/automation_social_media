from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.connectors.base import (
    SocialConnector,
    ConnectorCapabilities,
    PostPayload,
    PostResult,
    ProfileResult,
    CommentItem,
    MessageItem,
    AnalyticsResult,
    UnsupportedFeatureError
)

class WhatsAppConnector(SocialConnector):
    """
    WhatsApp Cloud API / WhatsApp Business Platform.
    Primary focus: Conversational Customer Service, Automated replies, Templates, Webhooks.
    Public timeline publishing is not supported by the WhatsApp Business API.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="whatsapp",
            publishing=False, # WhatsApp has no public social feed API
            scheduled_publishing=False,
            messaging=True,
            comments=False,
            mentions=False,
            analytics=True,
            media_upload=True,
            polls=False,
            carousels=False,
            supported_post_types=[],
            unsupported_features=[
                "PUBLISHING (WhatsApp Business API does not offer a public social timeline or feed)",
                "COMMENTS (WhatsApp is a direct messaging channel without public comments)",
                "MENTIONS (Unsupported by WhatsApp Cloud API)"
            ],
            required_permissions=["whatsapp_business_messaging", "whatsapp_business_management"],
            rate_limits={"messages_per_second": 80, "tier": "100k_conversations_day"},
            auth_type="APIKey"
        )

    async def connect(self, auth_code_or_token: str) -> Dict[str, Any]:
        self.access_token = auth_code_or_token
        profile = await self.get_profile()
        return {
            "status": "connected",
            "account_id": profile.account_id,
            "account_name": profile.account_name,
            "access_token": self.access_token
        }

    async def disconnect(self) -> bool:
        self.access_token = None
        return True

    async def refresh_token(self) -> Dict[str, Any]:
        return {"access_token": self.access_token, "expires_in": None}

    async def get_profile(self) -> ProfileResult:
        return ProfileResult(
            account_id="wa_phone_15550198",
            account_name="+1 (555) 019-8234",
            display_name="Enterprise Customer Support",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
            followers_count=0,
            raw_data={"verified_name": "Enterprise Support", "quality_rating": "GREEN"}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        raise UnsupportedFeatureError("Not supported by this platform API. WhatsApp has no public feed posts.")

    async def create_post(self, payload: PostPayload) -> PostResult:
        raise UnsupportedFeatureError("Not supported by this platform API. WhatsApp Business does not support public wall or feed publishing.")

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        raise UnsupportedFeatureError("Not supported by this platform API. WhatsApp has no public wall posts.")

    async def delete_post(self, post_id: str) -> bool:
        raise UnsupportedFeatureError("Not supported by this platform API.")

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        raise UnsupportedFeatureError("Not supported by this platform API. WhatsApp has no public comment threads.")

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        raise UnsupportedFeatureError("Not supported by this platform API. WhatsApp has no public comment threads.")

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        return [
            MessageItem(
                id="wa_msg_109",
                sender_id="+15559876543",
                sender_name="John Doe",
                content="Hello, I would like to inquire about your enterprise plan options.",
                created_at=datetime.now(timezone.utc),
                direction="incoming"
            )
        ]

    async def send_message(self, recipient_id: str, text: str) -> bool:
        return True

    async def get_mentions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_analytics(self) -> AnalyticsResult:
        return AnalyticsResult(
            followers=0,
            impressions=4200,
            reach=3800,
            engagement=3800,
            likes=0,
            comments=0,
            shares=0,
            views=4200,
            clicks=1200,
            engagement_rate=90.4,
            raw_metrics={"conversations_initiated": 420, "service_conversations": 380}
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"id": "wa_media_7719", "url": file_path_or_url}
