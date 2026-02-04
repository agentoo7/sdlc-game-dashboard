---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
status: complete
inputDocuments:
  - "_bmad-output/planning-artifacts/prd-dashboard-2026-02-03.md"
  - "_bmad-output/planning-artifacts/architecture-2026-02-03.md"
  - "_bmad-output/planning-artifacts/ui-ux-design-2026-02-03.md"
  - "_bmad-output/research/phaser-2.5d-isometric-research.md"
  - "_bmad-output/project-context.md"
---

# SDLC Game Dashboard - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SDLC Game Dashboard, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-CM01 | Company Registration - POST /api/companies creates company with agents |
| FR-CM02 | List Companies - GET /api/companies returns all companies |
| FR-CM03 | Get Company State - GET /api/companies/{id}/state returns agents and pending movements |
| FR-EP01 | Receive Business Events - POST /api/events accepts event payload |
| FR-EP02 | Event Type Definitions - System handles 43 event types (WORK_REQUEST, THINKING, WORKING, etc.) |
| FR-EP03 | Smart Movement Inference - Server infers visual actions from business events |
| FR-AL01 | Log Retrieval - GET /api/companies/{id}/logs with filtering |
| FR-FV01 | Office Layout - Isometric 2.5D with department zones (Customer, BA, PM, Architect, Dev, QA) |
| FR-FV02 | Agent Rendering - Chibi sprites with role-based colors and floating ID labels |
| FR-FV03 | Agent Animations - Idle, Walk, Work, Think states |
| FR-FV04 | Camera Controls - Zoom (0.5x-2x), Pan, Reset |
| FR-FV05 | Company Selector - Thumbnail grid with visual indicator for active company |
| FR-FV06 | Agent Interaction - Click to highlight and show status tooltip |
| FR-AG01 | Create Agent - POST /api/companies/{id}/agents creates new agent |
| FR-AG02 | Remove Agent - DELETE /api/companies/{id}/agents/{agent_id} |
| FR-DYN01 | Dynamic Role System - Auto-create role configs for unknown roles |
| FR-HEALTH | Health Check - GET /api/health endpoint |
| FR-CUSTOM | Custom Events - CUSTOM_EVENT type with configurable animation |

### Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-P01 | Performance | Dashboard maintains ≥30 FPS with 20+ active agents |
| NFR-P02 | Performance | API response time <200ms for state queries |
| NFR-P03 | Performance | Event processing latency <500ms server-side |
| NFR-P04 | Performance | Initial page load <5 seconds on 3G connection |
| NFR-P05 | Performance | Memory usage <200MB client-side |
| NFR-S01 | Scalability | Support ≥10 companies simultaneously |
| NFR-S02 | Scalability | Support ≥50 agents per company |
| NFR-S03 | Scalability | Handle ≥100 events per minute per company |
| NFR-S04 | Scalability | Support ≥100 concurrent viewers |
| NFR-R01 | Reliability | 99.9% uptime during event duration |
| NFR-R02 | Reliability | Graceful degradation on API failure |
| NFR-R03 | Reliability | API calls retry on network failure (with exponential backoff) |
| NFR-R04 | Reliability | No data loss for logged events |
| NFR-SEC01 | Security | API rate limiting (100 req/min per IP) |
| NFR-SEC02 | Security | Input validation on all endpoints |
| NFR-C01 | Compatibility | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |

### Additional Requirements

**Technical/Infrastructure Requirements:**
- All services must run in Docker containers (Colima on macOS)
- Frontend: Phaser 3.x + TypeScript + Vite
- Backend: FastAPI + Python 3.11 + SQLModel
- Database: PostgreSQL 16
- REST API only (no WebSocket for MVP)
- Server handles ALL visualization logic (client only notifies)
- docker-compose.yml for service orchestration
- Volume mounts for hot reload development

**UX/Design Requirements:**
- Chibi character proportions (Head:Body:Legs = 4:3:1)
- Role-based zone colors (6 default BMAD roles + 8 extended palette for custom roles)
- Placeholder art acceptable for MVP (can upgrade later)
- Minimum screen width: 1024px
- Animation timings: walk cycle 800ms, handoff 500ms, bubble appear 300ms
- Dark theme UI (Slate 800 background)

**Development Constraints:**
- macOS primary development environment
- No local dependencies - all tooling in containers
- Reproducible builds across team members

### FR Coverage Map

