# Story 4.1: Camera Zoom Controls

Status: done

## Story

As a **viewer**,
I want **to zoom in/out using mouse scroll wheel**,
So that **I can focus on specific agents or see the whole office**.

## Acceptance Criteria

1. **Given** the game viewport is active
   **When** I scroll mouse wheel up
   **Then** camera zooms in by 0.1x increment
   **And** zoom is capped at maximum 2x

2. **Given** I scroll mouse wheel down
   **When** processed
   **Then** camera zooms out by 0.1x increment
   **And** zoom is capped at minimum 0.5x

## Implementation

Already implemented in MainScene.setupCameraControls():
- Scroll wheel changes zoom
- Capped between 0.5x and 2x
- Uses Phaser.Math.Clamp

### File List

**Pre-existing:**
- `frontend/src/scenes/MainScene.ts` - setupCameraControls()
