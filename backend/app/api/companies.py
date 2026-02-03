from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models import Agent, Company, Event
from app.schemas.company import (
    CompanyCreate,
    CompanyListResponse,
    CompanyResponse,
    CompanyStateResponse,
)

router = APIRouter()


@router.post("", response_model=CompanyResponse)
async def create_company(
    company_in: CompanyCreate,
    session: AsyncSession = Depends(get_session),
):
    """Register a new virtual company with agents."""
    # Create company
    company = Company(
        name=company_in.name,
        description=company_in.description,
    )
    session.add(company)
    await session.flush()

    # Create agents
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
    session: AsyncSession = Depends(get_session),
):
    """List all companies."""
    result = await session.execute(select(Company))
    companies = result.scalars().all()

    items = []
    for company in companies:
        # Count agents
        agent_result = await session.execute(
            select(Agent).where(Agent.company_id == company.id)
        )
        agent_count = len(agent_result.scalars().all())

        # Get last activity
        event_result = await session.execute(
            select(Event)
            .where(Event.company_id == company.id)
            .order_by(Event.timestamp.desc())
            .limit(1)
        )
        last_event = event_result.scalars().first()

        items.append({
            "company_id": company.id,
            "name": company.name,
            "agent_count": agent_count,
            "last_activity": last_event.timestamp if last_event else None,
        })

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
        }
        for a in agents
    ]

    # TODO: Get pending movements from movement_queue table

    return CompanyStateResponse(
        company_id=company_id,
        agents=agent_states,
        pending_movements=[],
        role_configs={},  # TODO: Fetch from role_configs table
    )


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
