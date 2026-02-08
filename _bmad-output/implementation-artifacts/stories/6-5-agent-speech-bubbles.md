# Story 6.5: Agent Speech Bubbles

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **agents to show speech bubbles with icons indicating their current activity**,
So that **I can instantly see what each agent is doing (thinking, working, error, etc.)**.

## Acceptance Criteria

1. **AC1 - Icon Bubble Display:** When agent state is not IDLE, an icon bubble (24x24px) appears above the agent
2. **AC2 - State-to-Icon Mapping:** Bubble uses correct icon based on state:
   - THINKING: 💡 (Yellow background)
   - WORKING: 📝 (Blue background)
   - EXECUTING: ⚡ (Orange background)
   - TASK_COMPLETE: ✅ (Green background)
   - ERROR: ⚠️ (Red background)
   - MESSAGE_SEND/MESSAGE_RECEIVE: 💬 (Blue background)
   - FEEDBACK: 👍 (Green background)
3. **AC3 - Pop-in Animation:** When bubble appears, it scales from 0→1 with bounce effect (200ms duration)
4. **AC4 - Float Animation:** While visible, bubble has subtle up/down floating motion
5. **AC5 - Pop-out Animation:** When disappearing, bubble scales from 1→0 (150ms duration)
6. **AC6 - IDLE State Hides Bubble:** When agent becomes IDLE, bubble disappears with pop-out animation

## Tasks / Subtasks

- [x] Task 1: Create SpeechBubbleManager utility (AC: 1, 2)
  - [x] 1.1 Create `frontend/src/utils/SpeechBubbleManager.ts`
  - [x] 1.2 Define `SPEECH_BUBBLE_CONFIG` with dimensions and colors
  - [x] 1.3 Define `STATE_TO_ICON` mapping with icons and background colors
  - [x] 1.4 Implement `generateSpeechBubbleTexture()` for procedural bubble graphic

- [x] Task 2: Implement speech bubble creation (AC: 1, 2)
  - [x] 2.1 Implement `createSpeechBubble(scene, state)` function
  - [x] 2.2 Draw rounded rectangle bubble with small tail/pointer
  - [x] 2.3 Add icon text centered in bubble
  - [x] 2.4 Return container with bubble graphic and icon

- [x] Task 3: Implement pop-in animation (AC: 3)
  - [x] 3.1 Implement `showBubble(container)` with scale tween
  - [x] 3.2 Use Phaser `Back.easeOut` for bounce effect
  - [x] 3.3 Duration: 200ms, scale 0→1

- [x] Task 4: Implement float animation (AC: 4)
  - [x] 4.1 Implement `addFloatAnimation(container)`
  - [x] 4.2 Use subtle y-offset tween (±3px)
  - [x] 4.3 Use `Sine.easeInOut` with yoyo repeat
  - [x] 4.4 Duration: 1000ms per cycle

- [x] Task 5: Implement pop-out animation (AC: 5)
  - [x] 5.1 Implement `hideBubble(container, callback)`
  - [x] 5.2 Scale 1→0 with 150ms duration
  - [x] 5.3 Use `Quad.easeIn` for smooth exit
  - [x] 5.4 Destroy container after animation completes

- [x] Task 6: Integrate with MainScene (AC: 1, 6)
  - [x] 6.1 Add `speechBubbles: Map<string, Phaser.GameObjects.Container>` to MainScene
  - [x] 6.2 Update `updateStatusIndicator()` to use SpeechBubbleManager
  - [x] 6.3 Replace current STATUS_ICONS text with speech bubbles
  - [x] 6.4 Handle IDLE state: call `hideBubble()` when status === 'idle'

- [x] Task 7: Handle bubble position tracking (AC: 1)
  - [x] 7.1 Position bubble above agent sprite (y offset: -80px from container)
  - [x] 7.2 Update bubble position when agent moves
  - [x] 7.3 Update `processMovement()` to move bubble with agent
  - [x] 7.4 Update `update()` loop to sync bubble positions

- [x] Task 8: Clean up existing status indicator code (AC: all)
  - [x] 8.1 Remove old `statusIndicators` Map usage
  - [x] 8.2 Clean up speech bubbles in `clearAgents()`
  - [x] 8.3 Clean up speech bubbles in `shutdown()`
  - [x] 8.4 Update agent removal to destroy associated bubble

