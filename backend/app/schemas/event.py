from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

# Well-known event types (not enforced — any string accepted)
KNOWN_EVENT_TYPES = {
    "THINKING", "WORKING", "EXECUTING", "IDLE", "ERROR", "TASK_COMPLETE",
    "MESSAGE_SEND", "MESSAGE_RECEIVE",
    "WORK_REQUEST", "WORK_COMPLETE", "REVIEW_REQUEST", "FEEDBACK",
    "CODING", "DISCUSSING", "REVIEWING", "BREAK",
    "CUSTOM_EVENT",
}


class EventCreate(BaseModel):
    """Event creation request from Dev App."""

    company_id: UUID
    agent_id: str  # Primary agent performing action
    event_type: str = Field(..., min_length=1, max_length=100, pattern=r'^[A-Za-z0-9_]+$')  # Alphanumeric + underscore only
    payload: dict = {}
    to_agent: Optional[str] = None  # Target agent (for communication events)


class EventResponse(BaseModel):
    """Event creation response - simple acknowledgment."""

    event_id: UUID
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
