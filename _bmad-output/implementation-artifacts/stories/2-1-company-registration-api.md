# Story 2.1: Company Registration API

Status: done

## Story

As a **client app**,
I want **to register my team via POST /api/companies**,
So that **my team appears on the dashboard for viewers to watch**.

## Acceptance Criteria

1. **Given** the backend is running
   **When** I POST to `/api/companies` with `{"name": "Team Alpha", "description": "AI team"}`
   **Then** I receive HTTP 201 with `{"company_id": "uuid", "name": "Team Alpha", "created_at": "..."}`
   **And** the company is persisted in the database
   **And** response time is <200ms

2. **Given** I POST with missing required field `name`
   **When** the request is processed
   **Then** I receive HTTP 422 with validation error details

## Tasks / Subtasks

- [x] Task 1: Review existing implementation (AC: #1, #2)
  - [x] 1.1 Check CompanyCreate schema
  - [x] 1.2 Check create_company endpoint

- [x] Task 2: Fix CompanyCreate schema (AC: #1)
  - [x] 2.1 Make `agents` field optional (default to empty list)

- [x] Task 3: Fix create_company endpoint (AC: #1)
  - [x] 3.1 Add status_code=201 to response
  - [x] 3.2 Handle empty agents list case

- [x] Task 4: Verify implementation (AC: #1, #2)
  - [x] 4.1 Test POST with name + description (HTTP 201) ✓
  - [x] 4.2 Test POST with missing name (HTTP 422) ✓
  - [x] 4.3 Verify company persisted in database ✓

## Dev Notes

### Technical Implementation

- `CompanyCreate.agents` now defaults to `[]` (optional field)
- Endpoint returns `status_code=201` for successful creation
- FastAPI Pydantic validation handles missing `name` field (HTTP 422)

### References

- [Source: architecture-2026-02-03.md#5.2-API-Endpoints] - REST API specification
- [Source: epics.md#Story-2.1] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **Existing implementation modified** - API was mostly complete, needed minor adjustments
2. **Schema updated** - `agents` field now optional with default `[]`
3. **HTTP 201 added** - Create endpoint now returns proper 201 status code
4. **All tests passed**:
   - POST with valid data returns HTTP 201
   - POST without name returns HTTP 422
   - Company persisted and visible in GET /api/companies

### File List

**Modified:**
- `backend/app/schemas/company.py` - Made `agents` field optional
- `backend/app/api/companies.py` - Added `status_code=201` to POST endpoint
