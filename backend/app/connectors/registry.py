from typing import Dict, Type, List, Any, Optional
from app.connectors.base import SocialConnector, ConnectorCapabilities
from app.connectors.facebook import FacebookConnector
from app.connectors.instagram import InstagramConnector
from app.connectors.twitter import TwitterConnector
from app.connectors.linkedin import LinkedInConnector
from app.connectors.youtube import YouTubeConnector
from app.connectors.tiktok import TikTokConnector
from app.connectors.telegram import TelegramConnector
from app.connectors.whatsapp import WhatsAppConnector
from app.connectors.reddit import RedditConnector
from app.connectors.pinterest import PinterestConnector
from app.connectors.threads import ThreadsConnector

PLATFORM_CONNECTORS: Dict[str, Type[SocialConnector]] = {
    "facebook": FacebookConnector,
    "instagram": InstagramConnector,
    "twitter": TwitterConnector,
    "linkedin": LinkedInConnector,
    "youtube": YouTubeConnector,
    "tiktok": TikTokConnector,
    "telegram": TelegramConnector,
    "whatsapp": WhatsAppConnector,
    "reddit": RedditConnector,
    "pinterest": PinterestConnector,
    "threads": ThreadsConnector,
}

PLATFORM_METADATA: Dict[str, Dict[str, Any]] = {
    "facebook": {"display_name": "Facebook", "color": "#1877F2", "category": "Social Network"},
    "instagram": {"display_name": "Instagram", "color": "#E4405F", "category": "Photo & Video"},
    "twitter": {"display_name": "X / Twitter", "color": "#000000", "category": "Microblogging"},
    "linkedin": {"display_name": "LinkedIn", "color": "#0A66C2", "category": "Professional"},
    "youtube": {"display_name": "YouTube", "color": "#FF0000", "category": "Video Platform"},
    "tiktok": {"display_name": "TikTok", "color": "#00F2FE", "category": "Short Video"},
    "telegram": {"display_name": "Telegram", "color": "#229ED9", "category": "Messaging & Channels"},
    "whatsapp": {"display_name": "WhatsApp Business", "color": "#25D366", "category": "Customer Messaging"},
    "reddit": {"display_name": "Reddit", "color": "#FF4500", "category": "Communities & Discussions"},
    "pinterest": {"display_name": "Pinterest", "color": "#E60023", "category": "Visual Discovery"},
    "threads": {"display_name": "Threads", "color": "#101010", "category": "Conversations"},
}

def register_connector(platform_key: str, connector_cls: Type[SocialConnector], metadata: Optional[Dict[str, Any]] = None) -> None:
    """Plugin hook: Register a new custom platform connector dynamically."""
    PLATFORM_CONNECTORS[platform_key.lower()] = connector_cls
    if metadata:
        PLATFORM_METADATA[platform_key.lower()] = metadata

def get_connector(
    platform: str,
    access_token: Optional[str] = None,
    refresh_token: Optional[str] = None,
    config: Optional[Dict[str, Any]] = None
) -> SocialConnector:
    """Instantiate and return the appropriate connector for a given platform."""
    key = platform.lower()
    if key not in PLATFORM_CONNECTORS:
        raise ValueError(f"Unsupported social media platform: '{platform}'. Available: {list(PLATFORM_CONNECTORS.keys())}")
    connector_class = PLATFORM_CONNECTORS[key]
    return connector_class(access_token=access_token, refresh_token=refresh_token, config=config)

def list_platform_capabilities() -> List[Dict[str, Any]]:
    """Returns capabilities and metadata for all available platforms."""
    result = []
    for platform_key, connector_class in PLATFORM_CONNECTORS.items():
        connector = connector_class()
        caps = connector.get_capabilities()
        meta = PLATFORM_METADATA.get(platform_key, {})
        result.append({
            "platform": platform_key,
            "display_name": meta.get("display_name", platform_key.capitalize()),
            "color": meta.get("color", "#666666"),
            "category": meta.get("category", "Social Media"),
            "auth_type": caps.auth_type,
            "capabilities": {
                "publishing": caps.publishing,
                "scheduled_publishing": caps.scheduled_publishing,
                "messaging": caps.messaging,
                "comments": caps.comments,
                "mentions": caps.mentions,
                "analytics": caps.analytics,
                "media_upload": caps.media_upload,
                "polls": caps.polls,
                "carousels": caps.carousels,
                "supported_post_types": caps.supported_post_types,
            },
            "unsupported_features": caps.unsupported_features,
            "required_permissions": caps.required_permissions,
            "rate_limits": caps.rate_limits
        })
    return result
