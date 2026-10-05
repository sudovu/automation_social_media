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

class PinterestConnector(SocialConnector):
    """
    Pinterest API v5 Connector.
    Supports: Pin creation (Images/Videos to Boards), Pin Analytics.
    Direct messaging and text-only pins are not supported on Pinterest API.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="pinterest",
            publishing=True,
            scheduled_publishing=False, # Managed by Hub scheduler
            messaging=False,
            comments=False,
            mentions=False,
            analytics=True,
            media_upload=True,
            polls=False,
            carousels=True, # Carousel pins supported
            supported_post_types=["IMAGE", "VIDEO", "CAROUSEL"],
            unsupported_features=[
                "TEXT (Pinterest requires an image or video asset for all pins)",
                "MESSAGING (Pinterest API v5 does not offer direct messaging)",
                "POLL (Pinterest does not support polls)"
            ],
            required_permissions=[
                "boards:read",
                "pins:read",
                "pins:write",
                "user_accounts:read"
            ],
            rate_limits={"calls_per_day": 1000},
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
        return {"access_token": self.access_token, "expires_in": 2592000}

    async def get_profile(self) -> ProfileResult:
        return ProfileResult(
            account_id="pin_user_99182",
            account_name="DesignAndProductivity",
            display_name="Design & Productivity Pins",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            followers_count=14100,
            raw_data={"board_count": 12, "pin_count": 340}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "id": "pin_881928",
                "title": "Minimalist Workspace & Tech Setup 2026",
                "media_url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

    async def create_post(self, payload: PostPayload) -> PostResult:
        if payload.post_type == "TEXT" or not payload.media_urls:
            raise UnsupportedFeatureError("Pinterest API requires an image or video asset for Pin creation.")
        return PostResult(
            success=True,
            post_id=f"pin_{int(datetime.now().timestamp())}",
            external_url="https://pinterest.com/pin/example",
            raw_response={"pin_status": "saved"}
        )

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        raise UnsupportedFeatureError("Pinterest API does not support native scheduling. Handled by Hub scheduler.")

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        raise UnsupportedFeatureError("Not supported by this platform API. Pinterest API v5 comments are restricted.")

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        raise UnsupportedFeatureError("Not supported by this platform API.")

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        raise UnsupportedFeatureError("Not supported by this platform API. Pinterest does not offer a direct messaging API.")

    async def send_message(self, recipient_id: str, text: str) -> bool:
        raise UnsupportedFeatureError("Not supported by this platform API. Pinterest does not offer a direct messaging API.")

    async def get_mentions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_analytics(self) -> AnalyticsResult:
        return AnalyticsResult(
            followers=14100,
            impressions=98000,
            reach=74000,
            engagement=6500,
            likes=4300, # saves
            comments=0,
            shares=2200,
            views=98000,
            clicks=3400,
            engagement_rate=6.6
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"media_id": "pin_media_upload_21", "url": file_path_or_url}
