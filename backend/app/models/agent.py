from datetime import datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.company import Company


class Agent(SQLModel, table=True):
    """AI Agent in a virtual company."""

    __tablename__ = "agents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    agent_id: str = Field(index=True, max_length=50)  # e.g., "Dev-001"
    name: str = Field(max_length=100)
    role: str = Field(max_length=50)  # Dynamic role ID (e.g., "developer", "security_engineer")
    status: str = Field(default="idle")  # idle, thinking, working, walking
    current_task: Optional[str] = Field(default=None, max_length=500)
    position_zone: str = Field(default="")
    position_x: float = Field(default=0.0)
    position_y: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    company: "Company" = Relationship(back_populates="agents")
