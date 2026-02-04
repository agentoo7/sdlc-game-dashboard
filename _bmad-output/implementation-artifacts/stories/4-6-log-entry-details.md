# Story 4.6: Log Entry Details

Status: done

## Story

As a **judge**,
I want **to click a log entry to see full payload details**,
So that **I can evaluate the quality of AI agent work**.

## Acceptance Criteria

1. **Given** log panel shows event entries
   **When** I click on an entry row
   **Then** row expands to show full payload JSON
   **And** JSON is syntax-highlighted

2. **Given** entry is expanded
   **When** I click the row again
   **Then** details collapse back

## Implementation

In ActivityLog component:
- Click log entry toggles expansion
- Shows JSON payload with syntax highlighting
- Shows inferred_actions list

### File List

**Modified:**
- `frontend/src/ui/ActivityLog.ts` - renderLogDetails()
