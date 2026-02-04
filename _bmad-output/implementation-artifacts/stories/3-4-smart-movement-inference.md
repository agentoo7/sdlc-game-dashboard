# Story 3.4: Smart Movement Inference

Status: done

## Story

As a **server**,
I want **to automatically infer visual actions from business events**,
So that **client apps don't need to specify animation details**.

## Acceptance Criteria

1. **Given** WORK_REQUEST event from BA-001 to Dev-001
   **When** processed
   **Then** server queues movements:
     - BA-001 walks from BA zone to Dev zone
     - BA-001 performs handoff animation
     - BA-001 returns to BA zone
     - Dev-001 status becomes "working"

2. **Given** movement is queued
   **When** frontend fetches `/api/companies/{id}/state`
   **Then** `pending_movements[]` includes the movement with: `agent_id`, `from`, `to`, `purpose`, `artifact`, `progress`

## Tasks / Subtasks

- [x] Task 1: Include movements in company state
  - [x] 1.1 Query pending movements (progress < 1.0)
  - [x] 1.2 Return in CompanyStateResponse

- [x] Task 2: Create migration for movements table
  - [x] 2.1 Add movements table with all fields

## Dev Notes

### Movement Response Format

```json
{
  "pending_movements": [
    {
      "agent_id": "SE-001",
      "from_zone": "security_engineer",
      "to_zone": "security_engineer",
      "purpose": "handoff",
      "artifact": "audit-report.pdf",
      "progress": 0.0
    }
  ]
}
```

### File List

**Created:**
- `backend/alembic/versions/20260204_000001_002_add_movements_table.py`

**Modified:**
- `backend/app/api/companies.py` - Query and return pending movements
- `backend/app/schemas/company.py` - Add progress to PendingMovement
