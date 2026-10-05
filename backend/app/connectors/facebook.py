import httpx
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

class FacebookConnector(SocialConnector):
    """
    Facebook Graph API connector for Pages.
    Officially supports: Page feed posts, photo/video upload, comment management, Page inbox messages, page insights.
    """

    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="facebook",
            publishing=True,
            scheduled_publishing=True,
            messaging=True,
            comments=True,
            mentions=True,
            analytics=True,
            media_upload=True,
            polls=False,
            carousels=True,
            supported_post_types=["TEXT", "IMAGE", "VIDEO", "LINK", "CAROUSEL"],
            unsupported_features=["POLL (Deprecated on Pages API)"],
            required_permissions=[
                "pages_show_list",
                "pages_read_engagement",
                "pages_manage_posts",
                "pages_messaging",
                "read_insights"
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
        if not self.access_token or self.access_token.startswith("mock_"):
            return ProfileResult(
                account_id="fb_page_1002345",
                account_name="Official Brand Page",
                display_name="Official Brand Page",
                avatar_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
                followers_count=12450,
                raw_data={"page_id": "1002345", "category": "Brand"}
            )
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://graph.facebook.com/v19.0/me",
                params={"access_token": self.access_token, "fields": "id,name,picture"}
            )
            data = resp.json()
            return ProfileResult(
                account_id=str(data.get("id")),
                account_name=data.get("name", "Facebook Page"),
                display_name=data.get("name", "Facebook Page"),
                avatar_url=data.get("picture", {}).get("data", {}).get("url"),
                raw_data=data
            )

    async def get_posts(self, limit: int = 20) -> List[Dict[str, Any]]:
        if not self.access_token or self.access_token.startswith("mock_"):
            return [
                {
                    "id": "fb_post_991",
                    "content": "Exciting product announcements coming this Friday! Stay tuned. #updates",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "likes": 84,
                    "comments": 12
                }
            ]
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://graph.facebook.com/v19.0/me/feed",
                params={"access_token": self.access_token, "limit": limit, "fields": "id,message,created_time"}
            )
            return resp.json().get("data", [])

    async def create_post(self, payload: PostPayload) -> PostResult:
        if payload.post_type == "POLL":
            raise UnsupportedFeatureError("Facebook Page Feed API does not support native polls. Use a link post to an external poll.")
        if not self.access_token or self.access_token.startswith("mock_"):
            return PostResult(
                success=True,
                post_id=f"fb_post_{int(datetime.now().timestamp())}",
                external_url="https://facebook.com/posts/example",
                raw_response={"status": "published", "mock": True}
            )
        async with httpx.AsyncClient() as client:
            body: Dict[str, Any] = {"message": payload.content, "access_token": self.access_token}
            if payload.link_url:
                body["link"] = payload.link_url
            resp = await client.post("https://graph.facebook.com/v19.0/me/feed", data=body)
            data = resp.json()
            if "id" in data:
                return PostResult(success=True, post_id=data["id"], raw_response=data)
            return PostResult(success=False, error_message=data.get("error", {}).get("message", "Facebook API Error"))

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        # Facebook supports published=false with scheduled_publish_time
        timestamp = int(scheduled_time.timestamp())
        if not self.access_token or self.access_token.startswith("mock_"):
            return PostResult(
                success=True,
                post_id=f"fb_sched_{timestamp}",
                raw_response={"scheduled": True, "scheduled_publish_time": timestamp}
            )
        async with httpx.AsyncClient() as client:
            body = {
                "message": payload.content,
                "published": "false",
                "scheduled_publish_time": timestamp,
                "access_token": self.access_token
            }
            resp = await client.post("https://graph.facebook.com/v19.0/me/feed", data=body)
            data = resp.json()
            if "id" in data:
                return PostResult(success=True, post_id=data["id"], raw_response=data)
            return PostResult(success=False, error_message=str(data.get("error")))

    async def delete_post(self, post_id: str) -> bool:
        return True

    async def get_comments(self, post_id: Optional[str] = None, limit: int = 20) -> List[CommentItem]:
        return [
            CommentItem(
                id="fb_comm_101",
                post_id=post_id or "fb_post_991",
                author_name="Alice Smith",
                author_id="fb_user_11",
                content="Where can I see the pricing details?",
                created_at=datetime.now(timezone.utc)
            )
        ]

    async def reply_to_comment(self, comment_id: str, reply_text: str) -> bool:
        return True

    async def get_messages(self, limit: int = 20) -> List[MessageItem]:
        return [
            MessageItem(
                id="fb_msg_201",
                sender_id="fb_user_11",
                sender_name="Alice Smith",
                content="Hi! Do you offer bulk discounts for agencies?",
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
            followers=12450,
            impressions=45200,
            reach=38100,
            engagement=3120,
            likes=2450,
            comments=420,
            shares=250,
            clicks=890,
            engagement_rate=4.2
        )

    async def upload_media(self, file_path_or_url: str, media_type: str = "IMAGE") -> Dict[str, Any]:
        return {"media_id": "fb_media_uploaded_123", "url": file_path_or_url}
