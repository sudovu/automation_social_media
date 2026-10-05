import os
import hashlib
import json
import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.models.media_and_template import MediaItem
from app.config import settings
from app.api.auth import get_current_user

router = APIRouter(prefix="/media", tags=["Media Library"])

@router.get("")
async def list_media(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(MediaItem).order_by(desc(MediaItem.created_at))
    res = await db.execute(stmt)
    items = res.scalars().all()
    return [
        {
            "id": m.id,
            "filename": m.filename,
            "original_name": m.original_name,
            "file_path": m.file_path,
            "file_hash": m.file_hash,
            "mime_type": m.mime_type,
            "file_size": m.file_size,
            "folder": m.folder,
            "tags": json.loads(m.tags_json or "[]"),
            "created_at": m.created_at
        }
        for m in items
    ]

@router.post("/upload")
async def upload_media(
    file: UploadFile = File(...),
    folder: str = Form("default"),
    tags: str = Form("[]"),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    os.makedirs(settings.MEDIA_UPLOAD_DIR, exist_ok=True)
    content = await file.read()
    file_size = len(content)

    # Compute SHA-256 hash to detect & prevent duplicate uploads
    file_hash = hashlib.sha256(content).hexdigest()
    stmt = select(MediaItem).where(MediaItem.file_hash == file_hash)
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        return {
            "status": "duplicate_reused",
            "message": "Identical file already exists in library; reused asset.",
            "media_id": existing.id,
            "file_path": existing.file_path
        }

    # Save to disk
    ext = os.path.splitext(file.filename or "")[1]
    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(settings.MEDIA_UPLOAD_DIR, safe_name)

    with open(dest_path, "wb") as f:
        f.write(content)

    media = MediaItem(
        filename=safe_name,
        original_name=file.filename or "media_upload",
        file_path=dest_path.replace("\\", "/"),
        file_hash=file_hash,
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        folder=folder,
        tags_json=tags
    )
    db.add(media)
    await db.commit()
    await db.refresh(media)

    return {
        "status": "uploaded",
        "media_id": media.id,
        "filename": media.filename,
        "file_path": media.file_path
    }

@router.delete("/{media_id}")
async def delete_media(
    media_id: str,
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user)
):
    stmt = select(MediaItem).where(MediaItem.id == media_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Media item not found")

    if os.path.exists(item.file_path):
        try:
            os.remove(item.file_path)
        except Exception:
            pass

    await db.delete(item)
    await db.commit()
    return {"status": "deleted"}
