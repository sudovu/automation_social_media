"""
Social Automation Hub - Modular Platform Connectors
===================================================
This module provides the modular connector plugin interface and re-exports
for all 11 officially supported social media platforms.

To add a new platform connector without modifying core application code:
1. Subclass `SocialConnector` from `app.connectors.base`.
2. Implement `get_capabilities()` to declare supported actions (no fake features).
3. Implement `publish_post()`, `get_analytics()`, and other capability methods.
4. Call `register_connector("my_platform", MyPlatformConnector, metadata={...})`.
"""

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
from app.connectors.registry import (
    get_connector,
    register_connector,
    list_platform_capabilities,
    PLATFORM_CONNECTORS,
    PLATFORM_METADATA
)

__all__ = [
    "SocialConnector",
    "ConnectorCapabilities",
    "PostPayload",
    "PostResult",
    "ProfileResult",
    "CommentItem",
    "MessageItem",
    "AnalyticsResult",
    "UnsupportedFeatureError",
    "get_connector",
    "register_connector",
    "list_platform_capabilities",
    "PLATFORM_CONNECTORS",
    "PLATFORM_METADATA"
]
