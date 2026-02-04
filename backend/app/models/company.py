from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.agent import Agent
    from app.models.event import Event
    from app.models.movement import Movement


class Company(SQLModel, table=True):
    """Virtual company (team) in the dashboard."""

    __tablename__ = "companies"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    agents: list["Agent"] = Relationship(back_populates="company")
    events: list["Event"] = Relationship(back_populates="company")
    movements: list["Movement"] = Relationship(back_populates="company")