- [x] Task 9: Write tests (AC: all)
  - [x] 9.1 Create `frontend/src/utils/SpeechBubbleManager.test.ts`
  - [x] 9.2 Test STATE_TO_ICON mapping covers all states
  - [x] 9.3 Test speech bubble creation returns valid container
  - [x] 9.4 Test pop-in animation configuration
  - [x] 9.5 Test pop-out animation configuration
  - [x] 9.6 Test IDLE state hides bubble

## Dev Notes

### Architecture Compliance

**Current Status Indicator Implementation (to be replaced):**
```typescript
// Current: Simple emoji text indicator (MainScene.ts:677-711)
private updateStatusIndicator(agentId: string, container: Phaser.GameObjects.Container, status: string): void {
  const existing = this.statusIndicators.get(agentId);
  if (existing) {
    existing.destroy();
    this.statusIndicators.delete(agentId);
  }

  const icon = STATUS_ICONS[status] || '';
  if (!icon) return;

  // Create status indicator (adjusted for taller sprites)
  const indicator = this.add.text(container.x, container.y - 70, icon, {
    fontSize: '24px',
  }).setOrigin(0.5);
  // ... animation code
}
```

**Target Implementation:**
```typescript
// Target: Speech bubble with icon inside rounded rectangle
export const STATE_TO_ICON: Record<string, { icon: string; bgColor: number }> = {
  thinking: { icon: '💡', bgColor: 0xFEF3C7 },  // Yellow-100
  working: { icon: '📝', bgColor: 0xDBEAFE },   // Blue-100
  executing: { icon: '⚡', bgColor: 0xFFEDD5 }, // Orange-100
  task_complete: { icon: '✅', bgColor: 0xDCFCE7 }, // Green-100
  error: { icon: '⚠️', bgColor: 0xFEE2E2 },    // Red-100
  message_send: { icon: '💬', bgColor: 0xDBEAFE },
  message_receive: { icon: '💬', bgColor: 0xDBEAFE },
  feedback: { icon: '👍', bgColor: 0xDCFCE7 },
  idle: null, // No bubble for idle
};
```

### Key Technical Decisions

1. **Procedural Bubble Generation:** Continue pattern from Story 6.3/6.4 - generate speech bubble texture using Phaser Graphics API
   - Rounded rectangle with small triangular tail pointing down
   - Background color based on state
   - Icon rendered as text on top

2. **Speech Bubble Structure:**
   ```typescript
   // Container structure
   Container (speechBubble)
     ├── Graphics (bubble shape: rounded rect + tail)
     └── Text (icon emoji)

   // Dimensions
   const SPEECH_BUBBLE_CONFIG = {
     width: 32,
     height: 28,
     borderRadius: 6,
     tailWidth: 8,
     tailHeight: 6,
     offsetY: -80,  // Above agent sprite
   };
   ```

3. **Animation Specifications:**
   ```typescript
   // Pop-in (AC3)
   showBubble: {
     duration: 200,
     ease: 'Back.easeOut',
     from: { scaleX: 0, scaleY: 0 },
     to: { scaleX: 1, scaleY: 1 },
   }

   // Float (AC4)
   floatAnimation: {
     duration: 1000,
     ease: 'Sine.easeInOut',
     yoyo: true,
     repeat: -1,
     y: '-=3', // Subtle 3px movement
   }

   // Pop-out (AC5)
   hideBubble: {
     duration: 150,
     ease: 'Quad.easeIn',
     to: { scaleX: 0, scaleY: 0 },
     onComplete: () => container.destroy(),
   }
   ```

4. **State Mapping Updates:** Need to map both `AgentStatus` enum values and event types to icons:
   ```typescript
   // AgentStatus from types/index.ts
   type AgentStatus = 'idle' | 'thinking' | 'working' | 'walking' | 'executing' | 'error';

   // Additional states from events that need icons
   const ADDITIONAL_STATES = ['task_complete', 'message_send', 'message_receive', 'feedback'];
   ```

### Color Palette for Bubble Backgrounds

