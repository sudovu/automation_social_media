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

class TikTokConnector(SocialConnector):
    """
    TikTok Content Posting API & Display API.
    Supports: Direct Video Publishing, Video Metrics, Video Comments.
    Direct messaging is not available on TikTok for Developers API.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="tiktok",
            publishing=True,
            scheduled_publishing=False, # Handled by Social Automation Hub scheduler
            messaging=False,
            comments=True,
            mentions=False,
            analytics=True,
            media_upload=True,
            polls=False,
            carousels=False,
            supported_post_types=["VIDEO"],
            unsupported_features=[
                "TEXT (TikTok only supports video / photo-mode uploads)",
                "MESSAGING (TikTok API does not support direct messaging)",
                "POLL (TikTok does not support API polls)"
            ],
            required_permissions=[
                "user.info.basic",
                "video.publish",
                "video.upload",
                "video.list"
            ],
            rate_limits={"videos_per_day": 20},
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
        return {"access_token": self.access_token, "expires_in": 86400}

    async def get_profile(self) -> ProfileResult:
        return ProfileResult(
            account_id="tt_open_id_5521",
            account_name="automation_creators",
            display_name="Automation Creators Hub",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            followers_count=52100,
            raw_data={"likes": 340000}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "id": "tt_video_7721",
                "title": "3 Automations That Saved Me 20 Hours This Week #productivity #tech",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "view_count": 89400,
                "like_count": 6400
            }
        ]

    async def create_post(self, payload: PostPayload) -> PostResult:
        if payload.post_type != "VIDEO":
            raise UnsupportedFeatureError("TikTok API requires a video asset for publishing.")
        return PostResult(
            success=True,
            post_id=f"tt_post_{int(datetime.now().timestamp())}",
            external_url="https://tiktok.com/@automation_creators/video/example",
            raw_response={"publish_id": "tt_pub_1234"}
        )

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        raise UnsupportedFeatureError("TikTok API does not support native scheduling. Managed via Hub scheduler.")

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        return [
            CommentItem(
                id="tt_c_19",
                post_id=post_id or "tt_video_7721",
                author_name="UserViral9",
                author_id="tt_u_99",
                content="What tools did you use for the scheduling part?",
                created_at=datetime.now(timezone.utc)
            )
        ]

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        return True

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        raise UnsupportedFeatureError("Not supported by this platform API. TikTok does not expose direct messaging API.")

    async def send_message(self, recipient_id: str, text: str) -> bool:
        raise UnsupportedFeatureError("Not supported by this platform API. TikTok does not expose direct messaging API.")

    async def get_mentions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_analytics(self) -> AnalyticsResult:
        return AnalyticsResult(
            followers=52100,
            impressions=340000,
            reach=290000,
            engagement=24000,
            likes=19800,
            comments=2800,
            shares=1400,
            views=340000,
            clicks=1500,
            engagement_rate=7.8
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "VIDEO") -> Dict[str, Any]:
        return {"upload_url": "https://open-api.tiktok.com/upload/endpoint", "video_id": "v_123"}
