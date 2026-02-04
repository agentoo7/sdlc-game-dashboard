---
document_type: Implementation Stories
version: 1.0
date: 2026-02-04
epic: UX v2.0 Dashboard Redesign
source: ui-ux-design-2026-02-03.md (v2.0)
total_stories: 5
estimated_effort: Medium-Large
---

# UX v2.0 Implementation Stories

## Epic: Dashboard UX Redesign (ChatDev-Inspired)

**Goal:** Redesign the SDLC Game Dashboard with ChatDev-inspired pixel art style, sidebar Activity Log, and improved camera controls.

**Prerequisites:**
- Existing Phaser.js game implementation
- Activity Log component (currently at bottom)
- Basic camera controls

---

## Story UX-2.1: Activity Log Sidebar Implementation

### Description
As a **user**,
I want **the Activity Log to be in a collapsible right sidebar instead of at the bottom**,
So that **I have more vertical space for the game view and can easily toggle the log visibility**.

### Acceptance Criteria

- [ ] Activity Log panel moved to right side of screen
- [ ] Sidebar width: 320px when expanded, 40px when collapsed
- [ ] Collapse/Expand button (◀/▶) toggles sidebar
- [ ] Badge shows unread event count when collapsed
- [ ] Smooth animation (200ms ease-out) for collapse/expand
- [ ] State persisted in localStorage
- [ ] Game viewport resizes when sidebar toggles
- [ ] Filter dropdown works in sidebar layout
- [ ] Log entries have colored left border by role

### Technical Notes

```typescript
// Sidebar state management
interface SidebarState {
  isCollapsed: boolean;
  unreadCount: number;
}

// CSS classes needed
.activity-sidebar { width: 320px; transition: width 0.2s ease-out; }
.activity-sidebar.collapsed { width: 40px; }
.game-viewport { flex: 1; } // Takes remaining space
```

### Files to Modify
- `frontend/src/ui/ActivityLog.ts` - Convert to sidebar layout
- `frontend/src/scenes/MainScene.ts` - Adjust viewport sizing
- `frontend/src/styles/` - Add sidebar CSS (if using external styles)

### Estimated Effort: 4-6 hours

---

## Story UX-2.2: Camera Controls Toolbar

### Description
As a **user**,
I want **a camera control toolbar with Zoom In, Zoom Out, Pan, Center, and Reset buttons**,
So that **I can easily navigate the office view without relying only on mouse gestures**.

### Acceptance Criteria

