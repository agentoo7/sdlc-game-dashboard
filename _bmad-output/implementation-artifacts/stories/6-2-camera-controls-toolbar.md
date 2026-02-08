# Story 6.2: Camera Controls Toolbar

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **a camera control toolbar with Zoom In, Zoom Out, Pan, Center, and Reset buttons**,
So that **I can easily navigate the office view without relying only on mouse gestures**.

## Acceptance Criteria

1. **AC1 - Toolbar Position:** Toolbar appears at the bottom-left corner of the game viewport
2. **AC2 - Toolbar Background:** Semi-transparent dark background (#1E293B, 80% opacity) with rounded corners
3. **AC3 - Five Buttons:** Toolbar has 5 buttons: Zoom In (🔍+), Zoom Out (🔍-), Pan (↔️), Center (⌖), Reset (🔄)
4. **AC4 - Button States:** Buttons have visual states: default, hover, active, disabled
5. **AC5 - Zoom Limits:** Zoom limits are 0.5x to 2.0x, step is 0.2x per click
6. **AC6 - Pan Mode Toggle:** Pan button toggles pan mode (active state shows when pan mode is enabled)
7. **AC7 - Center View:** Center button centers the camera on the office (position 400, 400)
8. **AC8 - Reset View:** Reset button resets camera to default zoom (1.0x) and center position
9. **AC9 - Keyboard Shortcuts:** Support keyboard shortcuts: `+`/`=` (Zoom In), `-`/`_` (Zoom Out), `P` (Toggle Pan), `C`/`Home` (Center), `R`/`0` (Reset)
10. **AC10 - Button Disabled State:** Zoom In disabled at 2.0x, Zoom Out disabled at 0.5x

## Tasks / Subtasks

- [x] Task 1: Create CameraToolbar UI component (AC: 1, 2, 3, 4)
  - [x] 1.1 Create `frontend/src/ui/CameraToolbar.ts` class with render method
  - [x] 1.2 Add HTML container element in `frontend/index.html` for toolbar
  - [x] 1.3 Style toolbar with semi-transparent background and rounded corners
  - [x] 1.4 Create 5 button elements with icons and tooltips
  - [x] 1.5 Implement button states (default, hover, active, disabled) with CSS

- [x] Task 2: Implement Zoom functionality (AC: 5, 10)
  - [x] 2.1 Add zoomIn() method that increases zoom by 0.2x (max 2.0x)
  - [x] 2.2 Add zoomOut() method that decreases zoom by 0.2x (min 0.5x)
  - [x] 2.3 Emit custom events ('cameraZoom') with zoom level for MainScene to process
  - [x] 2.4 Update button disabled states based on current zoom level
  - [x] 2.5 Show current zoom level indicator in toolbar (optional tooltip)

- [x] Task 3: Implement Pan mode toggle (AC: 6)
  - [x] 3.1 Add togglePanMode() method that switches pan mode state
  - [x] 3.2 Pan button shows active state when pan mode is enabled
  - [x] 3.3 Emit custom event ('cameraPanMode') with enabled/disabled state
  - [x] 3.4 MainScene listens for pan mode events and updates drag behavior

- [x] Task 4: Implement Center and Reset functions (AC: 7, 8)
  - [x] 4.1 Add centerView() method that emits 'cameraCenter' event
  - [x] 4.2 Add resetView() method that emits 'cameraReset' event
  - [x] 4.3 MainScene handles 'cameraCenter' by centering on (400, 400)
  - [x] 4.4 MainScene handles 'cameraReset' by setting zoom to 1.0x and centering

- [x] Task 5: Implement keyboard shortcuts (AC: 9)
  - [x] 5.1 Add keyboard event listener in CameraToolbar class
  - [x] 5.2 Handle `+`/`=` keys for Zoom In
  - [x] 5.3 Handle `-`/`_` keys for Zoom Out
  - [x] 5.4 Handle `P` key for Toggle Pan Mode
  - [x] 5.5 Handle `C`/`Home` keys for Center View
  - [x] 5.6 Handle `R`/`0` keys for Reset View
  - [x] 5.7 Prevent default browser behavior for these keys when game is focused

- [x] Task 6: Update MainScene for toolbar integration (AC: all)
  - [x] 6.1 Add event listeners for 'cameraZoom', 'cameraPanMode', 'cameraCenter', 'cameraReset'
  - [x] 6.2 Implement smooth zoom transition (200ms, Quad.Out easing)
  - [x] 6.3 Implement smooth center/reset transitions (300ms animation)
  - [x] 6.4 Update pan mode behavior based on toggle state
  - [x] 6.5 Emit 'zoomChanged' event back to toolbar for button state updates

- [x] Task 7: Add CSS styles for toolbar (AC: 2, 4)
  - [x] 7.1 Add `.camera-toolbar` class in style.css
  - [x] 7.2 Add button styling with hover, active, and disabled states
  - [x] 7.3 Add tooltip styling for keyboard shortcut hints
  - [x] 7.4 Ensure toolbar doesn't overlap with game content

- [x] Task 8: Initialize toolbar in main.ts (AC: all)
  - [x] 8.1 Import and instantiate CameraToolbar
  - [x] 8.2 Connect toolbar events to MainScene via game events
  - [x] 8.3 Add cleanup on game destroy

- [x] Task 9: Write tests (AC: all)
  - [x] 9.1 Create `frontend/src/ui/CameraToolbar.test.ts`
  - [x] 9.2 Test zoom button functionality and limits
  - [x] 9.3 Test pan mode toggle state
  - [x] 9.4 Test center and reset event emissions
  - [x] 9.5 Test keyboard shortcut handling
  - [x] 9.6 Test button disabled state logic

## Dev Notes

### Architecture Compliance

**Toolbar Position:**
```
┌─────────────────────────────────────────────────┐
│              Company Selector (80px)              │
├──────────────────────────────────┬──────────────┤
│                                  │              │
│         Game Viewport            │   Activity   │
│         (flex: 1)                │     Log      │
│                                  │   Sidebar    │
│  ┌──────────────────┐            │   (320px)    │
│  │ Camera Toolbar   │            │              │
│  └──────────────────┘            │              │
└──────────────────────────────────┴──────────────┘
   ^ Bottom-left corner
```

### Key Technical Decisions

1. **Event-Based Communication:** Toolbar uses CustomEvents to communicate with MainScene
   - `window.dispatchEvent(new CustomEvent('cameraZoom', { detail: { zoom: 1.2 } }))`
   - MainScene listens and applies camera changes

2. **Zoom Implementation:**
   - Current zoom is tracked in MainScene via `this.cameras.main.zoom`
   - Toolbar reads initial zoom from MainScene via 'getZoom' event or default to 1.0
   - Zoom transitions use Phaser tweens for smooth animation

3. **Pan Mode Toggle:**
   - Default behavior: click+drag always pans (existing behavior)
   - Pan mode toggle allows switching between "click to select agent" vs "click to pan"
   - When pan mode is disabled, clicking on empty area deselects agent instead of panning

4. **Keyboard Shortcuts:**
   - Only active when game canvas has focus
   - Use `keydown` event on window with check for active element
   - Prevent default only for game-related keys

### Existing Code Patterns

From `MainScene.ts`:
```typescript
// Current camera setup
this.cameras.main.setBounds(-500, -500, 2000, 2000);
this.cameras.main.setZoom(1.0); // Default zoom

// Current scroll wheel zoom (story 4.1)
this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
  const zoomDelta = deltaY > 0 ? -0.1 : 0.1;
  const newZoom = Phaser.Math.Clamp(zoom + zoomDelta, 0.5, 2);
  this.cameras.main.setZoom(newZoom);
});

// Current pan drag (story 4.2)
this.isDragging = true;
this.cameras.main.scrollX -= dx / this.cameras.main.zoom;
this.cameras.main.scrollY -= dy / this.cameras.main.zoom;
```

From `ActivityLog.ts` (event pattern reference):
```typescript
// Custom event emission pattern
window.dispatchEvent(new CustomEvent('sidebarToggle', {
  detail: { expanded: boolean, width: number }
}));
```

### CSS Classes to Add

```css
/* Camera Toolbar */
.camera-toolbar {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 4px;
  padding: 8px;
  background: rgba(30, 41, 59, 0.8); /* #1E293B at 80% opacity */
  border-radius: 8px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  z-index: 100;
}

.camera-toolbar-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #94A3B8;
  cursor: pointer;
  transition: all 150ms ease;
  font-size: 16px;
}

.camera-toolbar-btn:hover:not(:disabled) {
  background: rgba(71, 85, 105, 0.5);
  color: #F8FAFC;
}

.camera-toolbar-btn:active:not(:disabled) {
  background: rgba(71, 85, 105, 0.8);
  transform: scale(0.95);
}

.camera-toolbar-btn.active {
  background: rgba(59, 130, 246, 0.3); /* Blue highlight for pan mode */
  color: #60A5FA;
}

.camera-toolbar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Tooltip for shortcuts */
.camera-toolbar-btn[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: #0F172A;
  color: #F8FAFC;
  font-size: 11px;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 4px;
}
```

### Button Icons

Using Unicode/Emoji for simplicity (can be replaced with SVG later):
- Zoom In: `+` or `🔍` with `+` overlay
- Zoom Out: `−` or `🔍` with `-` overlay
- Pan: `✥` or `↔️` (four-way arrow)
- Center: `⌖` or `⊙` (crosshair)
- Reset: `↺` or `🔄` (reset arrow)

Alternative: Use simple text/symbols for cleaner look:
- `+`, `-`, `⇔`, `⊙`, `⟲`

### Integration with main.ts

```typescript
// In main.ts after game ready
const cameraToolbar = new CameraToolbar('camera-toolbar');

// Listen for zoom changes from toolbar
window.addEventListener('cameraZoom', ((event: CustomEvent) => {
  const mainScene = game.scene.getScene('MainScene') as MainScene;
  mainScene.setZoom(event.detail.zoom);
}) as EventListener);

// Similar for other events...
```

### Test Cases

1. **Zoom In Button:**
   - Click increases zoom by 0.2x
   - Button disabled at 2.0x
   - Emits correct event

2. **Zoom Out Button:**
   - Click decreases zoom by 0.2x
   - Button disabled at 0.5x
   - Emits correct event

3. **Pan Mode Toggle:**
   - Toggle changes button active state
   - Emits panMode event with correct state
   - State toggles on each click

4. **Center Button:**
   - Click emits center event
   - Always enabled

5. **Reset Button:**
   - Click emits reset event
   - Always enabled

6. **Keyboard Shortcuts:**
   - Each key triggers correct action
   - Keys work when game focused
   - Default behavior prevented

### Project Structure Notes

- CameraToolbar: `frontend/src/ui/CameraToolbar.ts`
- CSS additions: `frontend/src/style.css`
- HTML container: `frontend/index.html` (inside `#game-container`)
- Tests: `frontend/src/ui/CameraToolbar.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2]
- [Source: _bmad-output/planning-artifacts/ui-ux-design-2026-02-03.md#Camera Controls]
- [Source: frontend/src/scenes/MainScene.ts - Current camera implementation]
- [Source: frontend/src/ui/ActivityLog.ts - Event pattern reference]
- [Source: _bmad-output/implementation-artifacts/stories/4-1-camera-zoom-controls.md]
- [Source: _bmad-output/implementation-artifacts/stories/4-2-camera-pan-controls.md]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All tests pass: 70 tests in 4 test files

### Completion Notes List

- Created CameraToolbar UI component with 5 buttons: Zoom In (+), Zoom Out (−), Pan (✥), Center (⊙), Reset (↺)
- Toolbar positioned at bottom-left with semi-transparent dark background (rgba(30, 41, 59, 0.8))
- Implemented zoom functionality with 0.2x step, limits 0.5x-2.0x
- Pan mode toggle with visual active state (blue highlight)
- Center and Reset functions with smooth animations (200-300ms)
- Full keyboard shortcut support: +/= (zoom in), -/_ (zoom out), P (pan toggle), C/Home (center), R/0 (reset)
- MainScene integration with event listeners for all camera controls
- Smooth transitions using Phaser tweens with Quad.Out easing
- Bi-directional sync between toolbar and MainScene via zoomChanged event
- Button disabled states at zoom limits

### File List

- `frontend/src/ui/CameraToolbar.ts` - New camera toolbar component
- `frontend/src/ui/CameraToolbar.test.ts` - Tests for toolbar (29 test cases)
- `frontend/index.html` - Added toolbar container div
- `frontend/src/style.css` - Added toolbar CSS styles
- `frontend/src/main.ts` - Initialize toolbar and cleanup
- `frontend/src/scenes/MainScene.ts` - Added toolbar event listeners and smooth camera controls

## Code Review Record

### Issues Found and Fixed

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | zoomChanged event listener not removed in destroy() | Added stored handler reference and removal in destroy() |
| 2 | MEDIUM | Button click handlers not removable (arrow functions) | Added buttonClickHandlers Map to store and remove handlers |
| 3 | HIGH | MainScene event listeners never cleaned up | Added shutdown() method with proper listener removal |
| 4 | LOW | Tests don't import exported constants | Updated tests to import ZOOM_MIN, ZOOM_MAX, etc. from source |

### Files Modified During Review

- `frontend/src/ui/CameraToolbar.ts` - Added proper event listener cleanup
- `frontend/src/scenes/MainScene.ts` - Added shutdown() method for cleanup
- `frontend/src/ui/CameraToolbar.test.ts` - Import constants from source

### Review Verification

- All 70 tests pass after fixes
- No regressions introduced

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-04 | Story created with comprehensive dev context | Claude Opus 4.5 |
| 2026-02-04 | Implementation complete - all 9 tasks done, all tests pass | Claude Opus 4.5 |
| 2026-02-04 | Code review complete - 4 issues fixed (memory leaks, cleanup) | Claude Opus 4.5 |
