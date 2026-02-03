from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models import Agent, Company, Event
from app.schemas.event import EventCreate, EventResponse

router = APIRouter()


@router.post("", response_model=EventResponse)
async def create_event(
    event_in: EventCreate,
    session: AsyncSession = Depends(get_session),
):
    """
    Receive a business event from Dev App.
    Server infers visual actions based on event type.
    """
    # Verify company exists
    result = await session.execute(
        select(Company).where(Company.id == event_in.company_id)
    )
    company = result.scalars().first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Infer visual actions based on event type
    inferred_actions = infer_actions(event_in)

    # Create event record
    event = Event(
        company_id=event_in.company_id,
        from_agent_id=event_in.from_agent,
        to_agent_id=event_in.to_agent,
        event_type=event_in.event_type,
        payload=event_in.payload,
        inferred_actions=inferred_actions,
    )
    session.add(event)

    # Update agent states based on event
    await update_agent_states(session, event_in, inferred_actions)

    await session.commit()
    await session.refresh(event)

    return EventResponse(
        id=event.id,
        timestamp=event.timestamp,
        status="accepted",
    )


def infer_actions(event: EventCreate) -> list[str]:
    """
    Infer visual actions from business event type.
    """
    event_type = event.event_type.upper()

    if event_type in ("WORK_REQUEST", "WORK_COMPLETE", "REVIEW_REQUEST", "FEEDBACK"):
        # Movement events: from_agent walks to to_agent, hands off, returns
        return [
            f"{event.from_agent}:walk_to:{event.to_agent}",
            f"{event.from_agent}:handoff:{event.to_agent}",
            f"{event.from_agent}:return",
            f"{event.to_agent}:status:working",
        ]
    elif event_type == "THINKING":
        return [f"{event.from_agent}:status:thinking"]
    elif event_type == "WORKING":
        return [f"{event.from_agent}:status:working"]
    elif event_type == "IDLE":
        return [f"{event.from_agent}:status:idle"]
    else:
        return []


async def update_agent_states(
    session: AsyncSession,
    event: EventCreate,
    actions: list[str],
) -> None:
    """
    Update agent states based on inferred actions.
    """
    for action in actions:
        parts = action.split(":")

        if len(parts) >= 3 and parts[1] == "status":
            agent_id = parts[0]
            new_status = parts[2]

            result = await session.execute(
                select(Agent).where(
                    Agent.company_id == event.company_id,
                    Agent.agent_id == agent_id,
                )
            )
            agent = result.scalars().first()

            if agent:
                agent.status = new_status

                # Update current task from payload if available
                if new_status == "working" and event.payload:
                    agent.current_task = event.payload.get("task", None)
                elif new_status == "idle":
                    agent.current_task = None
