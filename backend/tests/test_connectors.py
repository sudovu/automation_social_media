import pytest
from app.connectors.registry import (
    PLATFORM_CONNECTORS,
    get_connector,
    list_platform_capabilities
)
from app.connectors.base import PostPayload, UnsupportedFeatureError

ALL_PLATFORMS = [
    "facebook", "instagram", "twitter", "linkedin", "youtube",
    "tiktok", "telegram", "whatsapp", "reddit", "pinterest", "threads"
]

@pytest.mark.asyncio
async def test_all_11_platforms_registered():
    assert len(PLATFORM_CONNECTORS) == 11
    for plat in ALL_PLATFORMS:
        assert plat in PLATFORM_CONNECTORS

@pytest.mark.asyncio
async def test_capabilities_discovery():
    caps_list = list_platform_capabilities()
    assert len(caps_list) == 11
    platforms_discovered = [c["platform"] for c in caps_list]
    for plat in ALL_PLATFORMS:
        assert plat in platforms_discovered

@pytest.mark.asyncio
async def test_connector_methods_and_mock_mode():
    for plat in ALL_PLATFORMS:
        connector = get_connector(plat, access_token="mock_token_123")
        caps = connector.get_capabilities()
        assert caps.platform == plat

        # Test profile retrieval
        profile = await connector.get_profile()
        assert profile.account_id is not None
        assert profile.account_name is not None

        # Test analytics retrieval
        if caps.analytics:
            analytics = await connector.get_analytics()
            assert analytics is not None

@pytest.mark.asyncio
async def test_platform_unsupported_features_enforcement():
    # 1. Instagram does not support text-only posts
    ig = get_connector("instagram")
    with pytest.raises(UnsupportedFeatureError) as exc_info:
        await ig.create_post(PostPayload(content="Text only without image", post_type="TEXT"))
    assert "Instagram requires at least one image or video" in exc_info.value.message

    # 2. WhatsApp does not support public feed posting
    wa = get_connector("whatsapp")
    with pytest.raises(UnsupportedFeatureError) as exc_info:
        await wa.create_post(PostPayload(content="Trying to post on WhatsApp feed", post_type="TEXT"))
    assert "WhatsApp" in exc_info.value.message

    # 3. YouTube does not support text-only post without video
    yt = get_connector("youtube")
    with pytest.raises(UnsupportedFeatureError) as exc_info:
        await yt.create_post(PostPayload(content="Just a text update", post_type="TEXT"))
    assert "YouTube Data API requires a video asset" in exc_info.value.message

    # 4. LinkedIn does not support 1-on-1 direct messaging via standard API
    li = get_connector("linkedin")
    with pytest.raises(UnsupportedFeatureError) as exc_info:
        await li.send_message("user_123", "Hello")
    assert "restricted by LinkedIn Partner" in exc_info.value.message
