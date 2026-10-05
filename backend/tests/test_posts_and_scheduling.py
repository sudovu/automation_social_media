import pytest
from datetime import datetime, timezone, timedelta
from app.scheduler.service import compute_next_run

@pytest.mark.asyncio
async def test_compute_next_run_daily():
    base = datetime(2026, 10, 5, 8, 0, tzinfo=timezone.utc)
    next_run = compute_next_run(
        schedule_type="daily",
        times_of_day=["09:00"],
        from_time=base
    )
    assert next_run == datetime(2026, 10, 5, 9, 0, tzinfo=timezone.utc)

    # If past 09:00 today, should advance to tomorrow 09:00
    base_past = datetime(2026, 10, 5, 10, 0, tzinfo=timezone.utc)
    next_run_tomorrow = compute_next_run(
        schedule_type="daily",
        times_of_day=["09:00"],
        from_time=base_past
    )
    assert next_run_tomorrow == datetime(2026, 10, 6, 9, 0, tzinfo=timezone.utc)

@pytest.mark.asyncio
async def test_compute_next_run_twice_daily():
    base = datetime(2026, 10, 5, 10, 0, tzinfo=timezone.utc)
    # Next should be 18:00 today
    next_run = compute_next_run(
        schedule_type="twice_daily",
        times_of_day=["09:00", "18:00"],
        from_time=base
    )
    assert next_run == datetime(2026, 10, 5, 18, 0, tzinfo=timezone.utc)

@pytest.mark.asyncio
async def test_compute_next_run_cron():
    base = datetime(2026, 10, 5, 12, 0, tzinfo=timezone.utc)
    # Cron for every hour on minute 15
    next_run = compute_next_run(
        schedule_type="cron",
        cron_expr="15 * * * *",
        from_time=base
    )
    assert next_run.minute == 15
    assert next_run.hour == 12

@pytest.mark.asyncio
async def test_post_creation_and_idempotency(async_client):
    idempotency_key = "idemp_test_key_998877"

    # 1. Create first post
    resp1 = await async_client.post("/api/v1/posts", json={
        "title": "Launch Announcement",
        "content": "Excited to launch Social Automation Hub!",
        "post_type": "TEXT",
        "platforms": ["twitter", "linkedin"],
        "status": "published",
        "idempotency_key": idempotency_key
    })
    assert resp1.status_code == 200
    post1 = resp1.json()
    assert post1["id"] is not None
    assert post1["status"] == "published"
    assert len(post1["variants"]) > 0

    # 2. Resend with identical idempotency key -> Must return existing post, not create a duplicate
    resp2 = await async_client.post("/api/v1/posts", json={
        "title": "Launch Announcement",
        "content": "Excited to launch Social Automation Hub!",
        "post_type": "TEXT",
        "platforms": ["twitter", "linkedin"],
        "status": "published",
        "idempotency_key": idempotency_key
    })
    assert resp2.status_code == 200
    post2 = resp2.json()
    assert post2["id"] == post1["id"]

@pytest.mark.asyncio
async def test_content_queue_flow(async_client):
    # Create draft post
    p_resp = await async_client.post("/api/v1/posts", json={
        "title": "Queued Evergreen Content",
        "content": "5 tips to enhance your automation workflows.",
        "post_type": "TEXT",
        "platforms": ["twitter"],
        "status": "draft"
    })
    post_id = p_resp.json()["id"]

    # Add to queue
    q_resp = await async_client.post(f"/api/v1/queue/add/{post_id}")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert q_data["status"] == "queued"
    item_id = q_data["id"]

    # List queue
    list_resp = await async_client.get("/api/v1/queue")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(it["id"] == item_id for it in items)

    # Skip item
    skip_resp = await async_client.post(f"/api/v1/queue/{item_id}/skip")
    assert skip_resp.status_code == 200
    assert skip_resp.json()["status"] == "skipped"
