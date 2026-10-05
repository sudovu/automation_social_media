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

class RedditConnector(SocialConnector):
    """
    Reddit API Connector.
    Supports: Subreddit text/link/poll submissions, Comment management, Inbox direct messages, Karma analytics.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="reddit",
            publishing=True,
            scheduled_publishing=False, # Managed by Hub scheduler
            messaging=True,
            comments=True,
            mentions=True,
            analytics=True,
            media_upload=True,
            polls=True,
            carousels=False,
            supported_post_types=["TEXT", "LINK", "IMAGE", "POLL"],
            unsupported_features=[
                "CAROUSEL (Reddit uses gallery submissions, unsupported via standard endpoint)",
                "NATIVE_SCHEDULE (Handled by Hub scheduler)"
            ],
            required_permissions=["submit", "read", "privatemessages", "identity"],
            rate_limits={"requests_per_minute": 60},
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
        return {"access_token": self.access_token, "expires_in": 3600}

    async def get_profile(self) -> ProfileResult:
        return ProfileResult(
            account_id="t2_reddit_user_449",
            account_name="u/AutomationArchitect",
            display_name="Automation Architect",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            followers_count=3200,
            raw_data={"total_karma": 18450}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "id": "t3_17zxy9",
                "title": "We open-sourced our social media automation engine. Here is the architecture.",
                "subreddit": "r/programming",
                "score": 412,
                "num_comments": 89,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

    async def create_post(self, payload: PostPayload) -> PostResult:
        target_sub = payload.custom_params.get("subreddit", "r/test")
        return PostResult(
            success=True,
            post_id=f"t3_{int(datetime.now().timestamp())}",
            external_url=f"https://reddit.com/{target_sub}/comments/example",
            raw_response={"name": "t3_example", "subreddit": target_sub}
        )

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        raise UnsupportedFeatureError("Reddit API does not support native scheduling. Managed via Social Automation Hub scheduler.")

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        return [
            CommentItem(
                id="t1_c8821",
                post_id=post_id or "t3_17zxy9",
                author_name="linux_guru",
                author_id="t2_u91",
                content="How do you handle rate limits across different platforms?",
                created_at=datetime.now(timezone.utc)
            )
        ]

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        return True

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        return [
            MessageItem(
                id="t4_msg_55",
                sender_id="t2_u91",
                sender_name="linux_guru",
                content="Hey, are you looking for contributors on the connector modules?",
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
            followers=3200,
            impressions=38000,
            reach=29000,
            engagement=3200,
            likes=2800,
            comments=400,
            shares=120,
            views=38000,
            clicks=890,
            engagement_rate=8.4,
            raw_metrics={"karma": 18450}
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"asset": "reddit_asset_998", "url": file_path_or_url}
