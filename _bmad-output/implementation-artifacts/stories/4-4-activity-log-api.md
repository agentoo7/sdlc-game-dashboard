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

### Code Review Fixes (2026-02-04)

**Issues Fixed (Epic 4 overall):**
1. [HIGH] Added comprehensive Logs API tests: `backend/tests/test_logs.py` (14 tests)
2. [MEDIUM] Fixed zoom increment to be fixed 0.1x as per AC (was variable)
3. [MEDIUM] Added all 13 event types to filter panel (was only 6)
4. [MEDIUM] Added summaries for all event types in ActivityLog

**Files Modified:**
- `frontend/src/scenes/MainScene.ts` - Fixed zoom to use 0.1x increments
- `frontend/src/ui/ActivityLog.ts` - Added all event types to filter, improved summaries

**Files Created:**
- `backend/tests/test_logs.py` - 14 tests for logs API (sorting, filtering, pagination)
