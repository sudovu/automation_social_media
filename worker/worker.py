import os
import sys
import asyncio
import signal
import logging
from datetime import datetime, timezone

# Add backend directory to sys.path so app modules are discovered
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.config import settings
from app.database import init_db
from worker.tasks import (
    task_process_due_posts,
    task_process_recurring_schedules,
    task_process_content_queue,
    task_sync_channel_metrics,
    task_refresh_expiring_tokens
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [WORKER] [%(levelname)s] %(message)s"
)
logger = logging.getLogger("worker")

class BackgroundWorker:
    def __init__(self):
        self.running = False
        self._last_metrics_sync = datetime.min.replace(tzinfo=timezone.utc)
        self._last_token_refresh = datetime.min.replace(tzinfo=timezone.utc)

    async def start(self):
        self.running = True
        logger.info("Initializing Social Automation Hub Background Worker...")
        await init_db()
        logger.info("Worker started successfully. Polling active schedules and queues...")

        while self.running:
            try:
                # 1. Process due scheduled posts every iteration (every 10 seconds)
                await task_process_due_posts()

                # 2. Process content queue
                await task_process_content_queue()

                # 3. Process recurring schedule generation
                await task_process_recurring_schedules()

                # 4. Periodically sync metrics (every 1 hour)
                now = datetime.now(timezone.utc)
                if (now - self._last_metrics_sync).total_seconds() > 3600:
                    logger.info("Running periodic social metrics sync task...")
                    await task_sync_channel_metrics()
                    self._last_metrics_sync = now

                # 5. Periodically check token renewals (every 6 hours)
                if (now - self._last_token_refresh).total_seconds() > 21600:
                    logger.info("Running proactive token refresh check...")
                    await task_refresh_expiring_tokens()
                    self._last_token_refresh = now

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in background worker execution loop: {e}", exc_info=True)

            await asyncio.sleep(10)

    def stop(self):
        logger.info("Shutting down background worker...")
        self.running = False

def main():
    worker = BackgroundWorker()

    def handle_signal(*args):
        worker.stop()

    try:
        signal.signal(signal.SIGINT, handle_signal)
        signal.signal(signal.SIGTERM, handle_signal)
    except Exception:
        pass

    try:
        asyncio.run(worker.start())
    except (KeyboardInterrupt, SystemExit):
        worker.stop()

if __name__ == "__main__":
    main()
