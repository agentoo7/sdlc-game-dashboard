# Story 3.1: Event API Endpoint

Status: done

## Story

As a **client app**,
I want **to send events via POST /api/events**,
So that **my AI agent activities are recorded and visualized**.

## Acceptance Criteria

1. **Given** company and agent exist
   **When** I POST to `/api/events` with event data
   **Then** I receive HTTP 200 with `{"event_id": "uuid", "timestamp": "...", "status": "accepted"}`
   **And** event is persisted to database
   **And** processing time is <500ms

2. **Given** invalid company_id or agent_id
   **When** I POST event
   **Then** I receive HTTP 404 with error details

3. **Given** invalid event_type
   **When** I POST event
   **Then** I receive HTTP 422 with validation error

## Tasks / Subtasks

- [x] Task 1: Update event schema (AC: #1, #3)
  - [x] 1.1 Create EventType enum with valid types
  - [x] 1.2 Update EventCreate to use agent_id
  - [x] 1.3 Update EventResponse to use event_id

- [x] Task 2: Update event endpoint (AC: #1, #2)
  - [x] 2.1 Validate company exists (404)
  - [x] 2.2 Validate agent exists (404)
  - [x] 2.3 Validate to_agent if specified (404)
  - [x] 2.4 Persist event and update agent state

- [x] Task 3: Verify implementation (AC: #1, #2, #3)
  - [x] 3.1 Test valid event (HTTP 200) ✓
  - [x] 3.2 Test invalid agent (HTTP 404) ✓
  - [x] 3.3 Test invalid event_type (HTTP 422) ✓

## Dev Notes

### Valid Event Types

- Core: THINKING, WORKING, EXECUTING, IDLE, ERROR, TASK_COMPLETE
- Communication: MESSAGE_SEND, MESSAGE_RECEIVE
- Work: WORK_REQUEST, WORK_COMPLETE, REVIEW_REQUEST, FEEDBACK
- Custom: CUSTOM_EVENT

### File List

**Modified:**
- `backend/app/schemas/event.py` - EventType enum, updated schemas
- `backend/app/api/events.py` - Agent validation, improved action inference
