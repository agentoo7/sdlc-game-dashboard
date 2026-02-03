---
document_type: Architecture
version: 1.0
status: draft
date: 2026-02-03
author: Binh Tran
project_name: SDLC Game Dashboard
source: prd-dashboard-2026-02-03.md
---

# Architecture Document: SDLC Game Dashboard

## 1. Executive Summary

This document describes the technical architecture for SDLC Game Dashboard - a web-based 2D game-style visualization platform built with **Phaser.js** (frontend) and **FastAPI** (backend).

### Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Containerized** | All services run in Docker containers |
| **API-First** | Clear contract between frontend and backend |
| **Stateless Backend** | All state persisted in PostgreSQL |
| **Polling-Based** | REST API with client-side polling (no WebSocket for MVP) |
| **Smart Server** | Server infers visual actions from business events |

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SYSTEMS                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌──────────────┐              ┌──────────────┐                       │
│    │   Dev App    │              │   Dev App    │      (Multiple        │
│    │   Team A     │              │   Team B     │       Teams)          │
│    └──────┬───────┘              └──────┬───────┘                       │
│           │                             │                               │
│           │  POST /api/events           │                               │
│           └─────────────┬───────────────┘                               │
│                         ▼                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                        SDLC GAME DASHBOARD                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         DOCKER NETWORK                           │   │
│  │                                                                   │   │
│  │   ┌─────────────────┐     ┌─────────────────┐     ┌───────────┐ │   │
│  │   │    Frontend     │     │     Backend     │     │  Database │ │   │
│  │   │   (Phaser.js)   │────▶│    (FastAPI)    │────▶│(PostgreSQL│ │   │
│  │   │                 │     │                 │     │           │ │   │
│  │   │   Port: 3000    │     │   Port: 8000    │     │Port: 5432 │ │   │
│  │   └─────────────────┘     └─────────────────┘     └───────────┘ │   │
│  │           ▲                                                       │   │
│  └───────────┼───────────────────────────────────────────────────────┘   │
│              │                                                           │
├──────────────┼───────────────────────────────────────────────────────────┤
│              │                    VIEWERS                                │
│              │                                                           │
│    ┌─────────┴─────────┐    ┌──────────────────┐                        │
│    │     Spectator     │    │      Judge       │                        │
│    │     (Browser)     │    │    (Browser)     │                        │
│    └───────────────────┘    └──────────────────┘                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Summary

| Component | Technology | Responsibility |
|-----------|------------|----------------|
| **Frontend** | Phaser 3 + TypeScript + Vite | Game rendering, user interaction |
| **Backend** | FastAPI + Python 3.11 | API, business logic, event processing |
| **Database** | PostgreSQL 16 | Data persistence, logging |
| **Container** | Docker + docker-compose | Service orchestration |

---

## 3. Data Flow

### 3.1 Event Processing Flow

```
┌──────────────┐                                              ┌──────────────┐
│   Dev App    │                                              │  Dashboard   │
│   (Client)   │                                              │  (Viewer)    │
└──────┬───────┘                                              └──────┬───────┘
       │                                                             │
       │ 1. POST /api/events                                         │
       │    {from: "BA-001", to: "Dev-001",                          │
       │     type: "WORK_REQUEST", payload: {...}}                   │
       │                                                             │
       ▼                                                             │
┌──────────────────────────────────────────────────────────────────┐ │
│                         BACKEND (FastAPI)                         │ │
├──────────────────────────────────────────────────────────────────┤ │
│                                                                   │ │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │ │
│  │  Validate   │───▶│  Log Event  │───▶│  Infer Visual       │  │ │
│  │  Request    │    │  to DB      │    │  Actions            │  │ │
│  └─────────────┘    └─────────────┘    └──────────┬──────────┘  │ │
│                                                    │              │ │
│                                                    ▼              │ │
│                                        ┌─────────────────────┐   │ │
│                                        │  Update Agent       │   │ │
│                                        │  States + Queue     │   │ │
│                                        │  Movements          │   │ │
│                                        └─────────────────────┘   │ │
│                                                                   │ │
└──────────────────────────────────────────────────────────────────┘ │
                                                                     │
       ┌─────────────────────────────────────────────────────────────┘
       │
       │ 2. GET /api/companies/{id}/state (polling every 1s)
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Query      │───▶│  Build      │───▶│  Return State       │  │
│  │  Current    │    │  Response   │    │  + Pending          │  │
│  │  State      │    │  Object     │    │  Movements          │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
       │
       │ 3. Response: {agents: [...], pending_movements: [...]}
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Phaser.js)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │  Diff with  │───▶│  Trigger    │───▶│  Update Sprites     │  │
│  │  Local      │    │  Animations │    │  & Scene            │  │
│  │  State      │    │  (Tweens)   │    │                     │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Smart Event Processing Logic

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT: WORK_REQUEST                           │
│         from_agent: "BA-001" → to_agent: "Dev-001"              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER INFERS ACTIONS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: BA-001 status → "walking"                              │
│  Step 2: Queue movement: BA zone → Dev zone                     │
│  Step 3: Queue action: "handoff" with artifact                  │
│  Step 4: Queue movement: Dev zone → BA zone (return)            │
│  Step 5: BA-001 status → "idle" (after return)                  │
│  Step 6: Dev-001 status → "working"                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND RENDERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. BA-001 sprite starts walking animation                      │
│  2. Tween: BA-001 moves from BA zone to Dev zone               │
│  3. Artifact sprite appears in BA-001's hands                   │
│  4. On arrival: handoff animation plays                         │
│  5. Artifact transfers to Dev-001                               │
│  6. Tween: BA-001 returns to BA zone                           │
│  7. Dev-001 shows "working" animation                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Architecture (Phaser.js)

### 4.1 Project Structure

```
frontend/
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── public/
│   └── assets/
│       ├── sprites/
│       │   ├── agents/           # Chibi character spritesheets
│       │   │   ├── ba.png
│       │   │   ├── dev.png
│       │   │   ├── qa.png
│       │   │   ├── pm.png
│       │   │   └── architect.png
│       │   └── artifacts/        # Handoff items
│       │       ├── document.png
│       │       ├── code.png
│       │       └── bug.png
│       ├── tiles/
│       │   └── office.png        # Isometric tileset
│       └── ui/
│           ├── icons.png
│           └── bubbles.png       # Thought/work bubbles
└── src/
    ├── main.ts                   # Entry point
    ├── config/
    │   └── gameConfig.ts         # Phaser config
    ├── scenes/
    │   ├── BootScene.ts          # Asset loading
    │   ├── MainScene.ts          # Main game scene
    │   └── UIScene.ts            # UI overlay scene
    ├── objects/
    │   ├── Agent.ts              # Agent game object
    │   ├── Artifact.ts           # Artifact game object
    │   ├── Zone.ts               # Department zone
    │   └── Office.ts             # Office tilemap
    ├── managers/
    │   ├── StateManager.ts       # Sync with backend
    │   ├── AnimationManager.ts   # Animation control
    │   └── MovementManager.ts    # Agent pathfinding
    ├── services/
    │   └── ApiService.ts         # Backend communication
    ├── types/
    │   └── index.ts              # TypeScript interfaces
    └── utils/
        ├── isometric.ts          # Coordinate conversion
        └── colors.ts             # Role-based colors
```

### 4.2 Scene Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHASER GAME                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      BootScene                             │  │
│  │  - Load all assets (sprites, tiles, audio)                │  │
│  │  - Show loading progress                                   │  │
│  │  - Transition to MainScene when complete                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      MainScene                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Tilemap Layer: Floor (isometric grid)              │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Tilemap Layer: Zones (department areas)            │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Group: Agents (chibi sprites)                      │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Group: Artifacts (carried items)                   │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Group: Bubbles (thought/work indicators)           │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Camera: Main camera with zoom/pan controls               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ (parallel)                        │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       UIScene                              │  │
│  │  - Company selector (thumbnail grid)                      │  │
│  │  - Agent tooltip (on click)                               │  │
│  │  - Activity log panel (collapsible)                       │  │
│  │  - FPS counter (debug)                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Agent Class Design

```typescript
// src/objects/Agent.ts

interface AgentConfig {
  agentId: string;
  name: string;
  role: AgentRole;
  position: { x: number; y: number };
}

class Agent extends Phaser.GameObjects.Container {
  // Properties
  private agentId: string;
  private role: AgentRole;
  private status: AgentStatus;
  private sprite: Phaser.GameObjects.Sprite;
  private label: Phaser.GameObjects.Text;
  private bubble: Phaser.GameObjects.Sprite | null;
  private artifact: Artifact | null;

  // State Machine
  private stateMachine: AgentStateMachine;

  // Methods
  public setStatus(status: AgentStatus): void;
  public walkTo(target: { x: number; y: number }): Promise<void>;
  public handoff(artifact: Artifact, target: Agent): Promise<void>;
  public showBubble(type: 'thinking' | 'working'): void;
  public hideBubble(): void;
  public playAnimation(key: string): void;
}
```

### 4.4 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                       StateManager                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │  Local State    │  - Current company ID                      │
│  │                 │  - Agent positions & statuses              │
│  │                 │  - Pending animations                      │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │  poll every 1s                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │  ApiService     │  GET /api/companies/{id}/state            │
│  │                 │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │  response                                           │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │  Diff Engine    │  Compare server state vs local state       │
│  │                 │  Generate list of changes                  │
│  └────────┬────────┘                                            │
│           │                                                      │
│           │  changes                                            │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │  Animation      │  Queue animations based on changes         │
│  │  Manager        │  Execute tweens sequentially               │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Isometric Coordinate System

```
                    Screen Y (up)
                         ▲
                         │
                         │
            ┌────────────┼────────────┐
           ╱            │            ╲
          ╱             │             ╲
         ╱              │              ╲
        ╱               │               ╲
       ╱                │                ╲
      ╱                 │                 ╲
     ◆──────────────────┼──────────────────◆───▶ Screen X (right)
      ╲                 │                 ╱
       ╲                │                ╱
        ╲               │               ╱
         ╲              │              ╱
          ╲             │             ╲
           ╲            │            ╱
            └────────────┼────────────┘
                         │
                         │
                    Tile (0,0)

Conversion formulas:
  screenX = (tileX - tileY) * tileWidth / 2
  screenY = (tileX + tileY) * tileHeight / 2

  tileX = (screenX / (tileWidth/2) + screenY / (tileHeight/2)) / 2
  tileY = (screenY / (tileHeight/2) - screenX / (tileWidth/2)) / 2
```

---

## 5. Backend Architecture (FastAPI)

### 5.1 Project Structure

```
backend/
├── Dockerfile
├── pyproject.toml
├── alembic.ini                   # Database migrations
├── alembic/
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Settings & env vars
│   ├── database.py               # Database connection
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py             # Main router
│   │   ├── companies.py          # Company endpoints
│   │   ├── events.py             # Event endpoints
│   │   └── health.py             # Health check
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── company.py            # Company model
│   │   ├── agent.py              # Agent model
│   │   ├── event.py              # Event model
│   │   └── movement.py           # Movement queue model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── company.py            # Company request/response
│   │   ├── event.py              # Event request/response
│   │   └── state.py              # State response
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── company_service.py    # Company business logic
│   │   ├── event_service.py      # Event processing
│   │   ├── state_service.py      # State computation
│   │   └── movement_service.py   # Movement inference
│   │
│   └── core/
│       ├── __init__.py
│       ├── exceptions.py         # Custom exceptions
│       └── middleware.py         # CORS, logging
│
└── tests/
    ├── __init__.py
    ├── conftest.py               # Pytest fixtures
    ├── test_companies.py
    ├── test_events.py
    └── test_state.py
```

### 5.2 API Router Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         FastAPI App                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  app = FastAPI(title="SDLC Game Dashboard API")                 │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api                                                      │  │
│  │  ├── /health          GET    → health_check()             │  │
│  │  │                                                         │  │
│  │  ├── /companies       POST   → create_company()           │  │
│  │  │                    GET    → list_companies()           │  │
│  │  │                                                         │  │
│  │  ├── /companies/{id}  GET    → get_company()              │  │
│  │  │                                                         │  │
│  │  ├── /companies/{id}/state                                │  │
│  │  │                    GET    → get_company_state()        │  │
│  │  │                                                         │  │
│  │  ├── /companies/{id}/logs                                 │  │
│  │  │                    GET    → get_company_logs()         │  │
│  │  │                                                         │  │
│  │  ├── /events          POST   → create_event()             │  │
│  │  │                                                         │  │
│  │  └── /roles           GET    → list_role_configs()        │  │
│  │       (returns all role configs including auto-generated) │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Middleware:                                                     │
│  - CORSMiddleware (allow dashboard origin)                      │
│  - RequestLoggingMiddleware                                      │
│  - RateLimitMiddleware (100 req/min per IP)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Event Processing Service

```python
# app/services/event_service.py

class EventService:
    """
    Processes business events and infers visual actions.
    """

    async def process_event(
        self,
        db: AsyncSession,
        event: EventCreate
    ) -> EventResponse:
        """
        1. Validate event
        2. Log to database
        3. Infer visual actions
        4. Update agent states
        5. Queue movements
        """

        # 1. Validate
        company = await self._get_company(db, event.company_id)
        from_agent = await self._get_agent(db, event.from_agent)
        to_agent = await self._get_agent(db, event.to_agent)

        # 2. Log event
        db_event = Event(
            company_id=event.company_id,
            from_agent_id=event.from_agent,
            to_agent_id=event.to_agent,
            event_type=event.event_type,
            payload=event.payload,
            inferred_actions=[]
        )

        # 3. Infer actions based on event type
        actions = self._infer_actions(event)
        db_event.inferred_actions = actions

        # 4. Update agent states
        await self._update_agent_states(db, event, actions)

        # 5. Queue movements
        await self._queue_movements(db, event, actions)

        db.add(db_event)
        await db.commit()

        return EventResponse(id=db_event.id, status="accepted")

    def _infer_actions(self, event: EventCreate) -> list[str]:
        """
        Infer visual actions from business event type.
        """
        match event.event_type:
            case EventType.WORK_REQUEST | EventType.WORK_COMPLETE:
                return [
                    f"{event.from_agent}:walk_to:{event.to_agent}",
                    f"{event.from_agent}:handoff:{event.to_agent}",
                    f"{event.from_agent}:return",
                    f"{event.to_agent}:status:working"
                ]
            case EventType.THINKING:
                return [f"{event.from_agent}:status:thinking"]
            case EventType.WORKING:
                return [f"{event.from_agent}:status:working"]
            case EventType.IDLE:
                return [f"{event.from_agent}:status:idle"]
            case _:
                return []
```

### 5.4 State Service

```python
# app/services/state_service.py

class StateService:
    """
    Computes current state for dashboard polling.
    """

    async def get_company_state(
        self,
        db: AsyncSession,
        company_id: UUID
    ) -> CompanyState:
        """
        Build current state snapshot for frontend.
        """

        # Get all agents with current states
        agents = await self._get_agents(db, company_id)

        # Get pending movements (not yet completed)
        movements = await self._get_pending_movements(db, company_id)

        return CompanyState(
            company_id=company_id,
            agents=[
                AgentState(
                    agent_id=a.agent_id,
                    role=a.role,
                    name=a.name,
                    status=a.status,
                    position={
                        "zone": a.position_zone,
                        "x": a.position_x,
                        "y": a.position_y
                    },
                    current_task=a.current_task
                )
                for a in agents
            ],
            pending_movements=[
                PendingMovement(
                    agent_id=m.agent_id,
                    from_zone=m.from_zone,
                    to_zone=m.to_zone,
                    purpose=m.purpose,
                    artifact=m.artifact
                )
                for m in movements
            ]
        )
```

---

## 6. Database Architecture

### 6.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐                                                    │
│  │  role_configs   │  ← NEW: Dynamic role configuration                │
│  ├─────────────────┤                                                    │
│  │ id (PK, UUID)   │    Stores colors & display names for all roles   │
│  │ role_id (unique)│    Default BMAD roles seeded on startup          │
│  │ display_name    │    Custom roles auto-created when first seen     │
│  │ color           │                                                    │
│  │ zone_color      │                                                    │
│  │ is_default      │                                                    │
│  │ created_at      │                                                    │
│  └─────────────────┘                                                    │
│                                                                          │
│  ┌─────────────────┐         ┌─────────────────┐                       │
│  │    companies    │         │     agents      │                       │
│  ├─────────────────┤         ├─────────────────┤                       │
│  │ id (PK, UUID)   │◄────────│ company_id (FK) │                       │
│  │ name            │    1:N  │ id (PK, UUID)   │                       │
│  │ description     │         │ agent_id        │                       │
│  │ created_at      │         │ name            │                       │
│  │ updated_at      │         │ role (string)   │─ ─ ─▶ role_configs   │
│  └────────┬────────┘         │ status          │       (lookup)       │
│           │                   │ current_task    │                       │
│           │                   │ position_zone   │                       │
│           │                   │ position_x      │                       │
│           │                   │ position_y      │                       │
│           │                   │ created_at      │                       │
│           │                   └─────────────────┘                       │
│           │                                                              │
│           │ 1:N                                                          │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐         ┌─────────────────┐                       │
│  │     events      │         │ movement_queue  │                       │
│  ├─────────────────┤         ├─────────────────┤                       │
│  │ id (PK, UUID)   │         │ id (PK, UUID)   │                       │
│  │ company_id (FK) │         │ company_id (FK) │                       │
│  │ from_agent_id   │         │ agent_id        │                       │
│  │ to_agent_id     │         │ from_zone       │                       │
│  │ event_type      │         │ to_zone         │                       │
│  │ payload (JSON)  │         │ purpose         │                       │
│  │ inferred_actions│         │ artifact        │                       │
│  │ timestamp       │         │ status          │                       │
│  └─────────────────┘         │ created_at      │                       │
│                               │ completed_at    │                       │
│                               └─────────────────┘                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Dynamic Role System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DYNAMIC ROLE CREATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Client registers company with agents:                               │
│     POST /api/companies                                                 │
│     {                                                                    │
│       "agents": [                                                        │
│         {"agent_id": "DEV-001", "role": "developer", ...},  ← Known    │
│         {"agent_id": "SEC-001", "role": "security", ...}    ← Unknown  │
│       ]                                                                  │
│     }                                                                    │
│                                                                          │
│  2. Server checks role_configs table:                                   │
│     ┌────────────────────────────────────────────────────────────────┐ │
│     │  "developer" → Found in role_configs (default BMAD role)       │ │
│     │  "security"  → NOT found → Auto-create new role config         │ │
│     └────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  3. Auto-create role config for unknown role:                           │
│     {                                                                    │
│       "role_id": "security",                                            │
│       "display_name": "Security",        ← Auto from snake_case        │
│       "color": "#EC4899",                ← Next from color palette     │
│       "zone_color": "rgba(236,72,153,0.3)",                            │
│       "is_default": false                                               │
│     }                                                                    │
│                                                                          │
│  4. Frontend receives role_config in state response:                    │
│     GET /api/companies/{id}/state                                       │
│     {                                                                    │
│       "agents": [...],                                                  │
│       "role_configs": {                                                 │
│         "developer": {"display_name": "Developer", "color": "#22C55E"},│
│         "security": {"display_name": "Security", "color": "#EC4899"}   │
│       }                                                                  │
│     }                                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_agents_company ON agents(company_id);
CREATE INDEX idx_agents_agent_id ON agents(agent_id);
CREATE INDEX idx_agents_role ON agents(role);
CREATE INDEX idx_events_company ON events(company_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_movements_company ON movement_queue(company_id);
CREATE INDEX idx_movements_status ON movement_queue(status);
CREATE UNIQUE INDEX idx_role_configs_role_id ON role_configs(role_id);
```

---

## 7. Deployment Architecture

### 7.1 Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ==================== FRONTEND ====================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - backend
    networks:
      - dashboard-network

  # ==================== BACKEND ====================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://dashboard:dashboard@db:5432/sdlc_dashboard
      - CORS_ORIGINS=http://localhost:3000
      - LOG_LEVEL=INFO
    depends_on:
      db:
        condition: service_healthy
    networks:
      - dashboard-network

  # ==================== DATABASE ====================
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=dashboard
      - POSTGRES_PASSWORD=dashboard
      - POSTGRES_DB=sdlc_dashboard
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dashboard"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - dashboard-network

volumes:
  postgres_data:

networks:
  dashboard-network:
    driver: bridge
```

### 7.2 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Start dev server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### 7.3 Backend Dockerfile

```dockerfile
# backend/Dockerfile

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

# Copy source
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start with hot reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### 7.4 Container Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER NETWORK                              │
│                    (dashboard-network)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌───────────────┐                                            │
│    │   Browser     │  http://localhost:3000                     │
│    └───────┬───────┘                                            │
│            │                                                     │
│            ▼                                                     │
│    ┌───────────────┐     ┌───────────────┐     ┌─────────────┐ │
│    │   frontend    │────▶│    backend    │────▶│     db      │ │
│    │   :3000       │     │    :8000      │     │   :5432     │ │
│    │               │     │               │     │             │ │
│    │  Vite + Phaser│     │   FastAPI     │     │ PostgreSQL  │ │
│    └───────────────┘     └───────────────┘     └─────────────┘ │
│            │                     │                              │
│            │                     │                              │
│            ▼                     ▼                              │
│       Volume:              Volume:                Volume:       │
│     ./frontend            ./backend           postgres_data     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

External Access:
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:8000
  - Database: localhost:5432 (for dev tools)
```

---

## 8. Security Considerations

### 8.1 API Security

| Measure | Implementation |
|---------|----------------|
| **Rate Limiting** | 100 requests/min per IP using slowapi |
| **Input Validation** | Pydantic models with strict types |
| **CORS** | Whitelist dashboard origin only |
| **SQL Injection** | SQLModel with parameterized queries |

### 8.2 Container Security

| Measure | Implementation |
|---------|----------------|
| **Non-root User** | Run containers as non-root |
| **Read-only FS** | Mount app code as read-only in production |
| **Network Isolation** | Internal Docker network |
| **Secret Management** | Environment variables (not hardcoded) |

### 8.3 Data Security

| Measure | Implementation |
|---------|----------------|
| **No PII** | Dashboard doesn't store personal data |
| **Payload Sanitization** | Strip sensitive fields from logs |
| **Database Access** | Internal network only |

---

## 9. Performance Considerations

### 9.1 Frontend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Texture Atlas** | Combine sprites into single texture |
| **Object Pooling** | Reuse agent/artifact objects |
| **Culling** | Only render visible agents |
| **WebGL** | Use WebGL renderer (default) |
| **Debounced Polling** | Skip poll if previous request pending |

### 9.2 Backend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Async I/O** | asyncpg for database operations |
| **Connection Pool** | SQLAlchemy async pool |
| **Query Optimization** | Indexed columns, selective fetching |
| **Response Caching** | Cache company list (short TTL) |

### 9.3 Database Optimization

| Technique | Implementation |
|-----------|----------------|
| **Indexes** | On foreign keys and query columns |
| **Partial Index** | For pending movements only |
| **JSONB** | For payload storage |
| **Vacuum** | Regular maintenance schedule |

---

## 10. Monitoring & Logging

### 10.1 Application Logging

```python
# Structured logging format
{
    "timestamp": "2026-02-03T10:30:00Z",
    "level": "INFO",
    "service": "backend",
    "event": "event_processed",
    "company_id": "uuid",
    "event_type": "WORK_REQUEST",
    "duration_ms": 45
}
```

### 10.2 Health Checks

```
GET /api/health

Response:
{
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "uptime_seconds": 3600
}
```

### 10.3 Metrics (Future)

| Metric | Type | Description |
|--------|------|-------------|
| `events_processed_total` | Counter | Total events processed |
| `event_processing_duration` | Histogram | Event processing time |
| `active_companies` | Gauge | Companies with recent activity |
| `api_requests_total` | Counter | Total API requests |

---

## 11. Development Workflow

### 11.1 Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run backend tests
docker-compose exec backend pytest

# Run frontend dev server
docker-compose exec frontend npm run dev

# Database migrations
docker-compose exec backend alembic upgrade head
```

### 11.2 Code Organization Guidelines

| Guideline | Description |
|-----------|-------------|
| **Single Responsibility** | Each service class handles one domain |
| **Dependency Injection** | Services receive dependencies via constructor |
| **Type Safety** | Full TypeScript/Python typing |
| **Error Handling** | Custom exceptions with meaningful messages |
| **Testing** | Unit tests for services, integration tests for API |

---

## 12. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-03 | Binh Tran | Initial architecture document |

---

## Appendix A: Technology Decisions

| Decision | Options Considered | Choice | Rationale |
|----------|-------------------|--------|-----------|
| Game Engine | Phaser, PixiJS, Three.js | Phaser 3 | Native isometric support, built-in tweens |
| Backend Framework | FastAPI, Django, Flask | FastAPI | Async, auto-docs, Pydantic integration |
| Database | PostgreSQL, MySQL, MongoDB | PostgreSQL | JSON support, reliability, SQLModel compatibility |
| ORM | SQLAlchemy, Django ORM, Tortoise | SQLModel | Single model for DB + API |
| Container Runtime | Docker Desktop, Colima, Podman | Colima | Lightweight, macOS native |
| Real-time Comm | WebSocket, SSE, Polling | REST + Polling | Simpler for MVP, sufficient latency |

## Appendix B: File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| TypeScript files | camelCase | `stateManager.ts` |
| Python modules | snake_case | `event_service.py` |
| React/Phaser components | PascalCase | `Agent.ts` |
| CSS/SCSS | kebab-case | `agent-tooltip.scss` |
| Database tables | snake_case plural | `companies`, `agents` |
| API endpoints | kebab-case | `/api/companies/{id}/state` |
