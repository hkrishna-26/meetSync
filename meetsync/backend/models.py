import uuid
import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, UUID
from sqlalchemy.orm import relationship
from database import Base

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    status = Column(String, default="uploaded")  # "uploaded", "transcribing", "analysing", "done", "failed"
    audio_filename = Column(String, nullable=False)
    transcript = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="meeting", cascade="all, delete-orphan")
    blockers = relationship("Blocker", back_populates="meeting", cascade="all, delete-orphan")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    owner = Column(String, nullable=False)
    task = Column(String, nullable=False)
    deadline = Column(String, nullable=True)
    confidence = Column(String, nullable=False)  # "high", "medium", "low"

    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="decisions")


class Blocker(Base):
    __tablename__ = "blockers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    content = Column(String, nullable=False)
    blocked_by = Column(String, nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="blockers")
