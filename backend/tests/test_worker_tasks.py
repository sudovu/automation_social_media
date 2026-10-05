import pytest
import sys
import os
from datetime import datetime, timezone, timedelta
from unittest.mock import patch

# Add root directory to sys.path so worker module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from worker.tasks import (
    task_process_due_posts,
    task_process_recurring_schedules,
    task_process_content_queue,
    task_sync_channel_metrics,
    task_refresh_expiring_tokens
)
from app.models import SocialAccount, Notification, AnalyticsMetric
from app.security import encrypt_secret

@pytest.mark.asyncio
async def test_worker_tasks_paused_behavior():
    """Verify that all worker tasks respect emergency freeze."""
    with patch("worker.tasks.is_automations_paused", return_value=True):
        res1 = await task_process_due_posts()
        assert res1["status"] == "paused"

        res2 = await task_process_recurring_schedules()
        assert res2["status"] == "paused"

        res3 = await task_process_content_queue()
        assert res3["status"] == "paused"

        res4 = await task_sync_channel_metrics()
        assert res4["status"] == "paused"

@pytest.mark.asyncio
async def test_worker_tasks_execution(session_factory):
    """Verify worker tasks run cleanly when unpaused."""
    with patch("worker.tasks.AsyncSessionLocal", session_factory):
        res1 = await task_process_due_posts()
        assert res1["status"] == "completed"

        res2 = await task_process_recurring_schedules()
        assert res2["status"] == "completed"

        res3 = await task_process_content_queue()
        assert res3["status"] == "completed"

@pytest.mark.asyncio
async def test_worker_sync_channel_metrics(session_factory, db_session):
    """Verify channel metrics sync worker task."""
    acc = SocialAccount(
        platform="twitter",
        account_name="test_analytics_acc",
        account_id="x_12345",
        access_token_enc=encrypt_secret("test_token"),
        is_active=True
    )
    db_session.add(acc)
    await db_session.commit()

    with patch("worker.tasks.AsyncSessionLocal", session_factory):
        res = await task_sync_channel_metrics()
        assert res["status"] == "completed"
        assert res["accounts_synced"] >= 1

@pytest.mark.asyncio
async def test_worker_token_refresh(session_factory, db_session):
    """Verify proactive token refresh worker task."""
    acc = SocialAccount(
        platform="facebook",
        account_name="expiring_fb_acc",
        account_id="fb_exp_1",
        access_token_enc=encrypt_secret("mock_token"),
        token_expiry=datetime.now(timezone.utc) + timedelta(days=1),
        is_active=True
    )
    db_session.add(acc)
    await db_session.commit()

    with patch("worker.tasks.AsyncSessionLocal", session_factory):
        res = await task_refresh_expiring_tokens()
        assert res["status"] == "completed"
        assert res["tokens_refreshed"] >= 1
