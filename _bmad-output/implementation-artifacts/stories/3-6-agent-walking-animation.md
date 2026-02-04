# Story 3.6: Agent Walking Animation

Status: done

## Story

As a **viewer**,
I want **to see agents walk smoothly between zones**,
So that **I can follow the workflow visually**.

## Acceptance Criteria

1. **Given** agent has pending movement
   **When** frontend processes state
   **Then** sprite position tweens from start to destination
   **And** movement follows path (1500ms duration)

## Implementation

Added `processMovement()` method that:
- Gets target zone position from ZONE_POSITIONS
- Creates tween to move agent container
- Updates status indicator position
- Triggers handoff animation on completion

### File List

**Modified:**
- `frontend/src/scenes/MainScene.ts` - processMovement()