| FR ID | Epic | Description |
|-------|------|-------------|
| FR-HEALTH | Epic 1 | Health check endpoint |
| FR-CM01 | Epic 2 | Company registration |
| FR-CM02 | Epic 2 | List companies |
| FR-CM03 | Epic 2 | Get company state |
| FR-AG01 | Epic 2 | Create agent |
| FR-AG02 | Epic 2 | Remove agent |
| FR-DYN01 | Epic 2 | Dynamic role system |
| FR-FV01 | Epic 2 | Office layout (zones) |
| FR-FV02 | Epic 2 | Agent rendering |
| FR-FV05 | Epic 2 | Company selector |
| FR-EP01 | Epic 3 | Receive events API |
| FR-EP02 | Epic 3 | Event type definitions |
| FR-EP03 | Epic 3 | Smart movement inference |
| FR-FV03 | Epic 3 | Agent animations |
| FR-CUSTOM | Epic 3 | Custom events |
| FR-AL01 | Epic 4 | Log retrieval |
| FR-FV04 | Epic 4 | Camera controls |
| FR-FV06 | Epic 4 | Agent interaction |
| FR-SIM01 | Epic 5 | Simulator web app setup |
| FR-SIM02 | Epic 5 | Company creation UI |
| FR-SIM03 | Epic 5 | Agent management UI |
| FR-SIM04 | Epic 5 | Event sender UI |
| FR-SIM05 | Epic 5 | Predefined test scenarios |
| FR-SIM06 | Epic 5 | Event history panel |
| FR-SIM07 | Epic 5 | Connection status indicator |

## Epic List

### Epic 1: Running Game Dashboard (Foundation)

**Goal:** Developers có thể chạy full stack locally và viewers thấy được basic game screen.

**FRs covered:** FR-HEALTH

**Includes:**
- Docker setup (backend, frontend, PostgreSQL)
- FastAPI backend với health check
- Phaser 3 game khởi tạo với placeholder screen
- Database migrations (Alembic)

---

### Epic 2: Teams Can Register and Appear

**Goal:** Client Apps có thể register companies và agents, và thấy chúng xuất hiện trên dashboard.

**FRs covered:** FR-CM01, FR-CM02, FR-CM03, FR-AG01, FR-AG02, FR-DYN01, FR-FV01, FR-FV02, FR-FV05

**Includes:**
- Company registration API
- Agent management API
- Dynamic role system (auto-create colors for unknown roles)
- Isometric office layout với department zones
- Agent sprites rendered tại vị trí desk
- Company selector (thumbnail grid)

---

### Epic 3: Teams Can Demonstrate AI Activities

**Goal:** Client Apps có thể gửi events về hoạt động AI, viewers thấy agents moving và working với animations.

**FRs covered:** FR-EP01, FR-EP02, FR-EP03, FR-FV03, FR-CUSTOM

**Includes:**
- Event API (tất cả 43 event types)
- Event processing và logging
- Smart movement inference (server decides visualization)
- Agent animations (idle, walk, work, think)
- Movement/handoff animations
- Bubble indicators (💭📝⚡✅❌)
- Custom event support

---

### Epic 4: Judges Can Review and Evaluate

**Goal:** Judges có full tooling để evaluate teams - switch companies, zoom/pan, view logs với filter.

**FRs covered:** FR-AL01, FR-FV04, FR-FV06

**Includes:**
- Camera controls (zoom 0.5x-2x, pan, reset)
- Agent interaction (click to show tooltip with status)
- Activity log panel (collapsible, filterable)
- Log detail expansion (show full payload)

---

### Epic 5: Simulator Client Web App

**Goal:** Developers và testers có web-based simulator để test dashboard mà không cần client app thật.

**FRs covered:** FR-SIM01, FR-SIM02, FR-SIM03, FR-SIM04, FR-SIM05, FR-SIM06, FR-SIM07

**Includes:**
- Standalone web app (React + TypeScript + Vite)
- Company/Agent creation forms
- Event sender với dropdown chọn event types
- Predefined test scenarios (demo, stress test)
- Event history log
- Connection status indicator

---

## Epic 1: Running Game Dashboard (Foundation)

**Goal:** Developers có thể chạy full stack locally và viewers thấy được basic game screen.

### Story 1.1: Docker Development Environment Setup

As a **developer**,
I want **to run `docker-compose up` and have all services start correctly**,
So that **I can begin development without installing local dependencies**.

**Acceptance Criteria:**

**Given** the project is cloned and Colima/Docker is running
**When** I run `docker-compose up -d`
**Then** three containers start: frontend (port 3000), backend (port 8000), db (port 5432)
**And** all containers show "healthy" status within 60 seconds
**And** I can access `http://localhost:3000` and `http://localhost:8000` from browser

