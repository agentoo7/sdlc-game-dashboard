# Story 4.2: Camera Pan Controls

Status: done

## Story

As a **viewer**,
I want **to pan the camera by clicking and dragging**,
So that **I can navigate around the office**.

## Acceptance Criteria

1. **Given** the game viewport is active
   **When** I click and hold, then drag
   **Then** camera pans following my mouse movement
   **And** panning is smooth with no jitter

## Implementation

Already implemented in MainScene.setupCameraControls():
- Left-click drag pans camera
- Camera bounds set to prevent panning outside office

### File List

**Pre-existing:**
- `frontend/src/scenes/MainScene.ts` - setupCameraControls()
