from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models import Agent, Company, Event, Movement, RoleConfig
from app.models.role_config import CUSTOM_ROLE_COLORS, DEFAULT_ROLES
from app.schemas.company import (
    AgentCreateRequest,
    AgentResponse,
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanyStateResponse,
    RoleConfigResponse,
)

MAX_AGENTS_PER_COMPANY = 50

router = APIRouter()


@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(
    company_in: CompanyCreate,
    session: AsyncSession = Depends(get_session),
):
    """Register a new virtual company with optional agents."""
    # Create company
    company = Company(
        name=company_in.name,
        description=company_in.description,
    )
    session.add(company)
    await session.flush()

    # Create agents (if provided)
    for agent_data in company_in.agents:
        agent = Agent(
            company_id=company.id,
            agent_id=agent_data.agent_id,
            name=agent_data.name,
            role=agent_data.role,
            position_zone=agent_data.role,  # Initial position = role zone
        )
        session.add(agent)

    await session.commit()
    await session.refresh(company)

    return CompanyResponse(
        company_id=company.id,
        name=company.name,
        created_at=company.created_at,
    )


@router.get("", response_model=CompanyListResponse)
async def list_companies(
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
):
    """List all companies with pagination. Optimized to avoid N+1 queries."""
    from sqlalchemy import func, outerjoin
    from sqlalchemy.orm import aliased

    # Subquery for agent counts
    agent_count_subq = (
        select(Agent.company_id, func.count(Agent.id).label("agent_count"))
        .group_by(Agent.company_id)
        .subquery()
    )

    # Subquery for last activity (max timestamp per company)
    last_activity_subq = (
        select(Event.company_id, func.max(Event.timestamp).label("last_activity"))
        .group_by(Event.company_id)
        .subquery()
    )

    # Main query with left joins
    query = (
        select(
            Company,
            func.coalesce(agent_count_subq.c.agent_count, 0).label("agent_count"),
            last_activity_subq.c.last_activity,
        )
        .outerjoin(agent_count_subq, Company.id == agent_count_subq.c.company_id)
        .outerjoin(last_activity_subq, Company.id == last_activity_subq.c.company_id)
        .offset(offset)
        .limit(limit)
    )

    result = await session.execute(query)
    rows = result.all()

    items = [
        {
            "company_id": row.Company.id,
            "name": row.Company.name,
            "agent_count": row.agent_count,
            "last_activity": row.last_activity,
            "status": "active" if row.agent_count > 0 else "inactive",
        }
        for row in rows
    ]

    return CompanyListResponse(companies=items)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get company details."""
    result = await session.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    return CompanyResponse(
        company_id=company.id,
        name=company.name,
        created_at=company.created_at,
    )


async def get_or_create_role_config(
    role: str, session: AsyncSession
) -> RoleConfig:
    """Get existing role config or create new one for custom roles."""
    # Check if role config exists
    result = await session.execute(
        select(RoleConfig).where(RoleConfig.role_id == role)
    )
    role_config = result.scalars().first()

    if role_config:
        return role_config

    # Check if it's a default role that needs to be seeded
    for default_role in DEFAULT_ROLES:
        if default_role["role_id"] == role:
            role_config = RoleConfig(**default_role)
            session.add(role_config)
            await session.flush()
            return role_config

    # Create new custom role config
    # Count existing custom roles to determine color index
    result = await session.execute(
        select(RoleConfig).where(RoleConfig.is_default == False)  # noqa: E712
    )
    custom_roles = result.scalars().all()
    custom_role_count = len(custom_roles)

    # Convert snake_case to Title Case
    display_name = " ".join(word.capitalize() for word in role.split("_"))

    # Use extended palette if available, otherwise generate HSL from hash
    if custom_role_count < len(CUSTOM_ROLE_COLORS):
        color, zone_color = CUSTOM_ROLE_COLORS[custom_role_count]
    else:
        # Generate deterministic color using HSL from role name hash
        color, zone_color = _generate_hsl_color_from_hash(role)

    role_config = RoleConfig(
        role_id=role,
        display_name=display_name,
        color=color,
        zone_color=zone_color,
        is_default=False,
    )
    session.add(role_config)
    await session.flush()
    return role_config


def _generate_hsl_color_from_hash(role: str) -> tuple[str, str]:
    """Generate deterministic HSL color from role name hash."""
    import hashlib

    # Hash the role name for deterministic color
    hash_bytes = hashlib.md5(role.encode()).digest()
    hash_int = int.from_bytes(hash_bytes[:4], 'big')

    # Generate HSL values
    # Hue: 0-360 (full spectrum)
    # Saturation: 60-80% (vibrant but not oversaturated)
    # Lightness: 45-55% (visible on dark background)
    hue = hash_int % 360
    saturation = 60 + (hash_int >> 8) % 20  # 60-80%
    lightness = 45 + (hash_int >> 16) % 10  # 45-55%

    # Convert HSL to hex color
    color_hex = _hsl_to_hex(hue, saturation, lightness)
    zone_color = f"rgba({_hsl_to_rgb(hue, saturation, lightness)}, 0.3)"

    return color_hex, zone_color


def _hsl_to_hex(h: int, s: int, l: int) -> str:
    """Convert HSL to hex color string."""
    r, g, b = _hsl_to_rgb_values(h, s / 100, l / 100)
    return f"#{int(r):02x}{int(g):02x}{int(b):02x}".upper()


def _hsl_to_rgb(h: int, s: int, l: int) -> str:
    """Convert HSL to RGB string for rgba()."""
    r, g, b = _hsl_to_rgb_values(h, s / 100, l / 100)
    return f"{int(r)}, {int(g)}, {int(b)}"


def _hsl_to_rgb_values(h: int, s: float, l: float) -> tuple[float, float, float]:
    """Convert HSL to RGB values (0-255)."""
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2

    if h < 60:
        r, g, b = c, x, 0
    elif h < 120:
        r, g, b = x, c, 0
    elif h < 180:
        r, g, b = 0, c, x
    elif h < 240:
        r, g, b = 0, x, c
    elif h < 300:
        r, g, b = x, 0, c
    else:
        r, g, b = c, 0, x

    return (r + m) * 255, (g + m) * 255, (b + m) * 255


@router.post("/{company_id}/agents", response_model=AgentResponse, status_code=201)
async def create_agent(
    company_id: UUID,
    agent_in: AgentCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    """Create a new agent for a company."""
    # Verify company exists
    result = await session.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Check max agents limit
    agent_count_result = await session.execute(
        select(Agent).where(Agent.company_id == company_id)
    )
    agent_count = len(agent_count_result.scalars().all())

    if agent_count >= MAX_AGENTS_PER_COMPANY:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum agents reached ({MAX_AGENTS_PER_COMPANY})",
        )

    # Check for duplicate agent_id within company
    result = await session.execute(
        select(Agent).where(
            Agent.company_id == company_id, Agent.agent_id == agent_in.agent_id
        )
    )
    existing_agent = result.scalars().first()

    if existing_agent:
        raise HTTPException(
            status_code=409,
            detail=f"Agent with id '{agent_in.agent_id}' already exists in this company",
        )

    # Get or create role config
    role_config = await get_or_create_role_config(agent_in.role, session)

    # Create agent
    agent = Agent(
        company_id=company_id,
        agent_id=agent_in.agent_id,
        name=agent_in.name,
        role=agent_in.role,
        status="idle",
        position_zone=agent_in.role,
        position_x=0.0,
        position_y=0.0,
    )
    session.add(agent)
    await session.commit()
    await session.refresh(agent)

    return AgentResponse(
        agent_id=agent.agent_id,
        name=agent.name,
        role=agent.role,
        status=agent.status,
        position={
            "zone": agent.position_zone,
            "x": agent.position_x,
            "y": agent.position_y,
        },
        role_config=RoleConfigResponse(
            role_id=role_config.role_id,
            display_name=role_config.display_name,
            color=role_config.color,
            zone_color=role_config.zone_color,
            is_default=role_config.is_default,
        ),
    )


@router.get("/{company_id}/state", response_model=CompanyStateResponse)
async def get_company_state(
    company_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get current state of a company for dashboard polling."""
    # Verify company exists
    result = await session.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Get all agents
    agent_result = await session.execute(
        select(Agent).where(Agent.company_id == company_id)
    )
    agents = agent_result.scalars().all()

    # Collect unique roles and fetch their configs
    unique_roles = set(a.role for a in agents)
    role_configs_map = {}

    for role in unique_roles:
        role_config = await get_or_create_role_config(role, session)
        role_configs_map[role] = RoleConfigResponse(
            role_id=role_config.role_id,
            display_name=role_config.display_name,
            color=role_config.color,
            zone_color=role_config.zone_color,
            is_default=role_config.is_default,
        )

    # Build agent states with role configs
    agent_states = [
        {
            "agent_id": a.agent_id,
            "role": a.role,
            "name": a.name,
            "status": a.status,
            "position": {
                "zone": a.position_zone,
                "x": a.position_x,
                "y": a.position_y,
            },
            "current_task": a.current_task,
            "role_config": role_configs_map.get(a.role),
        }
        for a in agents
    ]

    # Get pending movements (progress < 1.0)
    movement_result = await session.execute(
        select(Movement).where(
            Movement.company_id == company_id,
            Movement.progress < 1.0,
        )
    )
    movements = movement_result.scalars().all()

    pending_movements = [
        {
            "id": str(m.id),
            "agent_id": m.agent_id,
            "from_zone": m.from_zone,
            "to_zone": m.to_zone,
            "purpose": m.purpose,
            "artifact": m.artifact,
            "progress": m.progress,
        }
        for m in movements
    ]

    return CompanyStateResponse(
        company_id=company_id,
        agents=agent_states,
        pending_movements=pending_movements,
        role_configs=role_configs_map,
        last_updated=company.updated_at,
    )


