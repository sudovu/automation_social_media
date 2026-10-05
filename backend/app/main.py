import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import init_db
from app.scheduler.service import scheduler_service
from app.api.auth import router as auth_router
from app.api.accounts import router as accounts_router
from app.api.posts import router as posts_router
from app.api.queue import router as queue_router
from app.api.schedules import router as schedules_router
from app.api.inbox import router as inbox_router
from app.api.automations import router as automations_router
from app.api.ai import router as ai_router
from app.api.analytics import router as analytics_router
from app.api.reports import router as reports_router
from app.api.media import router as media_router
from app.api.templates import router as templates_router
from app.api.emergency import router as emergency_router
from app.api.settings import router as settings_router
from app.api.webhooks import router as webhooks_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("social_hub")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Social Automation Hub database and services...")
    os.makedirs(settings.MEDIA_UPLOAD_DIR, exist_ok=True)
    await init_db()
    await scheduler_service.start()
    logger.info("Scheduler service running. Background queue active.")
    yield
    logger.info("Shutting down Social Automation Hub...")
    await scheduler_service.stop()

app = FastAPI(
    title="Social Automation Hub API",
    description="Centralized multi-platform scheduling, automated replying, AI generation, and workflow automation engine.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration
origins = settings.get_cors_origins_list()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers under /api/v1
api_v1_prefix = "/api/v1"
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(accounts_router, prefix=api_v1_prefix)
app.include_router(posts_router, prefix=api_v1_prefix)
app.include_router(queue_router, prefix=api_v1_prefix)
app.include_router(schedules_router, prefix=api_v1_prefix)
app.include_router(inbox_router, prefix=api_v1_prefix)
app.include_router(automations_router, prefix=api_v1_prefix)
app.include_router(ai_router, prefix=api_v1_prefix)
app.include_router(analytics_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(media_router, prefix=api_v1_prefix)
app.include_router(templates_router, prefix=api_v1_prefix)
app.include_router(emergency_router, prefix=api_v1_prefix)
app.include_router(settings_router, prefix=api_v1_prefix)
app.include_router(webhooks_router, prefix=api_v1_prefix)

@app.get("/health")
@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "scheduler_active": True
    }
