from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class ActionItemResponse(BaseModel):
    id: UUID
    owner: str
    task: str
    deadline: Optional[str] = None
    confidence: str

    model_config = ConfigDict(from_attributes=True)


class DecisionResponse(BaseModel):
    id: UUID
    content: str

    model_config = ConfigDict(from_attributes=True)


class BlockerResponse(BaseModel):
    id: UUID
    content: str
    blocked_by: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MeetingResponse(BaseModel):
    id: UUID
    title: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MeetingDetailResponse(MeetingResponse):
    action_items: List[ActionItemResponse] = []
    decisions: List[DecisionResponse] = []
    blockers: List[BlockerResponse] = []

    model_config = ConfigDict(from_attributes=True)