| State | Icon | Background | Hex |
|-------|------|------------|-----|
| THINKING | 💡 | Yellow-100 | #FEF3C7 |
| WORKING | 📝 | Blue-100 | #DBEAFE |
| EXECUTING | ⚡ | Orange-100 | #FFEDD5 |
| TASK_COMPLETE | ✅ | Green-100 | #DCFCE7 |
| ERROR | ⚠️ | Red-100 | #FEE2E2 |
| MESSAGE_SEND | 💬 | Blue-100 | #DBEAFE |
| MESSAGE_RECEIVE | 💬 | Blue-100 | #DBEAFE |
| FEEDBACK | 👍 | Green-100 | #DCFCE7 |
| IDLE | - | No bubble | - |

### Previous Story Learnings

From Story 6.4 (ChatDev-Style Office Layout):
- Procedural texture generation with Phaser Graphics works well
- Use `graphics.generateTexture(key, width, height)` to create reusable textures
- Clean up graphics objects with `graphics.destroy()` after texture generation
- Export constants for easy testing
- Keep tests at unit level with mocked Phaser objects
- Track all created objects for cleanup in `shutdown()`

From Story 6.3 (Pixel Art Character Sprites):
- Container-based approach allows grouping sprite + label + indicator
- `setOrigin(0.5)` for centered positioning
- Tween animations with `Back.easeOut` create nice bounce effects
- Clean up animations when objects are destroyed

From Story 3.9 (Status Indicator Icons):
- Current implementation uses simple text-based emojis
- Floating animation with `Sine.easeInOut` yoyo looks good
- Scale-in with `Back.easeOut` provides feedback

### Integration Points

1. **MainScene.ts:**
   - Replace `statusIndicators: Map<string, Phaser.GameObjects.Text>` with `speechBubbles: Map<string, Phaser.GameObjects.Container>`
   - Update `updateStatusIndicator()` to use SpeechBubbleManager
   - Update `processMovement()` to move bubbles with agents
   - Update `update()` for position sync
   - Update `clearAgents()` and `shutdown()` for cleanup

2. **SpeechBubbleManager.ts (new):**
   - STATE_TO_ICON mapping
   - SPEECH_BUBBLE_CONFIG constants
   - createSpeechBubble()
   - showBubble() / hideBubble()
   - addFloatAnimation()

3. **constants.ts:**
   - Remove old STATUS_ICONS (or keep for backwards compatibility)
   - Add SPEECH_BUBBLE_STATES if needed

### File Structure

- `frontend/src/utils/SpeechBubbleManager.ts` - NEW (bubble creation and animation)
- `frontend/src/utils/SpeechBubbleManager.test.ts` - NEW (tests)
- `frontend/src/scenes/MainScene.ts` - MODIFIED (integrate speech bubbles)
- `frontend/src/utils/constants.ts` - POSSIBLY MODIFIED (state mappings)

### Diagram: Speech Bubble Visual

```
     ┌─────────┐
     │   💡    │  ← Icon centered
     │         │  ← Rounded corners (6px radius)
     └────┬────┘
          │       ← Small triangular tail
          ▼
     ┌─────────┐
     │  Agent  │
     │  Sprite │
     └─────────┘
```

### Testing Approach

