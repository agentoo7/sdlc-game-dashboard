# Story 4.7: Log Filtering UI

Status: done

## Story

As a **judge**,
I want **to filter logs by agent or event type**,
So that **I can focus on specific activities**.

## Acceptance Criteria

1. **Given** log panel is expanded
   **When** I click "Filter" dropdown
   **Then** I see checkboxes for event types

2. **Given** I select filters and click Apply
   **When** filter is applied
   **Then** log list shows only matching events

## Implementation

In ActivityLog component:
- Filter button toggles filter panel
- Checkboxes for event types
- Apply/Clear buttons
- Calls API with filter params

### File List

**Modified:**
- `frontend/src/ui/ActivityLog.ts` - renderFilterPanel()
