from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models import Agent, Company, Event, Movement
from app.schemas.event import EventCreate, EventResponse, EventType

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

    # Verify agent exists and get their zone
    result = await session.execute(
        select(Agent).where(
            Agent.company_id == event_in.company_id,
            Agent.agent_id == event_in.agent_id,
        )
    )
    agent = result.scalars().first()

    if not agent:
        raise HTTPException(
            status_code=404,
            detail=f"Agent '{event_in.agent_id}' not found in company",
        )

    # Verify to_agent exists if specified and get their zone
    to_agent_obj = None
    if event_in.to_agent:
        result = await session.execute(
            select(Agent).where(
                Agent.company_id == event_in.company_id,
                Agent.agent_id == event_in.to_agent,
            )
        )
        to_agent_obj = result.scalars().first()

        if not to_agent_obj:
            raise HTTPException(
                status_code=404,
                detail=f"Target agent '{event_in.to_agent}' not found in company",
            )

    # Infer visual actions based on event type
    inferred_actions = infer_actions(event_in)

    # Create event record
    event = Event(
        company_id=event_in.company_id,
        from_agent_id=event_in.agent_id,
        to_agent_id=event_in.to_agent,
        event_type=event_in.event_type.value,
        payload=event_in.payload,
        inferred_actions=inferred_actions,
    )
    session.add(event)

    # Update agent states and create movements
    await update_agent_states(session, event_in, inferred_actions)
    await create_movements(session, event_in, agent, to_agent_obj, inferred_actions)

    await session.commit()
    await session.refresh(event)

    return EventResponse(
        event_id=event.id,
        timestamp=event.timestamp,
        status="accepted",
    )


def infer_actions(event: EventCreate) -> list[str]:
    """
    Infer visual actions from business event type.
    """
    event_type = event.event_type
    agent_id = event.agent_id
    to_agent = event.to_agent

    # Communication/work events - involve movement
    if event_type in (
        EventType.WORK_REQUEST,
        EventType.WORK_COMPLETE,
        EventType.REVIEW_REQUEST,
        EventType.FEEDBACK,
        EventType.MESSAGE_SEND,
    ):
        if to_agent:
            return [
                f"{agent_id}:walk_to:{to_agent}",
                f"{agent_id}:handoff:{to_agent}",
                f"{agent_id}:return",
                f"{to_agent}:status:working",
            ]
        return [f"{agent_id}:status:working"]

    # Core state events
    elif event_type == EventType.THINKING:
        return [f"{agent_id}:status:thinking"]

    elif event_type == EventType.WORKING:
        return [f"{agent_id}:status:working"]

    elif event_type == EventType.EXECUTING:
        return [f"{agent_id}:status:executing"]

    elif event_type == EventType.IDLE:
        return [f"{agent_id}:status:idle"]

    elif event_type == EventType.ERROR:
        return [f"{agent_id}:status:error"]

    elif event_type == EventType.TASK_COMPLETE:
        return [f"{agent_id}:status:idle", f"{agent_id}:task_complete"]

    elif event_type == EventType.MESSAGE_RECEIVE:
        return [f"{agent_id}:acknowledge"]

    elif event_type == EventType.CUSTOM_EVENT:
        # Custom events use payload for icon/animation
        return [f"{agent_id}:custom:{event.payload.get('event_name', 'custom')}"]

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
                if new_status in ("working", "thinking", "executing"):
                    task = event.payload.get("task") or event.payload.get("thought")
                    if task:
                        agent.current_task = task
                elif new_status == "idle":
                    agent.current_task = None

        # Handle walk_to actions - set agent to walking status
        elif len(parts) >= 3 and parts[1] == "walk_to":
            agent_id = parts[0]

            result = await session.execute(
                select(Agent).where(
                    Agent.company_id == event.company_id,
                    Agent.agent_id == agent_id,
                )
            )
            agent = result.scalars().first()

            if agent:
                agent.status = "walking"


async def create_movements(
    session: AsyncSession,
    event: EventCreate,
    from_agent: Agent,
    to_agent: Agent | None,
    actions: list[str],
) -> None:
    """
    Create movement records for animations.
    """
    for action in actions:
        parts = action.split(":")

        # walk_to action - agent walks to target agent's zone
        if len(parts) >= 3 and parts[1] == "walk_to":
            agent_id = parts[0]
            target_agent_id = parts[2]

            if to_agent and agent_id == event.agent_id:
                movement = Movement(
                    company_id=event.company_id,
                    agent_id=agent_id,
                    from_zone=from_agent.position_zone,
                    to_zone=to_agent.position_zone,
                    purpose="handoff",
                    artifact=event.payload.get("artifact"),
                    progress=0.0,
                )
                session.add(movement)

        # return action - agent returns to their home zone
        elif len(parts) >= 2 and parts[1] == "return":
            agent_id = parts[0]

            if agent_id == event.agent_id and to_agent:
                movement = Movement(
                    company_id=event.company_id,
                    agent_id=agent_id,
                    from_zone=to_agent.position_zone,
                    to_zone=from_agent.role,  # Return to their role zone
                    purpose="return",
                    progress=0.0,
                )
                session.add(movement)