@router.delete("/{company_id}/agents/{agent_id}")
async def delete_agent(
    company_id: UUID,
    agent_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Remove an agent from a company with cascading cleanup."""
    # Verify company exists
    result = await session.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Find the agent
    result = await session.execute(
        select(Agent).where(
            Agent.company_id == company_id, Agent.agent_id == agent_id
        )
    )
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    # Cascade delete: Remove related movements
    await session.execute(
        Movement.__table__.delete().where(
            Movement.company_id == company_id,
            Movement.agent_id == agent_id,
        )
    )

    # Cascade delete: Remove events where agent is from_agent or to_agent
    # Note: We keep events for audit trail but clear the agent references
    # Or delete if you prefer complete cleanup:
    await session.execute(
        Event.__table__.delete().where(
            Event.company_id == company_id,
            (Event.from_agent_id == agent_id) | (Event.to_agent_id == agent_id),
        )
    )

    # Delete the agent
    await session.delete(agent)
    await session.commit()

    return {"agent_id": agent_id, "status": "removed"}


@router.get("/{company_id}/logs")
async def get_company_logs(
    company_id: UUID,
    agent_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
):
    """Get activity logs for a company."""
    query = select(Event).where(Event.company_id == company_id)

    if agent_id:
        query = query.where(
            (Event.from_agent_id == agent_id) | (Event.to_agent_id == agent_id)
        )

    if event_type:
        query = query.where(Event.event_type == event_type)

    query = query.order_by(Event.timestamp.desc()).offset(offset).limit(limit + 1)

    result = await session.execute(query)
    events = result.scalars().all()

    has_more = len(events) > limit
    if has_more:
        events = events[:limit]

    logs = [
        {
            "id": str(e.id),
            "timestamp": e.timestamp.isoformat(),
            "from_agent": e.from_agent_id,
            "to_agent": e.to_agent_id,
            "event_type": e.event_type,
            "payload": e.payload,
            "inferred_actions": e.inferred_actions,
        }
        for e in events
    ]

    # Count total
    count_query = select(Event).where(Event.company_id == company_id)
    if agent_id:
        count_query = count_query.where(
            (Event.from_agent_id == agent_id) | (Event.to_agent_id == agent_id)
        )
    if event_type:
        count_query = count_query.where(Event.event_type == event_type)

    count_result = await session.execute(count_query)
    total = len(count_result.scalars().all())

    return {
        "logs": logs,
        "total": total,
        "has_more": has_more,
    }


@router.patch("/{company_id}/movements/{movement_id}")
async def update_movement_progress(
    company_id: UUID,
    movement_id: UUID,
    progress: float,
    session: AsyncSession = Depends(get_session),
):
    """Update movement progress (0.0 to 1.0). Frontend calls this as animation progresses."""
    # Verify movement exists
    result = await session.execute(
        select(Movement).where(
            Movement.id == movement_id,
            Movement.company_id == company_id,
        )
    )
    movement = result.scalars().first()

    if not movement:
        raise HTTPException(status_code=404, detail="Movement not found")

    # Validate progress value
    if not 0.0 <= progress <= 1.0:
        raise HTTPException(status_code=400, detail="Progress must be between 0.0 and 1.0")

    movement.progress = progress
    await session.commit()

    return {"movement_id": str(movement_id), "progress": progress}


@router.post("/{company_id}/movements/{movement_id}/complete")
async def complete_movement(
    company_id: UUID,
    movement_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Mark movement as complete and update agent position."""
    result = await session.execute(
        select(Movement).where(
            Movement.id == movement_id,
            Movement.company_id == company_id,
        )
    )
    movement = result.scalars().first()

    if not movement:
        raise HTTPException(status_code=404, detail="Movement not found")

    # Update agent position to destination zone
    result = await session.execute(
        select(Agent).where(
            Agent.company_id == company_id,
            Agent.agent_id == movement.agent_id,
        )
    )
    agent = result.scalars().first()

    if agent:
        agent.position_zone = movement.to_zone
        # If returning, set status back to idle
        if movement.purpose == "return":
            agent.status = "idle"

    # Mark movement as complete
    movement.progress = 1.0
    await session.commit()

    return {"movement_id": str(movement_id), "status": "completed"}


@router.delete("/{company_id}/movements/cleanup")
async def cleanup_completed_movements(
    company_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete all completed movements (progress >= 1.0) for a company."""
    # Verify company exists
    result = await session.execute(select(Company).where(Company.id == company_id))
    company = result.scalars().first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Delete completed movements
    result = await session.execute(
        select(Movement).where(
            Movement.company_id == company_id,
            Movement.progress >= 1.0,
        )
    )
    completed = result.scalars().all()
    deleted_count = len(completed)

    for movement in completed:
        await session.delete(movement)

    await session.commit()

    return {"deleted_count": deleted_count}
