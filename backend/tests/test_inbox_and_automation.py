import pytest
from app.automation.engine import (
    evaluate_keyword_condition,
    is_within_business_hours,
    check_rate_limit,
    record_sent_message,
    is_automations_paused,
    set_automations_paused
)

@pytest.mark.asyncio
async def test_keyword_evaluation_matching():
    # Contains
    assert evaluate_keyword_condition("What is the price of the plan?", "price", "contains") is True
    assert evaluate_keyword_condition("Hello world", "price", "contains") is False

    # Exact
    assert evaluate_keyword_condition("hello", "hello", "exact") is True
    assert evaluate_keyword_condition("hello world", "hello", "exact") is False

    # Starts with
    assert evaluate_keyword_condition("Support needed immediately", "support", "starts_with") is True
    assert evaluate_keyword_condition("Need support immediately", "support", "starts_with") is False

    # Regex
    assert evaluate_keyword_condition("Order #12345", r"order\s*#\d+", "regex") is True

@pytest.mark.asyncio
async def test_rate_limiting_safeguard():
    acc_id = "test_acc_rate_limit_1"
    # Should allow messages under limit
    assert check_rate_limit(acc_id, max_per_hour=5) is True

    # Record 5 messages
    for _ in range(5):
        record_sent_message(acc_id)

    # 6th message should be blocked by safeguard
    assert check_rate_limit(acc_id, max_per_hour=5) is False

@pytest.mark.asyncio
async def test_emergency_controls_flow(async_client):
    # Ensure resumed initially
    set_automations_paused(False)
    assert is_automations_paused() is False

    # Pause all
    p_resp = await async_client.post("/api/v1/emergency/pause-all")
    assert p_resp.status_code == 200
    assert p_resp.json()["automations_paused"] is True
    assert is_automations_paused() is True

    # Resume all
    r_resp = await async_client.post("/api/v1/emergency/resume-all")
    assert r_resp.status_code == 200
    assert r_resp.json()["automations_paused"] is False
    assert is_automations_paused() is False

@pytest.mark.asyncio
async def test_inbox_and_comments_endpoints(async_client):
    # List conversations
    conv_resp = await async_client.get("/api/v1/inbox/conversations")
    assert conv_resp.status_code == 200
    convs = conv_resp.json()
    assert len(convs) > 0

    # List comments
    comm_resp = await async_client.get("/api/v1/inbox/comments")
    assert comm_resp.status_code == 200
    comments = comm_resp.json()
    assert len(comments) > 0

    # Reply to comment
    c_id = comments[0]["id"]
    plat = comments[0]["platform"]
    acc_id = comments[0]["account_id"]
    reply_resp = await async_client.post("/api/v1/inbox/comments/reply", json={
        "comment_id": c_id,
        "account_id": acc_id,
        "platform": plat,
        "reply_text": "Thanks for your feedback!"
    })
    assert reply_resp.status_code == 200
    assert reply_resp.json()["status"] == "replied"
