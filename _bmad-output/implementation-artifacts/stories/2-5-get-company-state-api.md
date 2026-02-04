# Story 2.5: Get Company State API

Status: done

## Story

As a **viewer frontend**,
I want **to fetch current state of a company via GET /api/companies/{id}/state**,
So that **I can render the office with all agents in correct positions**.

## Acceptance Criteria

1. **Given** company has 5 agents in various states
   **When** I GET `/api/companies/{id}/state`
   **Then** I receive HTTP 200 with:
     - `company_id`
     - `agents[]` with each agent's: `agent_id`, `role`, `role_config`, `name`, `status`, `position`, `current_task`
     - `pending_movements[]` (empty for now - will be used in Epic 3)
     - `last_updated` timestamp
   **And** response time is <200ms

## Tasks / Subtasks

- [x] Task 1: Update schemas (AC: #1)
  - [x] 1.1 Add role_config to AgentState
  - [x] 1.2 Add last_updated to CompanyStateResponse

- [x] Task 2: Update get_company_state endpoint (AC: #1)
  - [x] 2.1 Fetch role configs for all agent roles
  - [x] 2.2 Include role_config in each agent state
  - [x] 2.3 Populate role_configs dict
  - [x] 2.4 Add last_updated from company.updated_at

- [x] Task 3: Verify implementation (AC: #1)
  - [x] 3.1 Test endpoint returns all required fields ✓
  - [x] 3.2 Verify role_config per agent ✓
  - [x] 3.3 Verify last_updated timestamp ✓

## Dev Notes

### Response Structure

```json
{
  "company_id": "uuid",
  "agents": [
    {
      "agent_id": "BA-001",
      "role": "ba",
      "name": "Alice",
      "status": "idle",
      "position": {"zone": "ba", "x": 0, "y": 0},
      "current_task": null,
      "role_config": {
        "role_id": "ba",
        "display_name": "Business Analyst",
        "color": "#3B82F6",
        "zone_color": "rgba(59, 130, 246, 0.3)",
        "is_default": true
      }
    }
  ],
  "pending_movements": [],
  "role_configs": {"ba": {...}},
  "last_updated": "2026-02-04T03:16:48.278945"
}
```

### References

- [Source: epics.md#Story-2.5] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Schemas updated** - Added role_config to AgentState, last_updated to CompanyStateResponse
2. **Endpoint enhanced** - Fetches and includes role configs for all agents
3. **All tests passed**:
   - Each agent includes role_config
   - role_configs dict populated
   - last_updated timestamp present

### File List

**Modified:**
- `backend/app/schemas/company.py` - Added role_config to AgentState, last_updated to CompanyStateResponse
- `backend/app/api/companies.py` - Updated get_company_state to fetch role configs
