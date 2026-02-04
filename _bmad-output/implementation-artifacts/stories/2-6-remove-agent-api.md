# Story 2.6: Remove Agent API

Status: done

## Story

As a **client app**,
I want **to remove an agent via DELETE /api/companies/{id}/agents/{agent_id}**,
So that **agents that are no longer active disappear from the dashboard**.

## Acceptance Criteria

1. **Given** agent "BA-001" exists in company
   **When** I DELETE `/api/companies/{id}/agents/BA-001`
   **Then** I receive HTTP 200 with `{"agent_id": "BA-001", "status": "removed"}`
   **And** agent is removed from database
   **And** subsequent GET /state no longer includes this agent

2. **Given** agent_id doesn't exist
   **When** I send DELETE request
   **Then** I receive HTTP 404 Not Found

## Tasks / Subtasks

- [x] Task 1: Create delete endpoint (AC: #1, #2)
  - [x] 1.1 Add DELETE /api/companies/{id}/agents/{agent_id} endpoint
  - [x] 1.2 Validate company exists (404)
  - [x] 1.3 Validate agent exists (404)
  - [x] 1.4 Delete agent from database
  - [x] 1.5 Return {"agent_id": "...", "status": "removed"}

- [x] Task 2: Verify implementation (AC: #1, #2)
  - [x] 2.1 Test delete existing agent (HTTP 200) ✓
  - [x] 2.2 Test delete non-existent agent (HTTP 404) ✓
  - [x] 2.3 Verify agent removed from GET /state ✓

## Dev Notes

### References

- [Source: epics.md#Story-2.6] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Endpoint implemented** - DELETE /api/companies/{id}/agents/{agent_id}
2. **All tests passed**:
   - Delete existing agent returns HTTP 200
   - Delete non-existent agent returns HTTP 404
   - Agent removed from state response

### File List

**Modified:**
- `backend/app/api/companies.py` - Added delete_agent endpoint
