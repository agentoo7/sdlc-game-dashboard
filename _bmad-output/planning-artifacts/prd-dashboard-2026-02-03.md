---
document_type: PRD
version: 1.0
status: draft
date: 2026-02-03
author: Binh Tran
project_name: SDLC Game Dashboard
source: product-brief-dashboard-2026-02-03.md
---

# Product Requirements Document: SDLC Game Dashboard

## 1. Document Overview

### 1.1 Purpose
This PRD defines the detailed requirements for SDLC Game Dashboard - a web-based visualization platform that transforms AI Agent activities into an engaging, game-like experience for tech competitions and hackathons.

### 1.2 Scope
This document covers MVP requirements for:
- Backend API (FastAPI + PostgreSQL)
- Frontend Dashboard (Phaser.js + TypeScript)
- Data logging and retrieval system

### 1.3 References
- Product Brief: `product-brief-dashboard-2026-02-03.md`
- Technical Research: `phaser-2.5d-isometric-research.md`
- Project Context: `project-context.md`

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

| Goal | Description | Priority |
|------|-------------|----------|
| **G1** | Visualize AI agent work as entertaining game-like experience | P0 |
| **G2** | Support multiple virtual companies (teams) simultaneously | P0 |
| **G3** | Enable judges to review agent activities with full logs | P0 |
| **G4** | Maintain smooth performance during live events | P0 |

### 2.2 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame Rate | ≥30 FPS (target 60 FPS) | Browser DevTools |
| Event Latency | <2 seconds from API call to visual | Timestamp comparison |
| Load Time | <5 seconds initial load | Performance API |
| Uptime | 99.9% during event | Monitoring |
| Log Coverage | 100% agent actions logged | Database audit |
| Concurrent Companies | ≥5 (target 10) | Load testing |

---

## 3. User Stories

### 3.1 Spectator Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-S01** | As a spectator, I want to see a grid of company thumbnails so I can choose which team to watch | - Thumbnail grid visible on load<br>- Shows company name/logo<br>- Click navigates to company view |
| **US-S02** | As a spectator, I want to see agents as cute chibi characters so the experience feels like a game | - Agents rendered as chibi sprites<br>- Role-based colors applied<br>- Idle animations playing |
| **US-S03** | As a spectator, I want to see agents walk and hand off artifacts so I understand the workflow | - Walking animation when moving<br>- Artifact visible during handoff<br>- Return to desk after delivery |
| **US-S04** | As a spectator, I want to zoom and pan the office view so I can focus on specific areas | - Mouse scroll zooms in/out<br>- Click-drag pans the view<br>- Smooth transitions |
| **US-S05** | As a spectator, I want to click an agent to see their current status | - Click highlights agent<br>- Status tooltip/panel appears<br>- Shows role, ID, current state |

### 3.2 Judge Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-J01** | As a judge, I want to quickly switch between companies so I can evaluate multiple teams | - Company selector always accessible<br>- Switch completes in <1 second<br>- Previous state preserved |
| **US-J02** | As a judge, I want to view activity logs with timestamps so I can trace agent decisions | - Log panel accessible<br>- Shows timestamp, agent, event type<br>- Filterable by agent/type |
| **US-J03** | As a judge, I want to see full input/output payloads so I can evaluate agent quality | - Click log entry expands details<br>- Shows full request payload<br>- Shows full response payload |

### 3.3 System Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| **US-SYS01** | As a dev app, I want to register a company so my agents appear in the dashboard | - POST /api/companies creates company<br>- Returns company_id<br>- Company appears in selector |
| **US-SYS02** | As a dev app, I want to send business events so the dashboard visualizes my agents | - POST /api/events accepted<br>- Event logged with timestamp<br>- Visual update triggered |

---

## 4. Functional Requirements

### 4.1 Company Management

#### FR-CM01: Company Registration
```
Endpoint: POST /api/companies
Request Body:
{
  "name": "Team Alpha",
  "description": "AI-powered SDLC team",
  "agents": [
    {"agent_id": "BA-001", "role": "BA", "name": "Alice"},
    {"agent_id": "Dev-001", "role": "Developer", "name": "Bob"},
    {"agent_id": "QA-001", "role": "QA", "name": "Charlie"}
  ]
}
Response:
{
  "company_id": "uuid",
  "name": "Team Alpha",
  "created_at": "2026-02-03T10:00:00Z"
}
```

#### FR-CM02: List Companies
```
Endpoint: GET /api/companies
Response:
{
  "companies": [
    {
      "company_id": "uuid",
      "name": "Team Alpha",
      "agent_count": 5,
      "last_activity": "2026-02-03T10:30:00Z"
    }
  ]
}
```

