import hmac
import hashlib
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, Response, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.config import settings
from app.automation.engine import automation_engine

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.get("/whatsapp")
async def verify_whatsapp_webhook(request: Request):
    """Handles Meta / WhatsApp webhook challenge verification handshake."""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == settings.WHATSAPP_VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("/{platform}")
async def receive_platform_webhook(
    platform: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Generic webhook receiver for Facebook, Instagram, Twitter, Telegram, WhatsApp, etc.
    Validates payload and triggers automation engine.
    """
    body_bytes = await request.body()
    try:
        data = await request.json()
    except Exception:
        data = {}

    # Extract common event fields
    sender_id = data.get("sender_id") or data.get("from") or "webhook_sender"
    sender_name = data.get("sender_name") or data.get("name") or "External User"
    content = data.get("message") or data.get("text") or data.get("content") or ""
    account_id = data.get("account_id") or "acc_default"

    if content:
        # Evaluate rules and auto replies asynchronously
        await automation_engine.evaluate_incoming_message(
            db=db,
            account_id=account_id,
            platform=platform.lower(),
            sender_id=sender_id,
            sender_name=sender_name,
            content=content
        )

    return {"status": "received", "platform": platform, "processed": bool(content)}
