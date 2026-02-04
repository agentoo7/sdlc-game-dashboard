from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class EventType(str, Enum):
    """Valid event types."""
    # Core event types (Story 3.2)
    THINKING = "THINKING"
    WORKING = "WORKING"
    EXECUTING = "EXECUTING"
    IDLE = "IDLE"
    ERROR = "ERROR"
    TASK_COMPLETE = "TASK_COMPLETE"

    # Communication event types (Story 3.3)
    MESSAGE_SEND = "MESSAGE_SEND"
    MESSAGE_RECEIVE = "MESSAGE_RECEIVE"

    # Work events
    WORK_REQUEST = "WORK_REQUEST"
    WORK_COMPLETE = "WORK_COMPLETE"
    REVIEW_REQUEST = "REVIEW_REQUEST"
    FEEDBACK = "FEEDBACK"

    # Custom event (Story 3.10)
    CUSTOM_EVENT = "CUSTOM_EVENT"


class EventCreate(BaseModel):
    """Event creation request from Dev App."""

    company_id: UUID
    agent_id: str  # Primary agent performing action
    event_type: EventType
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
