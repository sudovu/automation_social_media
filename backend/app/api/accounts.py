import json
from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.account import SocialAccount
from app.schemas import ConnectAccountRequest, SocialAccountResponse
from app.connectors.registry import list_platform_capabilities, get_connector
from app.security import encrypt_secret, decrypt_secret
from app.api.auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Social Accounts"])

@router.get("/platforms")
async def get_platforms():
    """Returns capabilities and feature limitations for all 11 supported platforms."""
    return list_platform_capabilities()

@router.get("", response_model=List[SocialAccountResponse])
async def list_connected_accounts(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(SocialAccount).where(SocialAccount.is_active == True)
    res = await db.execute(stmt)
    accounts = res.scalars().all()

    return [
        SocialAccountResponse(
            id=acc.id,
            platform=acc.platform,
            account_name=acc.account_name,
            account_id=acc.account_id,
            status=acc.status,
            timezone=acc.timezone,
            connected_at=acc.connected_at,
            last_sync=acc.last_sync,
            metadata=json.loads(acc.metadata_json or "{}")
        )
        for acc in accounts
    ]

@router.post("/connect", response_model=SocialAccountResponse)
async def connect_account(
    req: ConnectAccountRequest,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    connector = get_connector(req.platform)
    conn_res = await connector.connect(req.auth_token_or_code or "mock_token")
    profile = await connector.get_profile()

    meta = req.metadata or {}
    meta.update({
        "avatar_url": profile.avatar_url,
        "followers_count": profile.followers_count,
        "display_name": profile.display_name
    })

    acc = SocialAccount(
        platform=req.platform.lower(),
        account_name=req.account_name or profile.account_name,
        account_id=profile.account_id,
        access_token_enc=encrypt_secret(req.auth_token_or_code),
        status="connected",
        timezone=req.timezone or "UTC",
        connected_at=datetime.now(timezone.utc),
        last_sync=datetime.now(timezone.utc),
        metadata_json=json.dumps(meta)
    )
    db.add(acc)
    await db.commit()
    await db.refresh(acc)

    return SocialAccountResponse(
        id=acc.id,
        platform=acc.platform,
        account_name=acc.account_name,
        account_id=acc.account_id,
        status=acc.status,
        timezone=acc.timezone,
        connected_at=acc.connected_at,
        last_sync=acc.last_sync,
        metadata=meta
    )

@router.post("/{account_id}/disconnect")
async def disconnect_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(SocialAccount).where(SocialAccount.id == account_id)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    connector = get_connector(acc.platform)
    await connector.disconnect()

    acc.status = "disconnected"
    acc.is_active = False
    await db.commit()
    return {"status": "disconnected", "account_id": account_id}

@router.post("/{account_id}/refresh")
async def refresh_account_token(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(SocialAccount).where(SocialAccount.id == account_id)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    connector = get_connector(acc.platform, access_token=decrypt_secret(acc.access_token_enc))
    ref = await connector.refresh_token()
    acc.status = "connected"
    acc.last_sync = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "refreshed", "account_id": account_id}

@router.post("/{account_id}/sync")
async def sync_account(
    account_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(SocialAccount).where(SocialAccount.id == account_id)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    connector = get_connector(acc.platform, access_token=decrypt_secret(acc.access_token_enc))
    profile = await connector.get_profile()
    meta = json.loads(acc.metadata_json or "{}")
    meta.update({
        "avatar_url": profile.avatar_url,
        "followers_count": profile.followers_count,
        "display_name": profile.display_name
    })
    acc.metadata_json = json.dumps(meta)
    acc.last_sync = datetime.now(timezone.utc)
    await db.commit()
    return {"status": "synced", "account_id": account_id, "profile": profile.model_dump()}