Unit tests should mock Phaser objects:
```typescript
// Mock Phaser Scene
const mockScene = {
  add: {
    graphics: vi.fn(() => mockGraphics),
    text: vi.fn(() => mockText),
    container: vi.fn(() => mockContainer),
  },
  tweens: {
    add: vi.fn(),
  },
};

// Test STATE_TO_ICON mapping
describe('STATE_TO_ICON', () => {
  it('should have icon for THINKING state', () => {
    expect(STATE_TO_ICON.thinking).toEqual({ icon: '💡', bgColor: 0xFEF3C7 });
  });

  it('should not have bubble for IDLE state', () => {
    expect(STATE_TO_ICON.idle).toBeNull();
  });
});
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.5]
- [Source: _bmad-output/planning-artifacts/ui-ux-design-2026-02-03.md#Speech Bubbles]
- [Source: frontend/src/scenes/MainScene.ts - updateStatusIndicator() (lines 677-711)]
- [Source: frontend/src/utils/constants.ts - STATUS_ICONS]
- [Source: frontend/src/utils/OfficeRenderer.ts - Procedural generation pattern]
- [Source: ChatDev visual references]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Vitest: 185 tests pass (44 in SpeechBubbleManager.test.ts)
- Build: TypeScript compilation successful for all files

### Completion Notes List

- Created `SpeechBubbleManager.ts` with procedural speech bubble generation:
  - `SPEECH_BUBBLE_CONFIG` - bubble dimensions (24x24px per AC1), border radius (5px), tail size (6x5px), offset (-80px)
  - `STATE_TO_ICON` - 8 states with icons and background colors, null for idle/walking
  - `ANIMATION_CONFIG` - pop-in (200ms, Back.easeOut), float (1000ms, Sine.easeInOut, ±3px), pop-out (150ms, Quad.easeIn)
  - `generateSpeechBubbleTexture()` - creates rounded rect with triangular tail using Phaser Graphics
  - `preGenerateSpeechBubbleTextures()` - generates all textures at boot (no console.log in production)
  - `createSpeechBubble()` - creates container with bubble image and icon text
  - `showBubble()` - pop-in animation with bounce, starts float animation on complete
  - `addFloatAnimation()` - subtle yoyo y-offset animation
  - `hideBubble()` - pop-out animation, destroys container on complete
  - `updateBubblePosition()` - syncs bubble position with agent
  - `shouldShowBubble()` / `getStateIcon()` - utility functions
- Updated `BootScene.ts` to pre-generate speech bubble textures
- Refactored `MainScene.ts` to use speech bubbles:
  - Replaced `statusIndicators: Map<string, Text>` with `speechBubbles: Map<string, Container>`
  - Rewrote `updateStatusIndicator()` to use SpeechBubbleManager functions
  - Updated `processMovement()` to move bubbles with agents (kills float animation during movement, restarts after)
  - Updated `update()` loop to sync bubble X positions (avoids Y conflict with float animation)
  - Updated `clearAgents()` to clean up speech bubbles
  - Updated agent removal to destroy associated bubbles
  - Removed unused `STATUS_ICONS` import
- Created comprehensive test suite (44 tests):
  - Tests for all constants (SPEECH_BUBBLE_CONFIG, STATE_TO_ICON, ANIMATION_CONFIG)
  - Tests for texture generation
  - Tests for bubble creation (valid states, idle state, walking state)
  - Tests for all animation functions (showBubble, addFloatAnimation, hideBubble)
  - Tests for utility functions (updateBubblePosition, shouldShowBubble, getStateIcon)
- All 6 acceptance criteria satisfied (AC1-AC6)

### Code Review Record

| Issue # | Severity | Description | Fix Applied |
|---------|----------|-------------|-------------|
| 1 | HIGH | AC1 specifies 24x24px but code used 32x28px | Changed SPEECH_BUBBLE_CONFIG dimensions to 24x24px, borderRadius to 5, tail to 6x5 |
| 2 | MEDIUM | Speech bubble cleanup in shutdown() | Already handled via clearAgents() which is called from shutdown() |
| 3 | MEDIUM | console.log statements in production code | Removed console.log from preGenerateSpeechBubbleTextures() |
| 4 | MEDIUM | Float animation drift when agent moves | Kill float tweens before movement, restart after completion |
| 5 | LOW | Magic number -14 for icon position | Extracted to SPEECH_BUBBLE_CONFIG.iconOffsetY |
| 6 | LOW | update() position sync conflict with float animation | Changed to only update X position (Y handled by movement/float tweens) |

### File List

- `frontend/src/utils/SpeechBubbleManager.ts` - NEW (speech bubble creation and animation)
- `frontend/src/utils/SpeechBubbleManager.test.ts` - NEW (44 tests)
- `frontend/src/scenes/BootScene.ts` - MODIFIED (pre-generate speech bubble textures)
- `frontend/src/scenes/MainScene.ts` - MODIFIED (integrate speech bubbles, remove old status indicators)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-05 | Story created with comprehensive dev context | Claude Opus 4.5 |
| 2026-02-05 | Implemented Story 6.5 - Agent speech bubbles with all animations and tests | Claude Opus 4.5 |
| 2026-02-05 | Code review fixes: AC1 dimensions, console.log removal, float animation drift | Claude Opus 4.5 |
