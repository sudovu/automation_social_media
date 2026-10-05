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

class ThreadsConnector(SocialConnector):
    """
    Threads API by Meta.
    Supports: Text posts (up to 500 chars), Images, Videos, Link previews, Replies management, Insights.
    Direct messaging is not available on Threads.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="threads",
            publishing=True,
            scheduled_publishing=False, # Managed by Hub scheduler
            messaging=False,
            comments=True,
            mentions=True,
            analytics=True,
            media_upload=True,
            polls=False,
            carousels=True,
            supported_post_types=["TEXT", "IMAGE", "VIDEO", "LINK", "CAROUSEL"],
            unsupported_features=[
                "MESSAGING (Threads API does not support direct messaging)",
                "POLL (Threads API does not support interactive polls)"
            ],
            required_permissions=[
                "threads_basic",
                "threads_content_publish",
                "threads_read_replies",
                "threads_manage_replies",
                "threads_manage_insights"
            ],
            rate_limits={"posts_per_day": 250},
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
            account_id="threads_u_8841",
            account_name="tech_automations",
            display_name="Tech Automations",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            followers_count=16800,
            raw_data={"username": "tech_automations"}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "id": "th_post_1009",
                "text": "The future of social media workflows is autonomous agents with human-in-the-loop review. Thoughts?",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "views": 4120,
                "likes": 230
            }
        ]

    async def create_post(self, payload: PostPayload) -> PostResult:
        if payload.post_type == "POLL":
            raise UnsupportedFeatureError("Threads API does not support polls.")
        return PostResult(
            success=True,
            post_id=f"th_{int(datetime.now().timestamp())}",
            external_url="https://threads.net/@tech_automations/post/example",
            raw_response={"status": "published"}
        )

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        raise UnsupportedFeatureError("Threads API does not support native scheduling. Managed via Hub scheduler.")

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        return [
            CommentItem(
                id="th_rep_991",
                post_id=post_id or "th_post_1009",
                author_name="dan_cloud",
                author_id="th_u_44",
                content="Agree! Guardrails and rate limiting are essential too.",
                created_at=datetime.now(timezone.utc)
            )
        ]

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        return True

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        raise UnsupportedFeatureError("Not supported by this platform API. Threads does not support direct messaging.")

    async def send_message(self, recipient_id: str, text: str) -> bool:
        raise UnsupportedFeatureError("Not supported by this platform API. Threads does not support direct messaging.")

    async def get_mentions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_analytics(self) -> AnalyticsResult:
        return AnalyticsResult(
            followers=16800,
            impressions=42000,
            reach=34000,
            engagement=3900,
            likes=3100,
            comments=650,
            shares=150,
            views=42000,
            clicks=820,
            engagement_rate=9.2
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"media_container_id": "th_media_123", "url": file_path_or_url}
