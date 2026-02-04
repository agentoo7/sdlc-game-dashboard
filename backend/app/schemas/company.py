from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AgentCreate(BaseModel):
    """Agent creation data."""

    agent_id: str
    name: str
    role: str  # Dynamic role ID


class CompanyCreate(BaseModel):
    """Company creation request."""

    name: str
    description: Optional[str] = None
    agents: list[AgentCreate] = []  # Optional - can create company without agents


class CompanyResponse(BaseModel):
    """Company response."""

    company_id: UUID
    name: str
    created_at: datetime


class CompanyListItem(BaseModel):
    """Company list item."""

    company_id: UUID
    name: str
    agent_count: int
    last_activity: Optional[datetime] = None
    status: str  # "active" or "inactive"


class CompanyListResponse(BaseModel):
    """Company list response."""

    companies: list[CompanyListItem]


class AgentCreateRequest(BaseModel):
    """Request to create a single agent."""

    agent_id: str
    name: str
    role: str


class AgentResponse(BaseModel):
    """Response after creating an agent."""

    agent_id: str
    name: str
    role: str
    status: str
    position: dict
    role_config: "RoleConfigResponse"


class AgentState(BaseModel):
    """Agent state in company state response."""

    agent_id: str
    role: str
    name: str
    status: str
    position: dict
    current_task: Optional[str] = None
    role_config: Optional["RoleConfigResponse"] = None


class PendingMovement(BaseModel):
    """Pending movement in company state."""

    id: str
    agent_id: str
    from_zone: str
    to_zone: str
    purpose: str
    artifact: Optional[str] = None
    progress: float = 0.0  # 0.0 to 1.0


class RoleConfigResponse(BaseModel):
    """Role configuration."""

    role_id: str
    display_name: str
    color: str
    zone_color: str
    is_default: bool


class CompanyStateResponse(BaseModel):
    """Company state response for dashboard polling."""

    company_id: UUID
    agents: list[AgentState]
    pending_movements: list[PendingMovement]
    role_configs: dict[str, RoleConfigResponse] = {}
    last_updated: datetime
