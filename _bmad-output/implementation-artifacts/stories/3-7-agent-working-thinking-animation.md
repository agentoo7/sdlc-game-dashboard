# Story 3.7: Agent Working/Thinking Animation

Status: done

## Story

As a **viewer**,
I want **to see visual indicators when agents are thinking or working**,
So that **I understand what each agent is doing**.

## Acceptance Criteria

1. **Given** agent status is "thinking"
   **When** rendered
   **Then** 💭 thought bubble appears above agent
   **And** bubble scales in with bounce effect (300ms)
   **And** bubble floats slightly

2. **Given** agent status is "working"
   **When** rendered
   **Then** 📝 working indicator appears above agent

## Implementation

Added `updateStatusIndicator()` method that:
- Creates emoji text above agent
- Scale-in animation with Back.easeOut
- Floating animation (y-axis oscillation)

STATUS_ICONS map:
- thinking: 💭
- working: 📝
- executing: ⚡
- error: ❌
- walking: 🚶

### File List

**Modified:**
- `frontend/src/scenes/MainScene.ts` - updateStatusIndicator(), STATUS_ICONS
