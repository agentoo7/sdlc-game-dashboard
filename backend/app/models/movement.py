from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.company import Company


def _utc_now() -> datetime:
    """Return current UTC time as naive datetime (for TIMESTAMP WITHOUT TIME ZONE)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Movement(SQLModel, table=True):
    """Pending movement for agent animation."""

    __tablename__ = "movements"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    agent_id: str = Field(max_length=50)
    from_zone: str = Field(max_length=50)
    to_zone: str = Field(max_length=50)
    purpose: str = Field(max_length=100)  # e.g., "handoff", "return"
    artifact: Optional[str] = Field(default=None, max_length=200)
    progress: float = Field(default=0.0)  # 0.0 to 1.0
    created_at: datetime = Field(default_factory=_utc_now)

    # Relationships
    company: "Company" = Relationship(back_populates="movements")
