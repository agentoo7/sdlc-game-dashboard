# Story 4.4: Activity Log API

Status: done

## Story

As a **judge**,
I want **to fetch activity logs via GET /api/companies/{id}/logs**,
So that **I can review the sequence of agent actions**.

## Acceptance Criteria

1. **Given** company has logged events
   **When** I GET `/api/companies/{id}/logs`
   **Then** I receive HTTP 200 with events
   **And** entries are sorted by timestamp descending

2. **Given** I add query params `?agent_id=BA-001&event_type=WORKING&limit=20`
   **When** request is processed
   **Then** results are filtered accordingly

## Implementation

Already implemented in backend/app/api/companies.py:
- GET /{company_id}/logs endpoint
- Supports agent_id, event_type, limit, offset params
- Returns logs with pagination info

### File List

**Pre-existing:**
- `backend/app/api/companies.py` - get_company_logs()
