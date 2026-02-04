# Story 2.2: List Companies API

Status: done

## Story

As a **viewer**,
I want **to fetch all registered companies via GET /api/companies**,
So that **I can see which teams are available to watch**.

## Acceptance Criteria

1. **Given** 3 companies are registered
   **When** I GET `/api/companies`
   **Then** I receive HTTP 200 with array of 3 companies
   **And** each company includes: `company_id`, `name`, `agent_count`, `last_activity`, `status`
   **And** response time is <200ms

2. **Given** no companies are registered
   **When** I GET `/api/companies`
   **Then** I receive HTTP 200 with empty array `{"companies": []}`

## Tasks / Subtasks

- [x] Task 1: Review existing implementation (AC: #1, #2)
  - [x] 1.1 Check list_companies endpoint - exists but missing `status` field

- [x] Task 2: Add status field (AC: #1)
  - [x] 2.1 Update CompanyListItem schema to include status
  - [x] 2.2 Update list_companies to compute status (active/inactive based on agent count)

- [x] Task 3: Verify implementation (AC: #1, #2)
  - [x] 3.1 Test with multiple companies (HTTP 200, includes status) ✓
  - [x] 3.2 Verify all required fields present ✓

## Dev Notes

### Status Field Logic

Status is computed as:
- "active" - company has agents (agent_count > 0)
- "inactive" - company has no agents (agent_count = 0)

### References

- [Source: epics.md#Story-2.2] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Status field added** - New field computed from agent_count
2. **All tests passed**:
   - GET /api/companies returns all companies
   - Each company includes: company_id, name, agent_count, last_activity, status

### File List

**Modified:**
- `backend/app/schemas/company.py` - Added `status` field to `CompanyListItem`
- `backend/app/api/companies.py` - Compute status in list_companies response
