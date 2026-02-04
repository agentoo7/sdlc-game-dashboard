# Story 3.10: Custom Event Support

Status: done

## Story

As a **client app**,
I want **to send CUSTOM_EVENT with custom icon and animation**,
So that **I can visualize domain-specific activities**.

## Acceptance Criteria

1. **Given** I send CUSTOM_EVENT with payload containing icon
   **When** processed
   **Then** agent shows custom icon with animation

## Implementation

Backend EventType enum includes CUSTOM_EVENT.
infer_actions() extracts event_name from payload.
Frontend can extend STATUS_ICONS for custom events.

### File List

**Modified:**
- `backend/app/schemas/event.py` - CUSTOM_EVENT in EventType
- `backend/app/api/events.py` - Handle CUSTOM_EVENT in infer_actions()