#### FR-CM03: Get Company State
```
Endpoint: GET /api/companies/{company_id}/state
Response:
{
  "company_id": "uuid",
  "agents": [
    {
      "agent_id": "BA-001",
      "role": "BA",
      "name": "Alice",
      "status": "working",
      "position": {"zone": "BA", "x": 100, "y": 150},
      "current_task": "Writing user story"
    }
  ],
  "pending_movements": [
    {
      "agent_id": "Dev-001",
      "from_zone": "Dev",
      "to_zone": "QA",
      "purpose": "handoff",
      "artifact": "Feature implementation"
    }
  ]
}
```

### 4.2 Event Processing

#### FR-EP01: Receive Business Events
```
Endpoint: POST /api/events
Request Body:
{
  "company_id": "uuid",
  "from_agent": "BA-001",
  "to_agent": "Dev-001",
  "event_type": "WORK_REQUEST",
  "payload": {
    "task": "Implement login feature",
    "priority": "high",
    "input": "User story: As a user, I want to...",
    "artifacts": ["spec-001.md"]
  }
}
```

#### FR-EP02: Event Type Definitions

| Event Type | Visual Behavior | Required Fields |
|------------|-----------------|-----------------|
| `WORK_REQUEST` | from_agent walks to to_agent, hands off artifact, returns | from_agent, to_agent, payload |
| `WORK_COMPLETE` | from_agent walks to to_agent, delivers result, returns | from_agent, to_agent, payload |
| `REVIEW_REQUEST` | from_agent walks to to_agent, requests review, returns | from_agent, to_agent, payload |
| `FEEDBACK` | from_agent walks to to_agent, provides feedback, returns | from_agent, to_agent, payload |
| `THINKING` | Agent shows 💭 thought bubble | agent_id, payload.thought |
| `WORKING` | Agent shows 📝 working animation | agent_id, payload.task |
| `IDLE` | Agent returns to idle state | agent_id |

#### FR-EP03: Smart Movement Inference
The server automatically infers visual actions from business events:

1. **WORK_REQUEST received** →
   - Set from_agent status to "walking"
   - Calculate path: from_agent.zone → to_agent.zone
   - Queue animation: walk → arrive → handoff → return
   - Set to_agent status to "working" after handoff

2. **Movement completion** →
   - from_agent returns to original position
   - from_agent status returns to "idle"

### 4.3 Activity Logging

#### FR-AL01: Log Retrieval
```
Endpoint: GET /api/companies/{company_id}/logs
Query Parameters:
  - agent_id (optional): Filter by agent
  - event_type (optional): Filter by type
  - from_time (optional): Start timestamp
  - to_time (optional): End timestamp
  - limit (default: 100): Max results
  - offset (default: 0): Pagination offset

Response:
{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2026-02-03T10:30:00Z",
      "from_agent": "BA-001",
      "to_agent": "Dev-001",
      "event_type": "WORK_REQUEST",
      "payload": {...},
      "inferred_actions": ["walk", "handoff", "return"]
    }
  ],
  "total": 150,
  "has_more": true
}
```

### 4.4 Frontend Visualization

