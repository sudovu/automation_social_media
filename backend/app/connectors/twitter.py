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

class TwitterConnector(SocialConnector):
    """
    X / Twitter API v2 Connector.
    Supports: Tweets, Media upload, Native Polls (2-4 options), Mentions, Direct Messages v2, Tweet metrics.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="twitter",
            publishing=True,
            scheduled_publishing=False, # Delegated to application background scheduler
            messaging=True,
            comments=True,
            mentions=True,
            analytics=True,
            media_upload=True,
            polls=True,
            carousels=False,
            supported_post_types=["TEXT", "IMAGE", "VIDEO", "LINK", "POLL"],
            unsupported_features=[
                "CAROUSEL (X does not have carousel post type; supports multiple images up to 4)",
                "NATIVE_SCHEDULE (X API v2 handles immediate creation; scheduling is managed by Hub engine)"
            ],
            required_permissions=[
                "tweet.read",
                "tweet.write",
                "users.read",
                "dm.read",
                "dm.write"
            ],
            rate_limits={"tweets_per_month": 500, "dm_per_day": 500},
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
        return {"access_token": self.access_token, "expires_in": 7200}

    async def get_profile(self) -> ProfileResult:
        return ProfileResult(
            account_id="x_user_443901",
            account_name="techtrends_ai",
            display_name="TechTrends Hub",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
            followers_count=18900,
            raw_data={"verified": True}
        )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {
                "id": "tweet_18001",
                "text": "What is your #1 bottleneck in multi-account social media management? Vote below! 👇",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "metrics": {"retweet_count": 18, "like_count": 142, "reply_count": 35}
            }
        ]

    async def create_post(self, payload: PostPayload) -> PostResult:
        if payload.post_type == "POLL" and len(payload.poll_options) < 2:
            raise UnsupportedFeatureError("X Poll requires at least 2 options (maximum 4).")
        return PostResult(
            success=True,
            post_id=f"tweet_{int(datetime.now().timestamp())}",
            external_url="https://x.com/techtrends_ai/status/example",
            raw_response={"published": True, "type": payload.post_type}
        )

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        raise UnsupportedFeatureError("X API does not support native scheduling. Handled by Social Automation Hub scheduler.")

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        return [
            CommentItem(
                id="x_reply_301",
                post_id=post_id or "tweet_18001",
                author_name="DevAlex",
                author_id="x_user_99",
                content="Managing multiple timezones and client approval loops!",
                created_at=datetime.now(timezone.utc)
            )
        ]

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        return True

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        return [
            MessageItem(
                id="x_dm_401",
                sender_id="x_user_99",
                sender_name="DevAlex",
                content="Hey team, are you open to an integration partnership?",
                created_at=datetime.now(timezone.utc),
                direction="incoming"
            )
        ]

    async def send_message(self, recipient_id: str, text: str) -> bool:
        return True

    async def get_mentions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return [
            {"id": "m_1", "author": "devcommunity", "content": "Loving the new updates from @techtrends_ai"}
        ]

    async def get_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        return []

    async def get_analytics(self) -> AnalyticsResult:
        return AnalyticsResult(
            followers=18900,
            impressions=62000,
            reach=48000,
            engagement=4100,
            likes=3200,
            comments=650,
            shares=250,
            views=59000,
            clicks=1100,
            engagement_rate=5.1
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"media_id_string": "x_media_upload_556", "type": media_type}