- [ ] Toolbar positioned at bottom-left of game viewport
- [ ] Semi-transparent dark background (#1E293B, 80% opacity)
- [ ] 5 buttons: Zoom In (🔍+), Zoom Out (🔍-), Pan (↔️), Center (⌖), Reset (🔄)
- [ ] Button states: default, hover, active, disabled
- [ ] Pan mode is a toggle button (blue when active)
- [ ] Zoom limits: 0.5x to 2.0x
- [ ] Center button centers view on office center
- [ ] Reset button: zoom to 1.0x AND center view

### Keyboard Shortcuts
- [ ] `+` or `=` → Zoom In
- [ ] `-` or `_` → Zoom Out
- [ ] `P` → Toggle Pan Mode
- [ ] `C` or `Home` → Center View
- [ ] `R` or `0` → Reset View

### Technical Notes

```typescript
// Camera control config
const CAMERA_CONFIG = {
  minZoom: 0.5,
  maxZoom: 2.0,
  zoomStep: 0.2,
  defaultZoom: 1.0,
  panSpeed: 10,
};

// Button component
interface CameraButton {
  icon: string;
  action: () => void;
  isToggle?: boolean;
  shortcut: string;
}
```

### Files to Modify
- `frontend/src/ui/CameraControls.ts` - NEW file for toolbar
- `frontend/src/scenes/MainScene.ts` - Integrate controls
- `frontend/src/utils/constants.ts` - Add camera config

### Estimated Effort: 3-4 hours

---

## Story UX-2.3: Pixel Art Character Sprites

### Description
As a **user**,
I want **the agents to be cute pixel art chibi characters with colorful anime hair**,
So that **the dashboard feels more like a game (ChatDev style) and agents are easily distinguishable**.

### Acceptance Criteria

- [ ] Character sprites are pixel art style (32x48 base, displayed at 64x96)
- [ ] Each agent has unique hair color (blue, purple, green, red, pink, brown)
- [ ] Character outfit color matches their role color
- [ ] Big expressive anime-style eyes
- [ ] Characters sit at desks with computers
- [ ] Walk animation: 4-frame cycle
- [ ] Idle animation: subtle breathing

### Hair Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Blue | #60A5FA | Agent 1, 7, 13... |
| Purple | #A78BFA | Agent 2, 8, 14... |
| Green | #4ADE80 | Agent 3, 9, 15... |
| Red | #F87171 | Agent 4, 10, 16... |
| Pink | #F472B6 | Agent 5, 11, 17... |
| Brown | #A1887F | Agent 6, 12, 18... |

### Technical Notes

```typescript
// Sprite sheet structure
interface AgentSpriteSheet {
  idle: number[]; // frames 0-3
  walk: number[]; // frames 4-7
  work: number[]; // frames 8-11
  think: number[]; // frames 12-15
}

// Hair color assignment
function getHairColor(agentIndex: number): string {
  const colors = ['#60A5FA', '#A78BFA', '#4ADE80', '#F87171', '#F472B6', '#A1887F'];
  return colors[agentIndex % colors.length];
}
```

### Assets Required
- `agent-spritesheet.png` - Pixel art character sprites (or generate programmatically)
- Consider using placeholder colored circles initially, upgrade to pixel art later

### Files to Modify
- `frontend/src/sprites/AgentSprite.ts` - Update sprite rendering
- `frontend/src/utils/constants.ts` - Add hair colors
- `frontend/assets/` - Add new sprite assets

### Estimated Effort: 6-8 hours (includes asset creation)

---

## Story UX-2.4: ChatDev-Style Office Layout

### Description
As a **user**,
I want **the office to look like ChatDev with wooden floors, department signs, desks, and decorations**,
So that **the dashboard feels warm, cozy, and game-like**.

### Acceptance Criteria

- [ ] Wooden floor texture (horizontal planks, warm brown #8B7355)
- [ ] Department zones with wooden pole signs: Designing, Coding, Testing, Documenting
- [ ] Central area with company name carpet/rug
- [ ] Pixel art desks with computers in each zone
- [ ] Decorative plants (🪴) in corners and between zones
- [ ] Optional: Bookshelves, whiteboard, coffee area
- [ ] Zones arranged in grid layout (2x2 or flexible)

### Zone Layout
```
┌─────────────┬─────────────┐
│  Designing  │ Documenting │
├─────────────┼─────────────┤
│   Coding    │   Testing   │
└─────────────┴─────────────┘
```

### Technical Notes

```typescript
// Zone configuration
interface DepartmentZone {
  id: string;
  name: string; // "Designing", "Coding", etc.
  position: { x: number; y: number };
  desks: DeskPosition[];
  sign: SignConfig;
}

// Tilemap layers
const LAYERS = {
  floor: 0,      // Wooden planks
  carpet: 1,     // Central rug
  furniture: 2,  // Desks, chairs
  decorations: 3,// Plants, signs
  agents: 4,     // Characters
  ui: 5,         // Bubbles, labels
};
```

### Assets Required
- `floor-tiles.png` - Wooden floor tileset
- `furniture.png` - Desks, chairs, computers
- `decorations.png` - Plants, signs, bookshelves
- `carpet.png` - Company logo rug

### Files to Modify
- `frontend/src/scenes/MainScene.ts` - Update office rendering
- `frontend/src/config/officeLayout.ts` - NEW file for zone config
- `frontend/assets/` - Add tileset assets

### Estimated Effort: 8-10 hours (includes asset creation)

---

## Story UX-2.5: Agent Speech Bubbles

### Description
As a **user**,
I want **agents to show speech bubbles with icons indicating their current activity**,
So that **I can instantly see what each agent is doing (thinking, working, error, etc.)**.

### Acceptance Criteria

- [ ] Icon bubbles (24x24px) appear above agents
- [ ] Bubble types: 💡 Thinking, 📝 Working, ⚡ Executing, ✅ Complete, ⚠️ Error, 💬 Message, 👍 Feedback
- [ ] Pop-in animation: scale 0→1 with bounce (200ms)
- [ ] Float animation: subtle up/down motion
- [ ] Pop-out animation: scale 1→0 (150ms)
- [ ] Only show bubble when agent has active state (not IDLE)
- [ ] Bubble disappears after state changes or timeout

### Bubble Icon Mapping
| State | Icon | Color |
|-------|------|-------|
| THINKING | 💡 | Yellow |
| WORKING | 📝 | Blue |
| EXECUTING | ⚡ | Orange |
| TASK_COMPLETE | ✅ | Green |
| ERROR | ⚠️ | Red |
| MESSAGE_SEND | 💬 | Blue |
| FEEDBACK | 👍 | Green |
| IDLE | (none) | - |

### Technical Notes

```typescript
// Bubble component
interface SpeechBubble {
  icon: string;
  text?: string; // Optional text for expanded bubbles
  duration?: number; // Auto-hide after ms (0 = until state change)
}

// Animation config
const BUBBLE_ANIM = {
  popIn: { duration: 200, ease: 'Back.easeOut' },
  float: { duration: 1000, yoyo: true, repeat: -1 },
  popOut: { duration: 150, ease: 'Quad.easeIn' },
};

// Event type to icon mapping
const STATE_ICONS: Record<string, string> = {
  'THINKING': '💡',
  'WORKING': '📝',
  'EXECUTING': '⚡',
  'TASK_COMPLETE': '✅',
  'ERROR': '⚠️',
  'MESSAGE_SEND': '💬',
  'MESSAGE_RECEIVE': '💬',
  'FEEDBACK': '👍',
  'WORK_REQUEST': '📋',
  'WORK_COMPLETE': '✅',
  'REVIEW_REQUEST': '🔍',
};
```

### Files to Modify
- `frontend/src/sprites/SpeechBubble.ts` - NEW file for bubble component
- `frontend/src/sprites/AgentSprite.ts` - Integrate bubble display
- `frontend/src/utils/constants.ts` - Add state-to-icon mapping

### Estimated Effort: 4-5 hours

---

## Summary

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| UX-2.1 | Activity Log Sidebar | 4-6h | High |
| UX-2.2 | Camera Controls Toolbar | 3-4h | High |
| UX-2.3 | Pixel Art Characters | 6-8h | Medium |
| UX-2.4 | ChatDev Office Layout | 8-10h | Medium |
| UX-2.5 | Speech Bubbles | 4-5h | High |

**Total Estimated Effort: 25-33 hours**

### Recommended Implementation Order

1. **UX-2.1** Activity Log Sidebar (foundational layout change)
2. **UX-2.2** Camera Controls (improves usability)
3. **UX-2.5** Speech Bubbles (visual feedback, simpler)
4. **UX-2.3** Pixel Art Characters (visual upgrade)
5. **UX-2.4** ChatDev Office Layout (biggest visual change)

---

## Dependencies

```
UX-2.1 (Sidebar) ──────────────────────────────────┐
                                                   │
UX-2.2 (Camera) ───────────────────────────────────┤
                                                   ├──► All can be done
UX-2.5 (Bubbles) ──────────────────────────────────┤    in parallel after
                                                   │    UX-2.1
UX-2.3 (Characters) ───┐                           │
                       ├──► UX-2.4 depends on ─────┘
UX-2.4 (Office) ───────┘    character sprites
```
