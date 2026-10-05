# Platform Connector Plugin Architecture

The **Social Automation Hub** is built with a strictly decoupled, modular connector architecture.

Adding support for another social media platform (e.g., Bluesky, Mastodon, Snapchat, Discord) requires **only** creating a single connector plugin class without rewriting or modifying the core database schemas, workers, UI, or API routes.

---

## Connector Directory Layout

```
connectors/
├── __init__.py               # Core plugin abstractions and registries
├── README.md                 # Architecture & developer guide
├── facebook/                 # Facebook Pages & Graph API v19.0
├── instagram/                # Instagram Graph API & Reels
├── twitter/                  # X / Twitter API v2
├── linkedin/                 # LinkedIn Community Management API v2
├── youtube/                  # YouTube Data API v3
├── tiktok/                   # TikTok Content Posting API v2
├── telegram/                 # Telegram Bot & Channel API
├── whatsapp/                 # WhatsApp Cloud Business API
├── reddit/                   # Reddit OAuth API
├── pinterest/                # Pinterest API v5
└── threads/                  # Meta Threads Graph API
```

---

## 3 Golden Rules for Platform Connectors

1. **Official APIs Only**: Never scrape HTML, simulate browser sessions, solve CAPTCHAs, or bypass platform anti-abuse systems.
2. **Never Fake Features**: If an official platform API does not support an action (e.g., WhatsApp does not support public wall posts, Pinterest does not have DMs), raise `UnsupportedFeatureError(f"Action '{action}' is not supported by {platform} official API.")`. The UI dynamically displays *"Not supported by this platform API"*.
3. **Respect Rate Limits & Safety**: Respect rate limit windows, include backoff metadata, and never store raw API tokens in plaintext (use the platform's Fernet encryption helpers).

---

## How to Add a New Connector (Step-by-Step)

### Step 1: Create Your Connector Class

```python
from app.connectors.base import SocialConnector, ConnectorCapabilities, PostPayload, PostResult, UnsupportedFeatureError

class BlueskyConnector(SocialConnector):
    def get_capabilities(self) -> ConnectorCapabilities:
        return ConnectorCapabilities(
            platform="bluesky",
            publishing=True,
            scheduled_publishing=False,  # Native API does not support server-side scheduling; handled by Hub scheduler
            messaging=False,             # Not supported on official ATProto
            comments=True,
            mentions=True,
            analytics=False,
            media_upload=True,
            supported_post_types=["TEXT", "IMAGE"],
            unsupported_features=["DIRECT_MESSAGES", "NATIVE_SCHEDULED_POSTS"],
            rate_limits={"calls_per_hour": 300, "window_hours": 1},
            auth_type="AppPassword"
        )

    async def publish_post(self, payload: PostPayload) -> PostResult:
        # Call official ATProto API endpoint
        ...
        return PostResult(success=True, post_id="at://...", external_url="https://bsky.app/...")

    async def schedule_post(self, payload: PostPayload, scheduled_time: datetime) -> PostResult:
        # If platform API does not natively schedule, inform caller to delegate to Hub Scheduler
        raise UnsupportedFeatureError("Bluesky official API does not support native scheduled posts; use Social Automation Hub local scheduler.")
```

### Step 2: Register the Connector

In your startup hook or plugin initializer:

```python
from app.connectors.registry import register_connector

register_connector(
    platform_key="bluesky",
    connector_cls=BlueskyConnector,
    metadata={
        "display_name": "Bluesky",
        "color": "#0085FF",
        "category": "Microblogging"
    }
)
```

The system automatically discovers the new platform, reflects it in the First-Run Wizard, exposes it in the Composer, and activates capability filters across the entire dashboard!
