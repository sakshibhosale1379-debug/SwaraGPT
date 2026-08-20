"""
Audio router - Upload and manage audio recordings for analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from datetime import datetime, timezone
from uuid import uuid4
import os
import aiofiles

from app.models.user import User
from app.models.schemas import AudioUploadResponse
from app.services.auth_service import get_current_user
from app.config import settings
from app.db.mongodb import get_database

router = APIRouter()


@router.post("/upload", response_model=AudioUploadResponse)
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload an audio file for analysis."""
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.ALLOWED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Allowed: {settings.ALLOWED_AUDIO_FORMATS}",
        )

    # Validate file size
    content = await file.read()
    if len(content) > settings.MAX_AUDIO_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum: {settings.MAX_AUDIO_SIZE_MB}MB",
        )

    # Save file
    audio_id = str(uuid4())
    user_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    
    filename = f"{audio_id}{file_ext}"
    file_path = os.path.join(user_dir, filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    now = datetime.now(timezone.utc)

    # Store metadata in MongoDB
    db = get_database()
    audio_doc = {
        "id": audio_id,
        "user_id": str(current_user.id),
        "filename": file.filename,
        "file_path": file_path,
        "file_ext": file_ext,
        "file_size": len(content),
        "status": "uploaded",
        "created_at": now,
    }
    await db.audio_files.insert_one(audio_doc)

    return AudioUploadResponse(
        id=audio_id,
        filename=file.filename,
        file_path=file_path,
        status="uploaded",
        created_at=now,
    )


@router.get("/list")
async def list_audio_files(
    current_user: User = Depends(get_current_user),
):
    """List all audio files uploaded by the current user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    files = await db.audio_files.find(
        {"user_id": str(current_user.id)}
    ).sort("created_at", -1).to_list(length=50)

    return [
        AudioUploadResponse(
            id=f["id"],
            filename=f["filename"],
            file_path=f["file_path"],
            duration_seconds=f.get("duration_seconds"),
            status=f.get("status", "uploaded"),
            created_at=f["created_at"],
        )
        for f in files
    ]
