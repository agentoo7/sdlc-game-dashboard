from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.company import Company


def _utc_now() -> datetime:
    """Return current UTC time as naive datetime (for TIMESTAMP WITHOUT TIME ZONE)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Event(SQLModel, table=True):
    """Activity event log."""

    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    from_agent_id: Optional[str] = Field(default=None, max_length=50)
    to_agent_id: Optional[str] = Field(default=None, max_length=50)
    event_type: str = Field(max_length=50)  # WORK_REQUEST, WORK_COMPLETE, etc.
    payload: dict = Field(default={}, sa_column=Column(JSON))
    inferred_actions: list = Field(default=[], sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=_utc_now, index=True)

    # Relationships
    company: "Company" = Relationship(back_populates="events")