---

### Story 1.2: Backend Health Check API

As a **client app**,
I want **to call GET /api/health and receive system status**,
So that **I can verify the dashboard server is running before sending events**.

**Acceptance Criteria:**

**Given** the backend container is running
**When** I send GET request to `http://localhost:8000/api/health`
**Then** I receive HTTP 200 with JSON: `{"status": "healthy", "version": "1.0.0", "database": "connected"}`
**And** response time is <200ms (NFR-P02)

**Given** the database is not connected
**When** I send GET request to `/api/health`
**Then** I receive JSON with `"database": "disconnected"` but still HTTP 200

---

### Story 1.3: Phaser Game Initialization

As a **viewer**,
I want **to open the dashboard URL and see a game canvas loading**,
So that **I know the visualization system is ready**.

**Acceptance Criteria:**

**Given** the frontend container is running
**When** I open `http://localhost:3000` in Chrome/Firefox/Safari/Edge
**Then** I see a Phaser 3 game canvas (800x600 minimum)
**And** the canvas shows a placeholder message "SDLC Game Dashboard - Loading..."
**And** page load completes in <5 seconds (NFR-P04)
**And** browser console shows no errors

---

### Story 1.4: Database Schema Migration Setup

As a **developer**,
I want **Alembic migrations to run automatically on backend startup**,
So that **database schema is always up-to-date without manual intervention**.

**Acceptance Criteria:**

**Given** the backend container starts
**When** it connects to PostgreSQL
**Then** Alembic runs pending migrations automatically
**And** migration status is logged to console
**And** if migrations fail, backend logs error but continues running (graceful degradation)

---

## Epic 2: Teams Can Register and Appear

**Goal:** Client Apps có thể register companies và agents, và thấy chúng xuất hiện trên dashboard.

### Story 2.1: Company Registration API

As a **client app**,
I want **to register my team via POST /api/companies**,
So that **my team appears on the dashboard for viewers to watch**.

**Acceptance Criteria:**

**Given** the backend is running
**When** I POST to `/api/companies` with `{"name": "Team Alpha", "description": "AI team"}`
**Then** I receive HTTP 201 with `{"company_id": "uuid", "name": "Team Alpha", "created_at": "..."}`
**And** the company is persisted in the database
**And** response time is <200ms

**Given** I POST with missing required field `name`
**When** the request is processed
**Then** I receive HTTP 422 with validation error details

---

### Story 2.2: List Companies API

As a **viewer**,
I want **to fetch all registered companies via GET /api/companies**,
So that **I can see which teams are available to watch**.

**Acceptance Criteria:**

**Given** 3 companies are registered
**When** I GET `/api/companies`
**Then** I receive HTTP 200 with array of 3 companies
**And** each company includes: `company_id`, `name`, `agent_count`, `last_activity`, `status`
**And** response time is <200ms

**Given** no companies are registered
**When** I GET `/api/companies`
**Then** I receive HTTP 200 with empty array `{"companies": []}`

---

### Story 2.3: Create Agent API

As a **client app**,
I want **to create agents for my company via POST /api/companies/{id}/agents**,
So that **my AI agents appear in the office visualization**.

**Acceptance Criteria:**

**Given** company "Team Alpha" exists
**When** I POST to `/api/companies/{id}/agents` with `{"agent_id": "BA-001", "role": "ba", "name": "Alice"}`
**Then** I receive HTTP 201 with agent details including `role_config` (display_name, color)
**And** the agent is persisted with status "idle" and position in their role's zone

**Given** I try to create agent with duplicate `agent_id` within same company
**When** the request is processed
**Then** I receive HTTP 409 Conflict error

**Given** company supports up to 50 agents (NFR-S02)
**When** I try to create 51st agent
**Then** I receive HTTP 400 with "Maximum agents reached" error

---

### Story 2.4: Dynamic Role System

As a **client app**,
I want **to use custom roles like "security_engineer" that don't exist in defaults**,
So that **my team structure is accurately represented**.

**Acceptance Criteria:**