#### FR-FV01: Office Layout
- Isometric 2.5D perspective
- Department zones arranged in organic flow (top to bottom)
- Zones: Customer, BA, PM, Architect, Dev, QA
- Role-based zone colors:
  - Customer: Gray (#9CA3AF)
  - BA: Blue (#3B82F6)
  - PM: Purple (#8B5CF6)
  - Architect: Orange (#F97316)
  - Dev: Green (#22C55E)
  - QA: Red (#EF4444)

#### FR-FV02: Agent Rendering
- Chibi-style sprites (big head, small body)
- Role-based color coding matching zone colors
- Floating ID label above agent
- Animation states: idle, walk, work, think

#### FR-FV03: Agent Animations

| State | Animation |
|-------|-----------|
| Idle | Subtle breathing, occasional random actions (stretch, coffee) |
| Walking | 4-direction walk cycle with carried artifact |
| Working | Typing/writing animation with 📝 indicator |
| Thinking | Still pose with 💭 thought bubble |

#### FR-FV04: Camera Controls
- Zoom: Mouse scroll wheel (min 0.5x, max 2x)
- Pan: Click and drag
- Reset: Double-click empty area
- Smooth transitions using Phaser tweens

#### FR-FV05: Company Selector
- Thumbnail grid layout
- Shows company name
- Visual indicator for active company
- Click to switch (with loading transition)

#### FR-FV06: Agent Interaction
- Click agent: Highlight + show status tooltip
- Tooltip shows: Agent ID, Role, Current Status, Current Task

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Specification |
|-------------|---------------|
| **NFR-P01** | Dashboard maintains ≥30 FPS with 20+ active agents |
| **NFR-P02** | API response time <200ms for state queries |
| **NFR-P03** | Event processing latency <500ms server-side |
| **NFR-P04** | Initial page load <5 seconds on 3G connection |
| **NFR-P05** | Memory usage <200MB client-side |

### 5.2 Scalability

| Requirement | Specification |
|-------------|---------------|
| **NFR-S01** | Support ≥10 companies simultaneously |
| **NFR-S02** | Support ≥50 agents per company |
| **NFR-S03** | Handle ≥100 events per minute per company |
| **NFR-S04** | Support ≥100 concurrent viewers |

### 5.3 Reliability

| Requirement | Specification |
|-------------|---------------|
| **NFR-R01** | 99.9% uptime during event duration |
| **NFR-R02** | Graceful degradation on API failure |
| **NFR-R03** | Auto-reconnect on connection loss |
| **NFR-R04** | No data loss for logged events |

### 5.4 Security

| Requirement | Specification |
|-------------|---------------|
| **NFR-SEC01** | API rate limiting (100 req/min per IP) |
| **NFR-SEC02** | Input validation on all endpoints |
| **NFR-SEC03** | CORS configured for dashboard origin |

### 5.5 Compatibility

| Requirement | Specification |
|-------------|---------------|
| **NFR-C01** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **NFR-C02** | Responsive design (min 1024px width) |
| **NFR-C03** | WebGL required (Canvas fallback optional) |

---

## 6. Data Models

### 6.1 Database Schema (PostgreSQL + SQLModel)

```python
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON


# AgentRole is now a dynamic string (not Enum)
# Default roles (BMAD method): customer, ba, pm, architect, developer, qa
# Custom roles: Any string sent by client (e.g., "security_engineer", "devops")

# ==================== ROLE CONFIG (Dynamic Roles) ====================
class RoleConfig(SQLModel, table=True):
    """
    Stores role configurations including auto-generated colors for custom roles.
    Default BMAD roles are seeded on startup.
    Custom roles are auto-created when first encountered.
    """
    __tablename__ = "role_configs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    role_id: str = Field(unique=True, index=True, max_length=50)  # e.g., "developer", "security_engineer"
    display_name: str = Field(max_length=100)  # e.g., "Developer", "Security Engineer"
    color: str = Field(max_length=20)  # e.g., "#22C55E"
    zone_color: str = Field(max_length=50)  # e.g., "rgba(34, 197, 94, 0.3)"
    is_default: bool = Field(default=False)  # True for BMAD roles
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Default BMAD roles (seeded on startup)
DEFAULT_ROLES = [
    {"role_id": "customer", "display_name": "Customer", "color": "#9CA3AF", "is_default": True},
    {"role_id": "ba", "display_name": "Business Analyst", "color": "#3B82F6", "is_default": True},
    {"role_id": "pm", "display_name": "Project Manager", "color": "#8B5CF6", "is_default": True},
    {"role_id": "architect", "display_name": "Architect", "color": "#F97316", "is_default": True},
    {"role_id": "developer", "display_name": "Developer", "color": "#22C55E", "is_default": True},
    {"role_id": "qa", "display_name": "QA Engineer", "color": "#EF4444", "is_default": True},
]

# Extended color palette for auto-generated custom roles
CUSTOM_ROLE_COLORS = [
    "#EC4899",  # Pink 500
    "#06B6D4",  # Cyan 500
    "#84CC16",  # Lime 500
    "#F59E0B",  # Amber 500
    "#6366F1",  # Indigo 500
    "#14B8A6",  # Teal 500
    "#F43F5E",  # Rose 500
    "#0EA5E9",  # Sky 500
]


class AgentStatus(str, Enum):
    IDLE = "idle"
    THINKING = "thinking"
    WORKING = "working"
    WALKING = "walking"


class EventType(str, Enum):
    WORK_REQUEST = "WORK_REQUEST"
    WORK_COMPLETE = "WORK_COMPLETE"
    REVIEW_REQUEST = "REVIEW_REQUEST"
    FEEDBACK = "FEEDBACK"
    THINKING = "THINKING"
    WORKING = "WORKING"
    IDLE = "IDLE"


# ==================== COMPANY ====================
class Company(SQLModel, table=True):
    __tablename__ = "companies"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    agents: list["Agent"] = Relationship(back_populates="company")
    events: list["Event"] = Relationship(back_populates="company")


# ==================== AGENT ====================
class Agent(SQLModel, table=True):
    __tablename__ = "agents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    agent_id: str = Field(index=True, max_length=50)  # e.g., "Dev-001"
    name: str = Field(max_length=100)
    role: str = Field(max_length=50)  # Dynamic role ID (e.g., "developer", "security_engineer")
    status: AgentStatus = Field(default=AgentStatus.IDLE)
    current_task: Optional[str] = Field(default=None, max_length=500)
    position_zone: str = Field(default="")  # Current zone
    position_x: float = Field(default=0.0)
    position_y: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    company: Company = Relationship(back_populates="agents")


# ==================== EVENT ====================
class Event(SQLModel, table=True):
    __tablename__ = "events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    from_agent_id: Optional[str] = Field(default=None, max_length=50)
    to_agent_id: Optional[str] = Field(default=None, max_length=50)
    event_type: EventType
    payload: dict = Field(default={}, sa_column=Column(JSON))
    inferred_actions: list[str] = Field(default=[], sa_column=Column(JSON))
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    company: Company = Relationship(back_populates="events")


# ==================== MOVEMENT QUEUE ====================
class MovementQueue(SQLModel, table=True):
    __tablename__ = "movement_queue"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id", index=True)
    agent_id: str = Field(max_length=50)
    from_zone: str = Field(max_length=50)
    to_zone: str = Field(max_length=50)
    purpose: str = Field(max_length=50)  # "handoff", "return"
    artifact: Optional[str] = Field(default=None, max_length=200)
    status: str = Field(default="pending")  # pending, in_progress, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = Field(default=None)
```

### 6.2 API Request/Response Models

```python
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


# ==================== COMPANY ====================
class AgentCreate(BaseModel):
    agent_id: str
    name: str
    role: str  # Dynamic role ID (e.g., "developer", "security_engineer")


class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    agents: list[AgentCreate]


class CompanyResponse(BaseModel):
    company_id: UUID
    name: str
    created_at: datetime


class CompanyListItem(BaseModel):
    company_id: UUID
    name: str
    agent_count: int
    last_activity: Optional[datetime]


# ==================== EVENT ====================
class EventCreate(BaseModel):
    company_id: UUID
    from_agent: Optional[str] = None
    to_agent: Optional[str] = None
    event_type: EventType
    payload: dict = {}


class EventResponse(BaseModel):
    id: UUID
    timestamp: datetime
    status: str = "accepted"


# ==================== STATE ====================
class AgentState(BaseModel):
    agent_id: str
    role: str  # Dynamic role ID
    role_config: Optional[dict] = None  # {display_name, color, zone_color}
    name: str
    status: AgentStatus
    position: dict  # {"zone": "Dev", "x": 100, "y": 150}
    current_task: Optional[str]


class PendingMovement(BaseModel):
    agent_id: str
    from_zone: str
    to_zone: str
    purpose: str
    artifact: Optional[str]


class CompanyState(BaseModel):
    company_id: UUID
    agents: list[AgentState]
    pending_movements: list[PendingMovement]


# ==================== LOGS ====================
class LogEntry(BaseModel):
    id: UUID
    timestamp: datetime
    from_agent: Optional[str]
    to_agent: Optional[str]
    event_type: EventType
    payload: dict
    inferred_actions: list[str]


class LogsResponse(BaseModel):
    logs: list[LogEntry]
    total: int
    has_more: bool
```

---

## 7. API Specification Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/companies` | Register new company with agents |
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/{id}` | Get company details |
| GET | `/api/companies/{id}/state` | Get current state (polling) |
| POST | `/api/events` | Submit business event |
| GET | `/api/companies/{id}/logs` | Get activity logs |
| GET | `/api/health` | Health check |

---

## 8. UI/UX Specifications

### 8.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Company Selector (Thumbnail Grid)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    MAIN VIEWPORT                            │
│                                                             │
│              ┌─────────────────────┐                        │
│              │     CUSTOMER        │                        │
│              └─────────────────────┘                        │
│                       │                                     │
│         ┌─────────────┼─────────────┐                       │
│         │             │             │                       │
│      ┌──▼──┐      ┌───▼───┐     ┌──▼──┐                    │
│      │ BA  │      │  PM   │     │ARCH │                    │
│      └──┬──┘      └───┬───┘     └──┬──┘                    │
│         │             │            │                        │
│         └─────────────┼────────────┘                        │
│                       │                                     │
│                   ┌───▼───┐                                 │
│                   │  DEV  │                                 │
│                   └───┬───┘                                 │
│                       │                                     │
│                   ┌───▼───┐                                 │
│                   │  QA   │                                 │
│                   └───────┘                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ FOOTER: Activity Log Panel (Collapsible)                     │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Customer Zone | Gray | #9CA3AF |
| BA Zone | Blue | #3B82F6 |
| PM Zone | Purple | #8B5CF6 |
| Architect Zone | Orange | #F97316 |
| Dev Zone | Green | #22C55E |
| QA Zone | Red | #EF4444 |
| Background | Dark | #1F2937 |
| Text | Light | #F9FAFB |

### 8.3 Interaction States

| Action | Visual Feedback |
|--------|-----------------|
| Hover company thumbnail | Scale up 1.05x, glow effect |
| Click company | Loading spinner, transition animation |
| Hover agent | Highlight outline |
| Click agent | Selection ring, tooltip appears |
| Zoom in/out | Smooth scale transition |
| Pan | Smooth position update |

---

## 9. Technical Constraints

### 9.1 Development Environment
- macOS with Colima (Docker runtime)
- All services run in Docker containers
- No local dependencies required

### 9.2 Technology Stack (Locked)
- Frontend: Phaser 3.x + TypeScript + Vite
- Backend: FastAPI + Python 3.11+
- Database: PostgreSQL 16
- ORM: SQLModel
- Container: Docker + docker-compose

### 9.3 API Protocol
- REST API (no WebSocket for MVP)
- Frontend polls `/api/companies/{id}/state` for updates
- Polling interval: 1 second

---

## 10. Dependencies

### 10.1 External Systems
- Dev App: Sends business events to Dashboard API

### 10.2 Third-Party Libraries

**Frontend:**
- phaser: ^3.70.0
- typescript: ^5.3.0
- vite: ^5.0.0

**Backend:**
- fastapi: ^0.109.0
- sqlmodel: ^0.0.14
- uvicorn: ^0.27.0
- asyncpg: ^0.29.0
- pydantic: ^2.5.0

---

## 11. Out of Scope (MVP)

| Feature | Reason | Future Version |
|---------|--------|----------------|
| WebSocket real-time | REST polling sufficient | V2 |
| Sound effects | Time consuming | V2 |
| Particle effects | Polish feature | V2 |
| Follow mode | Nice-to-have | V1.5 |
| Timeline replay | Advanced feature | V2 |
| Authentication | Public viewing for event | V2 |
| Multi-language | Single event location | V2 |

---

## 12. Open Questions

| # | Question | Status | Decision |
|---|----------|--------|----------|
| 1 | Polling interval for state updates? | Decided | 1 second |
| 2 | Max agents per company? | Decided | 50 |
| 3 | Log retention period? | TBD | - |
| 4 | Asset storage location? | TBD | - |
| 5 | Deployment target? | TBD | - |

---

## 13. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-03 | Binh Tran | Initial PRD from Product Brief |

---

## Appendix A: Event Flow Diagram

```
┌──────────────┐     POST /api/events      ┌──────────────┐
│   Dev App    │ ────────────────────────► │   Backend    │
└──────────────┘                           └──────┬───────┘
                                                  │
                                                  │ 1. Validate event
                                                  │ 2. Log to database
                                                  │ 3. Infer visual actions
                                                  │ 4. Update agent states
                                                  │ 5. Queue movements
                                                  ▼
┌──────────────┐     GET /state (poll)     ┌──────────────┐
│  Dashboard   │ ◄──────────────────────── │   Backend    │
│  (Phaser)    │                           └──────────────┘
└──────┬───────┘
       │
       │ 1. Receive state update
       │ 2. Diff with local state
       │ 3. Trigger animations
       │ 4. Update sprites
       ▼
┌──────────────┐
│   Rendered   │
│    Scene     │
└──────────────┘
```

## Appendix B: Agent State Machine

```
                    ┌─────────┐
                    │  IDLE   │◄────────────────────┐
                    └────┬────┘                     │
                         │                          │
           THINKING      │      WORK_REQUEST        │
           event         │      (as from_agent)     │
                         │                          │
              ┌──────────┴──────────┐               │
              ▼                     ▼               │
        ┌──────────┐          ┌──────────┐         │
        │ THINKING │          │ WALKING  │         │
        └────┬─────┘          └────┬─────┘         │
             │                     │               │
             │ WORKING             │ Arrive at     │
             │ event               │ destination   │
             ▼                     ▼               │
        ┌──────────┐          ┌──────────┐         │
        │ WORKING  │          │ HANDOFF  │─────────┘
        └────┬─────┘          └──────────┘
             │                (auto return)
             │ IDLE/WORK_COMPLETE
             │
             └────────────────────────────────────►
```
