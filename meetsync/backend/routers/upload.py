import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

UPLOAD_DIR = "uploads"

@router.post("", response_model=schemas.MeetingResponse)
def upload_audio(
    audio: UploadFile = File(...),
    meeting_title: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload an audio file for a meeting, save it with a unique filename,
    and create a Meeting database record with status 'uploaded'.
    """
    # Verify file extension (simple validation, can be extended)
    _, ext = os.path.splitext(audio.filename)
    if ext.lower() not in [".mp3", ".wav", ".m4a", ".ogg", ".webm"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {ext}. Please upload mp3, wav, m4a, ogg, or webm."
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"

    # Read file bytes and upload to Supabase Storage
    try:
        file_bytes = audio.file.read()
        from storage import upload_audio
        upload_audio(file_bytes, unique_filename)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save the uploaded file: {str(e)}"
        )

    # Create a new meeting record
    db_meeting = models.Meeting(
        title=meeting_title,
        status="uploaded",
        audio_filename=unique_filename
    )
    
    try:
        print("Saving to database...")
        db.add(db_meeting)
        db.commit()
        print(f"Saved meeting ID: {db_meeting.id}")
        db.refresh(db_meeting)
    except Exception as e:
        print(f"Database error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error while creating meeting: {str(e)}"
        )

    # Trigger Celery background worker to process (transcribe) the meeting
    try:
        from worker import process_meeting
        process_meeting.delay(str(db_meeting.id))
    except Exception as e:
        print(f"Failed to queue Celery task for meeting {db_meeting.id}: {str(e)}")
        # Note: We still return the meeting record as the upload was successful.
        # In a production app, we might want to flag the status or handle this differently,
        # but logging/printing is perfect for local development.

    return db_meeting

