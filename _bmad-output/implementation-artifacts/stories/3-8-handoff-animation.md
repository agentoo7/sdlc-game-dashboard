# Story 3.8: Handoff Animation

Status: done

## Story

As a **viewer**,
I want **to see artifact transfer animation when agents hand off work**,
So that **I can see the workflow progression**.

## Acceptance Criteria

1. **Given** agent arrives at target for handoff
   **When** handoff animation plays
   **Then** artifact sprite (📄) appears
   **And** artifact tweens with arc motion (500ms)

## Implementation

Added `showHandoffAnimation()` method that:
- Creates 📄 icon at agent position
- Arc motion: up-right then down-right
- Destroys icon after animation

### File List

**Modified:**
- `frontend/src/scenes/MainScene.ts` - showHandoffAnimation()
