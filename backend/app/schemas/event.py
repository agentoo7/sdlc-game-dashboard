from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class EventCreate(BaseModel):
    """Event creation request from Dev App."""

    company_id: UUID
    from_agent: Optional[str] = None
    to_agent: Optional[str] = None
    event_type: str  # WORK_REQUEST, WORK_COMPLETE, etc.
    payload: dict = {}


class EventResponse(BaseModel):
    """Event creation response - simple acknowledgment."""

    id: UUID
    timestamp: datetime
    status: str = "accepted"


class LogEntry(BaseModel):
    """Log entry in logs response."""

    id: str
    timestamp: str
    from_agent: Optional[str] = None
    to_agent: Optional[str] = None
    event_type: str
    payload: dict
    inferred_actions: list[str]


class LogsResponse(BaseModel):
    """Logs response."""

    logs: list[LogEntry]
    total: int
    has_more: bool
