import pytest

@pytest.mark.asyncio
async def test_ai_generate_post_variants(async_client):
    resp = await async_client.post("/api/v1/ai/generate-post", json={
        "idea": "Why consistency beats intensity in social media marketing",
        "tone": "engaging"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "facebook" in data
    assert "instagram" in data
    assert "twitter" in data
    assert "linkedin" in data
    assert "telegram" in data
    assert len(data["hashtags"]) > 0

@pytest.mark.asyncio
async def test_ai_rewrite_post(async_client):
    resp = await async_client.post("/api/v1/ai/rewrite", json={
        "content": "This is our latest announcement regarding new features.",
        "instruction": "shorten"
    })
    assert resp.status_code == 200
    assert "rewritten" in resp.json()

@pytest.mark.asyncio
async def test_ai_repurpose_content(async_client):
    resp = await async_client.post("/api/v1/ai/repurpose", json={
        "source_text": "Automation empowers teams to scale high-frequency publishing while avoiding burnout.",
        "source_type": "article"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert len(data["social_posts"]) > 0
    assert len(data["key_takeaways"]) > 0

@pytest.mark.asyncio
async def test_ai_sentiment_analysis(async_client):
    pos = await async_client.post("/api/v1/ai/sentiment", params={"text": "This product is amazing and so fast!"})
    assert pos.status_code == 200
    assert pos.json()["sentiment"] == "positive"

    neg = await async_client.post("/api/v1/ai/sentiment", params={"text": "Terrible experience, completely broken"})
    assert neg.status_code == 200
    assert neg.json()["sentiment"] == "negative"

@pytest.mark.asyncio
async def test_analytics_and_reports_endpoints(async_client):
    # Dashboard stats
    dash_resp = await async_client.get("/api/v1/analytics/dashboard-stats")
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert "kpis" in dash_data
    assert "accounts" in dash_data

    # Channel performance
    chan_resp = await async_client.get("/api/v1/analytics/channel-performance")
    assert chan_resp.status_code == 200
    assert len(chan_resp.json()) > 0

    # Reports
    rep_resp = await async_client.get("/api/v1/reports")
    assert rep_resp.status_code == 200
    assert len(rep_resp.json()) > 0
