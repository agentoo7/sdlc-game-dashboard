# Story 3.5: Agent Idle Animation

Status: done

## Story

As a **viewer**,
I want **to see agents with subtle idle animations when not busy**,
So that **the dashboard feels alive and game-like**.

## Acceptance Criteria

1. **Given** agent status is "idle"
   **When** rendered in Phaser
   **Then** agent sprite shows subtle breathing animation (scale pulse 1.0 → 1.02 → 1.0)
   **And** animation cycle is ~2000ms

## Implementation

Added `addIdleAnimation()` method to MainScene that creates a scale tween:
- Scale: 1.0 → 1.02 → 1.0
- Duration: 1000ms each direction (2000ms total cycle)
- Easing: Sine.easeInOut
- Repeats infinitely

### File List

**Modified:**
- `frontend/src/scenes/MainScene.ts` - addIdleAnimation()
