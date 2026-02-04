# Story 4.3: Agent Click Interaction

Status: done

## Story

As a **viewer**,
I want **to click on an agent to see their details**,
So that **I can understand what each agent is doing**.

## Acceptance Criteria

1. **Given** I click on an agent
   **When** click is processed
   **Then** agent shows selection ring (gold border)

## Implementation

Already implemented in MainScene:
- Agents are interactive
- Click highlights with amber/gold border
- Console logs agent ID

### File List

**Pre-existing:**
- `frontend/src/scenes/MainScene.ts` - highlightAgent()
