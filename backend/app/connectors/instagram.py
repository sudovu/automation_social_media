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

class InstagramConnector(SocialConnector):
    """
    Instagram Graph API for Professional & Creator Accounts.
    Officially requires image/video for publishing; text-only posts are unsupported by Instagram API.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="instagram",
            publishing=True,
            scheduled_publishing=True,
            messaging=True,
            comments=True,
            mentions=True,
            analytics=True,
            media_upload=True,
            polls=False,
            carousels=True,
            supported_post_types=["IMAGE", "VIDEO", "CAROUSEL"],
            unsupported_features=[
                "TEXT (Instagram API does not permit text-only posts without media)",
                "POLL (Feed posts do not support native polls via API)"
            ],
            required_permissions=[
                "instagram_basic",
                "instagram_content_publish",
                "instagram_manage_comments",
                "instagram_manage_messages",
                "instagram_manage_insights"
            ],
            rate_limits={"calls_per_hour": 200, "window_hours": 1},
            auth_type="OAuth2"
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
        return {"access_token": self.access_token, "expires_in": 5184000}

    async def get_profile(self) -> ProfileResult:
        return ProfileResult(
            account_id="ig_pro_88712",
            account_name="brand_official_hub",
            display_name="Brand Official",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            followers_count=34200,
            raw_data={"account_type": "BUSINESS"}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "id": "ig_media_1001",
                "caption": "Boost your creative workflow with our new automation templates! 🚀 #marketing #growth",
                "media_type": "IMAGE",
                "media_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "like_count": 512,
                "comments_count": 48
            }
        ]

    async def create_post(self, payload: PostPayload) -> PostResult:
        if payload.post_type == "TEXT" or not payload.media_urls:
            raise UnsupportedFeatureError("Instagram requires at least one image or video for publishing. Text-only feed posts are not supported by the Instagram Graph API.")
        return PostResult(
            success=True,
            post_id=f"ig_post_{int(datetime.now().timestamp())}",
            external_url="https://instagram.com/p/example",
            raw_response={"status": "published", "media_type": payload.post_type}
        )

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        if payload.post_type == "TEXT" or not payload.media_urls:
            raise UnsupportedFeatureError("Instagram requires at least one image or video for publishing.")
        return PostResult(
            success=True,
            post_id=f"ig_sched_{int(scheduled_time.timestamp())}",
            raw_response={"scheduled": True}
        )

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        return [
            CommentItem(
                id="ig_comm_501",
                post_id=post_id or "ig_media_1001",
                author_name="sarah_designs",
                author_id="ig_u_992",
                content="How much does this plan cost per month?",
                created_at=datetime.now(timezone.utc)
            )
        ]

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        return True

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        return [
            MessageItem(
                id="ig_dm_601",
                sender_id="ig_u_992",
                sender_name="sarah_designs",
                content="Hello! Can we schedule a quick demo call?",
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
            followers=34200,
            impressions=128000,
            reach=94500,
            engagement=8420,
            likes=6900,
            comments=1120,
            shares=400,
            views=45000,
            clicks=1850,
            engagement_rate=6.2
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"media_id": "ig_container_987", "url": file_path_or_url}
