from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(
    prefix="/meetings",
    tags=["meetings"],
)

@router.get("", response_model=List[schemas.MeetingResponse])
def list_meetings(db: Session = Depends(get_db)):
    """
    Get all meetings, ordered by creation date descending.
    """
    meetings = db.query(models.Meeting).order_by(models.Meeting.created_at.desc()).all()
    return meetings


@router.get("/{meeting_id}/status", response_model=schemas.MeetingStatusResponse)
def get_meeting_status(meeting_id: UUID, db: Session = Depends(get_db)):
    """
    Get the status of a specific meeting.
    """
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
         raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.get("/{meeting_id}/results", response_model=schemas.MeetingDetailResponse)
def get_meeting_results(meeting_id: UUID, db: Session = Depends(get_db)):
    """
    Get the full details and extracted intelligence (action items, decisions, blockers) of a meeting.
    """
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
         raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting
