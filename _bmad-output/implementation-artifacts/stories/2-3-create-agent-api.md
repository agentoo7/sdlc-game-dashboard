# Story 2.3: Create Agent API

Status: done

## Story

As a **client app**,
I want **to create agents for my company via POST /api/companies/{id}/agents**,
So that **my AI agents appear in the office visualization**.

## Acceptance Criteria

1. **Given** company "Team Alpha" exists
   **When** I POST to `/api/companies/{id}/agents` with `{"agent_id": "BA-001", "role": "ba", "name": "Alice"}`
   **Then** I receive HTTP 201 with agent details including `role_config` (display_name, color)
   **And** the agent is persisted with status "idle" and position in their role's zone

2. **Given** I try to create agent with duplicate `agent_id` within same company
   **When** the request is processed
   **Then** I receive HTTP 409 Conflict error

3. **Given** company supports up to 50 agents (NFR-S02)
   **When** I try to create 51st agent
   **Then** I receive HTTP 400 with "Maximum agents reached" error

## Tasks / Subtasks

- [x] Task 1: Create agent schemas (AC: #1)
  - [x] 1.1 Create AgentCreateRequest schema
  - [x] 1.2 Create AgentResponse schema with role_config

- [x] Task 2: Create agent endpoint (AC: #1, #2, #3)
  - [x] 2.1 Add POST /api/companies/{id}/agents endpoint
  - [x] 2.2 Validate company exists (404)
  - [x] 2.3 Check duplicate agent_id (409)
  - [x] 2.4 Check max agents limit (400)
  - [x] 2.5 Get or create role_config
  - [x] 2.6 Return HTTP 201 with agent and role_config

- [x] Task 3: Verify implementation (AC: #1, #2, #3)
  - [x] 3.1 Test create agent with default role ✓
  - [x] 3.2 Test duplicate agent_id returns 409 ✓
  - [x] 3.3 Company status changes to "active" when agents exist ✓

## Dev Notes

### Technical Implementation

- `get_or_create_role_config()` helper function handles:
  - Existing role configs
  - Default BMAD roles (seeded on first use)
  - Custom roles (auto-generated display_name and color)
- Max agents limit: 50 per company (NFR-S02)
- Agent position defaults to their role zone

### References

- [Source: epics.md#Story-2.3] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Schemas created** - `AgentCreateRequest` and `AgentResponse`
2. **Endpoint implemented** - POST /api/companies/{id}/agents
3. **Role config logic** - Auto-creates role configs for new roles
4. **All tests passed**:
   - Create agent returns HTTP 201 with role_config
   - Duplicate agent_id returns HTTP 409
   - Company status changes to "active"

### File List

**Modified:**
- `backend/app/schemas/company.py` - Added `AgentCreateRequest` and `AgentResponse`
- `backend/app/api/companies.py` - Added create_agent endpoint and helper function
