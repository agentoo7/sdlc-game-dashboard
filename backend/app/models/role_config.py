from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class RoleConfig(SQLModel, table=True):
    """Role configuration for dynamic role support."""

    __tablename__ = "role_configs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    role_id: str = Field(unique=True, index=True, max_length=50)  # e.g., "developer"
    display_name: str = Field(max_length=100)  # e.g., "Developer"
    color: str = Field(max_length=20)  # e.g., "#22C55E"
    zone_color: str = Field(max_length=50)  # e.g., "rgba(34, 197, 94, 0.3)"
    is_default: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Default BMAD roles (seeded on startup)
DEFAULT_ROLES = [
    {
        "role_id": "customer",
        "display_name": "Customer",
        "color": "#9CA3AF",
        "zone_color": "rgba(156, 163, 175, 0.3)",
        "is_default": True,
    },
    {
        "role_id": "ba",
        "display_name": "Business Analyst",
        "color": "#3B82F6",
        "zone_color": "rgba(59, 130, 246, 0.3)",
        "is_default": True,
    },
    {
        "role_id": "pm",
        "display_name": "Project Manager",
        "color": "#8B5CF6",
        "zone_color": "rgba(139, 92, 246, 0.3)",
        "is_default": True,
    },
    {
        "role_id": "architect",
        "display_name": "Architect",
        "color": "#F97316",
        "zone_color": "rgba(249, 115, 22, 0.3)",
        "is_default": True,
    },
    {
        "role_id": "developer",
        "display_name": "Developer",
        "color": "#22C55E",
        "zone_color": "rgba(34, 197, 94, 0.3)",
        "is_default": True,
    },
    {
        "role_id": "qa",
        "display_name": "QA Engineer",
        "color": "#EF4444",
        "zone_color": "rgba(239, 68, 68, 0.3)",
        "is_default": True,
    },
]

# Extended color palette for auto-generated custom roles
CUSTOM_ROLE_COLORS = [
    ("#EC4899", "rgba(236, 72, 153, 0.3)"),   # Pink
    ("#06B6D4", "rgba(6, 182, 212, 0.3)"),    # Cyan
    ("#84CC16", "rgba(132, 204, 22, 0.3)"),   # Lime
    ("#F59E0B", "rgba(245, 158, 11, 0.3)"),   # Amber
    ("#6366F1", "rgba(99, 102, 241, 0.3)"),   # Indigo
    ("#14B8A6", "rgba(20, 184, 166, 0.3)"),   # Teal
    ("#F43F5E", "rgba(244, 63, 94, 0.3)"),    # Rose
    ("#0EA5E9", "rgba(14, 165, 233, 0.3)"),   # Sky
]