**Given** I create an agent with `"role": "security_engineer"` (unknown role)
**When** the request is processed
**Then** system auto-creates role_config with:
  - `display_name`: "Security Engineer" (converted from snake_case)
  - `color`: Next available from extended palette (#EC4899, #06B6D4, etc.)
  - `is_default`: false
**And** subsequent agents with same role reuse this config

**Given** all 6 default roles + 8 extended colors are used
**When** I create agent with new unknown role
**Then** system generates deterministic color using HSL from role name hash

---

### Story 2.5: Get Company State API

As a **viewer frontend**,
I want **to fetch current state of a company via GET /api/companies/{id}/state**,
So that **I can render the office with all agents in correct positions**.

**Acceptance Criteria:**

**Given** company has 5 agents in various states
**When** I GET `/api/companies/{id}/state`
**Then** I receive HTTP 200 with:
  - `company_id`
  - `agents[]` with each agent's: `agent_id`, `role`, `role_config`, `name`, `status`, `position`, `current_task`
  - `pending_movements[]` (empty for now - will be used in Epic 3)
  - `last_updated` timestamp
**And** response time is <200ms

---

### Story 2.6: Remove Agent API

As a **client app**,
I want **to remove an agent via DELETE /api/companies/{id}/agents/{agent_id}**,
So that **agents that are no longer active disappear from the dashboard**.

**Acceptance Criteria:**

**Given** agent "BA-001" exists in company
**When** I DELETE `/api/companies/{id}/agents/BA-001`
**Then** I receive HTTP 200 with `{"agent_id": "BA-001", "status": "removed"}`
**And** agent is removed from database
**And** subsequent GET /state no longer includes this agent

**Given** agent_id doesn't exist
**When** I send DELETE request
**Then** I receive HTTP 404 Not Found

---

### Story 2.7: Isometric Office Layout

As a **viewer**,
I want **to see an isometric office floor with colored department zones**,
So that **I can understand where each role works**.

**Acceptance Criteria:**

**Given** the Phaser game is loaded
**When** MainScene initializes
**Then** I see an isometric tilemap with 6 department zones arranged vertically:
  - Customer (gray #9CA3AF) at top
  - BA (blue #3B82F6), PM (violet #8B5CF6), Architect (orange #F97316) in middle row
  - Dev (green #22C55E) below
  - QA (red #EF4444) at bottom
**And** each zone has a floating label with the zone name
**And** zones have semi-transparent colored overlays

---

### Story 2.8: Agent Sprite Rendering

As a **viewer**,
I want **to see agents as colored circles with role letters at their desk positions**,
So that **I can identify agents by their role and ID**.

**Acceptance Criteria:**

**Given** company state has agents loaded
**When** MainScene renders
**Then** each agent appears as a colored circle (placeholder art) with:
  - Role letter inside (D for Developer, B for BA, etc.)
  - Agent ID label floating above ("Dev-001")
  - Color matching their role_config
**And** agents are positioned within their role's zone
**And** multiple agents of same role are arranged to not overlap

---

### Story 2.9: Company Selector UI

As a **viewer**,
I want **to see a thumbnail grid of all companies and click to switch**,
So that **I can choose which team to watch**.

**Acceptance Criteria:**

**Given** 5 companies are registered
**When** I view the dashboard
**Then** I see a horizontal bar at top with 5 company thumbnails
**And** each thumbnail shows: company name, agent count
**And** the currently selected company has a gold border highlight

**Given** I click on a different company thumbnail
**When** the click is processed
**Then** the game view switches to that company's state
**And** the selected thumbnail updates to show gold border
**And** transition completes in <500ms

---

## Epic 3: Teams Can Demonstrate AI Activities

**Goal:** Client Apps có thể gửi events về hoạt động AI, viewers thấy agents moving và working với animations.

### Story 3.1: Event API Endpoint

As a **client app**,
I want **to send events via POST /api/events**,
So that **my AI agent activities are recorded and visualized**.

**Acceptance Criteria:**

**Given** company and agent exist
**When** I POST to `/api/events` with:
```json
{
  "company_id": "uuid",
  "agent_id": "BA-001",
  "event_type": "THINKING",
  "payload": {"thought": "Analyzing requirements..."}
}
```
**Then** I receive HTTP 200 with `{"event_id": "uuid", "timestamp": "...", "status": "accepted"}`
**And** event is persisted to database
**And** processing time is <500ms (NFR-P03)

**Given** invalid company_id or agent_id
**When** I POST event
**Then** I receive HTTP 404 with error details

**Given** invalid event_type
**When** I POST event
**Then** I receive HTTP 422 with validation error

---

### Story 3.2: Core Event Types Processing

As a **server**,
I want **to process core event types (THINKING, WORKING, EXECUTING, IDLE, ERROR, TASK_COMPLETE)**,
So that **agent states are updated correctly for visualization**.

**Acceptance Criteria:**

**Given** agent is "idle"
**When** THINKING event is received
**Then** agent status changes to "thinking"
**And** `current_task` is updated from payload

**Given** agent is "thinking"
**When** WORKING event is received
**Then** agent status changes to "working"

**Given** any state
**When** IDLE event is received
**Then** agent status changes to "idle"
**And** `current_task` is cleared

**Given** any state
**When** ERROR event is received
**Then** agent status changes to "error" (temporary)
**And** error details are logged

**Given** TASK_COMPLETE event is received
**When** processed
**Then** agent status changes to "idle"
**And** completion is logged with artifacts

---

### Story 3.3: Communication Event Types Processing

As a **server**,
I want **to process communication events (MESSAGE_SEND, MESSAGE_RECEIVE)**,
So that **agent-to-agent interactions trigger movement animations**.

**Acceptance Criteria:**

**Given** BA-001 sends MESSAGE_SEND to Dev-001
**When** event is processed
**Then** server infers actions: `["BA-001:walk_to:Dev-001", "BA-001:handoff", "BA-001:return"]`
**And** movement is queued in `pending_movements`
**And** BA-001 status becomes "walking"

**Given** Dev-001 receives MESSAGE_RECEIVE from BA-001
**When** event is processed
**Then** Dev-001 shows acknowledgment state briefly
**And** event is logged with reference to original message

---

### Story 3.4: Smart Movement Inference

As a **server**,
I want **to automatically infer visual actions from business events**,
So that **client apps don't need to specify animation details**.

**Acceptance Criteria:**

**Given** WORK_REQUEST event from BA-001 to Dev-001
**When** processed
**Then** server queues movements:
  1. BA-001 walks from BA zone to Dev zone
  2. BA-001 performs handoff animation
  3. BA-001 returns to BA zone
  4. Dev-001 status becomes "working"

**Given** movement is queued
**When** frontend fetches `/api/companies/{id}/state`
**Then** `pending_movements[]` includes the movement with: `agent_id`, `from`, `to`, `purpose`, `artifact`, `progress`

**Given** movement completes (progress = 1.0)
**When** state is fetched again
**Then** movement is removed from `pending_movements`
**And** agent position is updated to final position

---

### Story 3.5: Agent Idle Animation

As a **viewer**,
I want **to see agents with subtle idle animations when not busy**,
So that **the dashboard feels alive and game-like**.

**Acceptance Criteria:**

**Given** agent status is "idle"
**When** rendered in Phaser
**Then** agent sprite shows subtle breathing animation (scale pulse 1.0 → 1.02 → 1.0)
**And** animation cycle is 2000ms
**And** occasionally (5-15s random interval) plays random idle variation (stretch, coffee, yawn)

---

### Story 3.6: Agent Walking Animation

As a **viewer**,
I want **to see agents walk smoothly between zones**,
So that **I can follow the workflow visually**.

**Acceptance Criteria:**

**Given** agent has pending movement
**When** frontend processes state
**Then** agent sprite uses walk animation (4 frames, 800ms cycle)
**And** sprite position tweens from start to destination at 150px/second
**And** movement follows path through zones (not diagonal cut-through)

**Given** agent arrives at destination
**When** movement completes
**Then** walk animation stops
**And** agent faces the target agent (if handoff)

---

### Story 3.7: Agent Working/Thinking Animation

As a **viewer**,
I want **to see visual indicators when agents are thinking or working**,
So that **I understand what each agent is doing**.

**Acceptance Criteria:**

**Given** agent status is "thinking"
**When** rendered
**Then** 💭 thought bubble appears above agent
**And** bubble scales in with bounce effect (300ms)
**And** bubble floats slightly (subtle up/down tween)

**Given** agent status is "working"
**When** rendered
**Then** 📝 working indicator appears above agent
**And** agent shows typing/writing animation

**Given** agent status changes away from thinking/working
**When** state updates
**Then** bubble/indicator scales out (200ms) and disappears

---

### Story 3.8: Handoff Animation

As a **viewer**,
I want **to see artifact transfer animation when agents hand off work**,
So that **I can see the workflow progression**.

**Acceptance Criteria:**

**Given** agent arrives at target for handoff
**When** handoff animation plays
**Then** both agents pause (300ms)
**And** artifact sprite (📄) appears in sender's hands
**And** artifact tweens to receiver (500ms, arc motion)
**And** receiver shows brief acknowledgment
**And** sender then returns to their zone

---

### Story 3.9: Status Indicator Icons

As a **viewer**,
I want **to see emoji indicators for different agent states**,
So that **I can quickly understand agent activities at a glance**.

**Acceptance Criteria:**

**Given** various event types
**When** rendered
**Then** appropriate icons appear:
  - THINKING: 💭
  - WORKING: 📝
  - EXECUTING: ⚡
  - TASK_COMPLETE: ✅
  - ERROR: ❌
  - BLOCKED: 🚧
  - WAITING: ⏳
**And** icons are positioned above agent sprite
**And** icons have subtle animation (pulse or glow)

---

### Story 3.10: Custom Event Support

As a **client app**,
I want **to send CUSTOM_EVENT with custom icon and animation**,
So that **I can visualize domain-specific activities**.

**Acceptance Criteria:**

**Given** I send CUSTOM_EVENT with payload:
```json
{
  "event_name": "database_migration",
  "icon": "🗃️",
  "animation": "pulse",
  "message": "Running migration",
  "color": "#FF6B6B"
}
```
**When** processed
**Then** agent shows custom icon (🗃️) with pulse animation
**And** optional message displays near agent
**And** event is logged with custom metadata

**Given** animation type is "shake", "bounce", "glow", or "spin"
**When** rendered
**Then** icon uses the specified animation effect

---

## Epic 4: Judges Can Review and Evaluate

**Goal:** Judges có full tooling để evaluate teams - switch companies, zoom/pan, view logs với filter.

### Story 4.1: Camera Zoom Controls

As a **viewer**,
I want **to zoom in/out using mouse scroll wheel**,
So that **I can focus on specific agents or see the whole office**.

**Acceptance Criteria:**

**Given** the game viewport is active
**When** I scroll mouse wheel up
**Then** camera zooms in by 0.1x increment
**And** zoom is capped at maximum 2x
**And** zoom centers on mouse cursor position
**And** zoom transition is smooth (200ms, Quad.Out easing)

**Given** I scroll mouse wheel down
**When** processed
**Then** camera zooms out by 0.1x increment
**And** zoom is capped at minimum 0.5x

**Given** zoom level is not 1x
**When** I double-click on empty area
**Then** zoom resets to 1x with smooth transition

---

### Story 4.2: Camera Pan Controls

As a **viewer**,
I want **to pan the camera by clicking and dragging**,
So that **I can navigate around the office**.

**Acceptance Criteria:**

**Given** the game viewport is active
**When** I click and hold on empty area, then drag
**Then** camera pans following my mouse movement
**And** panning is smooth with no jitter
**And** camera bounds prevent panning outside the office area

**Given** I release the mouse button
**When** panning stops
**Then** camera position is maintained

---

### Story 4.3: Agent Click Interaction

As a **viewer**,
I want **to click on an agent to see their details**,
So that **I can understand what each agent is doing**.

**Acceptance Criteria:**

**Given** I hover over an agent
**When** mouse enters agent bounds
**Then** agent shows highlight effect (white glow, 50% opacity)

**Given** I click on an agent
**When** click is processed
**Then** agent shows selection ring (gold border)
**And** tooltip appears showing:
  - Agent ID and name
  - Role (with color indicator)
  - Current status
  - Current task (if any)
**And** tooltip has arrow pointing to agent

**Given** agent is selected
**When** I click on empty area or another agent
**Then** previous selection is cleared
**And** tooltip disappears with fade out (150ms)

---

### Story 4.4: Activity Log API

As a **judge**,
I want **to fetch activity logs via GET /api/companies/{id}/logs**,
So that **I can review the sequence of agent actions**.

**Acceptance Criteria:**

**Given** company has 50 logged events
**When** I GET `/api/companies/{id}/logs`
**Then** I receive HTTP 200 with latest 50 events (default limit)
**And** each log entry includes: `event_id`, `timestamp`, `agent_id`, `event_type`, `payload`, `rendered_as`
**And** entries are sorted by timestamp descending (newest first)
**And** response time is <200ms

**Given** I add query params `?agent_id=BA-001&event_type=WORKING&limit=20`
**When** request is processed
**Then** results are filtered by agent_id AND event_type
**And** maximum 20 results returned

**Given** I add query params `?from=2026-02-03T10:00&to=2026-02-03T11:00`
**When** request is processed
**Then** results are filtered to that time range only

---

### Story 4.5: Activity Log Panel UI

As a **judge**,
I want **to see an activity log panel at the bottom of the dashboard**,
So that **I can review recent activities while watching**.

**Acceptance Criteria:**

**Given** the dashboard is loaded
**When** I view the screen
**Then** I see a collapsible log panel at the bottom
**And** panel shows header "Activity Log" with expand/collapse button
**And** when collapsed, shows 1 row of most recent event
**And** when expanded, shows up to 10 recent events

**Given** log panel is collapsed
**When** I click expand button
**Then** panel smoothly expands (300ms)
**And** shows scrollable list of events

**Given** new event occurs
**When** log updates
**Then** new entry appears at top with subtle highlight animation

---

### Story 4.6: Log Entry Details

As a **judge**,
I want **to click a log entry to see full payload details**,
So that **I can evaluate the quality of AI agent work**.

**Acceptance Criteria:**

**Given** log panel shows event entries
**When** I click on an entry row
**Then** row expands to show full payload JSON
**And** JSON is syntax-highlighted for readability
**And** expansion is smooth (200ms)

**Given** entry is expanded
**When** I click the row again
**Then** details collapse back

**Given** payload contains large content
**When** expanded
**Then** content is scrollable within the expanded area
**And** maximum height is limited to prevent UI overflow

---

### Story 4.7: Log Filtering UI

As a **judge**,
I want **to filter logs by agent or event type**,
So that **I can focus on specific activities**.

**Acceptance Criteria:**

**Given** log panel is expanded
**When** I click "Filter" dropdown
**Then** I see checkboxes for:
  - All Events (default checked)
  - Event types (WORK_REQUEST, THINKING, WORKING, etc.)
  - Agent IDs (dynamically populated from company agents)

**Given** I uncheck "All Events" and check "WORKING" only
**When** filter is applied
**Then** log list shows only WORKING events
**And** API is called with `?event_type=WORKING`

**Given** I check multiple filters
**When** applied
**Then** results match ANY of the selected filters (OR logic)

---

## Epic 5: Simulator Client Web App

**Goal:** Developers và testers có web-based simulator để test dashboard mà không cần client app thật.

### Story 5.1: Simulator Web App Setup

As a **developer**,
I want **to run a standalone simulator web app alongside the dashboard**,
So that **I can test dashboard functionality without building the real client app**.

**Acceptance Criteria:**

**Given** the project is running with docker-compose
**When** I access `http://localhost:3001` (simulator port)
**Then** I see the Simulator Client web interface
**And** the app loads in <3 seconds
**And** the app is built with React + TypeScript + Vite

**Given** the simulator app is loaded
**When** I view the interface
**Then** I see a clean layout with sections for: Company Management, Agent Management, Event Sender, Event History
**And** the UI uses consistent styling with the dashboard (dark theme, same color palette)

---

### Story 5.2: Company Creation UI

As a **tester**,
I want **to create test companies via a simple form**,
So that **I can quickly set up test data without using curl/Postman**.

**Acceptance Criteria:**

**Given** I am on the simulator home page
**When** I click "Create Company"
**Then** I see a form with fields: Company Name (required), Description (optional)
**And** I see a "Create" button

**Given** I fill in "Test Company Alpha" and click Create
**When** the form is submitted
**Then** simulator calls POST /api/companies to the dashboard API
**And** success message shows "Company created: {company_id}"
**And** the new company appears in the "Active Companies" dropdown

**Given** the API returns an error
**When** form submission fails
**Then** error message displays with details from API response
**And** form remains filled for correction

---

### Story 5.3: Agent Management UI

As a **tester**,
I want **to create and manage agents for a selected company**,
So that **I can populate the dashboard with test agents**.

**Acceptance Criteria:**

**Given** I have selected a company from the dropdown
**When** I click "Add Agent"
**Then** I see a form with fields:
  - Agent ID (required, e.g., "BA-001")
  - Name (required, e.g., "Alice")
  - Role (dropdown with defaults: customer, ba, pm, architect, developer, qa + custom input option)

**Given** I fill in agent details and click "Add"
**When** form is submitted
**Then** simulator calls POST /api/companies/{id}/agents
**And** success message shows "Agent added: {agent_id}"
**And** agent appears in the "Company Agents" list below

**Given** I click "Remove" next to an agent in the list
**When** confirmation is accepted
**Then** simulator calls DELETE /api/companies/{id}/agents/{agent_id}
**And** agent is removed from the list

**Given** company has agents
**When** I view the Company Agents list
**Then** I see each agent with: Agent ID, Name, Role (with color badge), Status
**And** list updates when dashboard state changes

---

### Story 5.4: Event Sender UI

As a **tester**,
I want **to send events to the dashboard via a user-friendly form**,
So that **I can trigger visualizations and test all event types**.

**Acceptance Criteria:**

**Given** I have a company with agents selected
**When** I view the Event Sender section
**Then** I see:
  - Agent dropdown (populated with company's agents)
  - Event Type dropdown (all 43 event types grouped by category)
  - Payload editor (JSON textarea with syntax highlighting)
  - "Send Event" button

**Given** I select agent "BA-001" and event type "THINKING"
**When** event type is selected
**Then** payload editor auto-fills with template payload for that event type:
```json
{
  "thought": "Enter thought here..."
}
```

**Given** I select "MESSAGE_SEND" event type
**When** template loads
**Then** I see additional "To Agent" dropdown appear
**And** payload template includes: `to_agent`, `message_type`, `subject`, `content`

**Given** I click "Send Event"
**When** event is sent
**Then** simulator calls POST /api/events with the payload
**And** success indicator shows briefly (green checkmark)
**And** event appears in Event History below

**Given** I want to send events quickly
**When** I use keyboard shortcut Ctrl+Enter
**Then** event is sent (same as clicking Send button)

---

### Story 5.5: Predefined Test Scenarios

As a **demo presenter**,
I want **to run predefined event sequences**,
So that **I can demonstrate dashboard features without manual event sending**.

**Acceptance Criteria:**

**Given** I have a company selected
**When** I click "Scenarios" tab
**Then** I see a list of predefined scenarios:
  - "Quick Demo" - 5 events showing basic workflow (30 seconds)
  - "Full SDLC Cycle" - Complete BA→Dev→QA flow (2 minutes)
  - "Multi-Agent Collaboration" - 3 agents working together
  - "Stress Test" - Rapid events to test performance
  - "All Event Types" - Demonstrates each event type once

**Given** I select "Quick Demo" scenario
**When** I click "Run Scenario"
**Then** scenario info panel shows: description, estimated duration, events count
**And** "Start" and "Cancel" buttons appear

**Given** I click "Start" on a scenario
**When** scenario runs
**Then** events are sent automatically with realistic timing delays
**And** progress bar shows completion percentage
**And** current event being sent is highlighted
**And** I can click "Pause" to pause execution
**And** I can click "Stop" to cancel remaining events

**Given** scenario completes
**When** all events are sent
**Then** success message shows "Scenario complete: X events sent"
**And** all events appear in Event History

---

### Story 5.6: Event History Panel

As a **tester**,
I want **to see a history of all events I've sent**,
So that **I can track what I've tested and debug issues**.

**Acceptance Criteria:**

**Given** I have sent events from the simulator
**When** I view the Event History section
**Then** I see a table with columns: Timestamp, Agent, Event Type, Status, Actions
**And** most recent events appear at top
**And** maximum 100 events are shown (older events are removed)

**Given** an event was sent successfully
**When** displayed in history
**Then** Status shows green "✓ Sent" with event_id from API response

**Given** an event failed to send
**When** displayed in history
**Then** Status shows red "✗ Failed" with error message
**And** "Retry" button appears in Actions column

**Given** I click on an event row
**When** row expands
**Then** I see full payload JSON that was sent
**And** I see full API response received
**And** "Copy Payload" button to copy JSON to clipboard

**Given** I click "Clear History"
**When** confirmed
**Then** all events are removed from history
**And** history is empty

---

### Story 5.7: Connection Status Indicator

As a **tester**,
I want **to see the connection status to the dashboard API**,
So that **I know if my events will be received**.

**Acceptance Criteria:**

**Given** simulator app is loaded
**When** I view the header bar
**Then** I see connection status indicator showing: "Dashboard API: [status]"

**Given** dashboard API is reachable
**When** health check succeeds
**Then** indicator shows green dot with "Connected"
**And** tooltip shows: "API URL: http://localhost:8000, Version: X.X.X"

**Given** dashboard API is not reachable
**When** health check fails
**Then** indicator shows red dot with "Disconnected"
**And** tooltip shows last error message
**And** "Retry" button appears

**Given** connection status changes
**When** API becomes available/unavailable
**Then** indicator updates within 5 seconds (periodic health check)
**And** toast notification shows "Dashboard connected" or "Dashboard disconnected"

**Given** I click on the connection indicator
**When** settings panel opens
**Then** I can change API base URL (default: http://localhost:8000)
**And** I can manually trigger "Test Connection"

---

## Summary

| Epic | Title | Stories |
|------|-------|---------|
| 1 | Running Game Dashboard (Foundation) | 4 |
| 2 | Teams Can Register and Appear | 9 |
| 3 | Teams Can Demonstrate AI Activities | 10 |
| 4 | Judges Can Review and Evaluate | 7 |
| 5 | Simulator Client Web App | 7 |
| **Total** | | **37 stories** |
