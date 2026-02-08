# Story 6.1: Activity Log Sidebar Implementation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **the Activity Log to be in a collapsible right sidebar instead of at the bottom**,
so that **I have more vertical space for the game view and can easily toggle the log visibility**.

## Acceptance Criteria

1. **AC1 - Sidebar Position:** Activity Log panel is positioned on the right side of the screen instead of bottom ✅
2. **AC2 - Sidebar Width:** When expanded, sidebar width is 320px; when collapsed, width is 40px ✅
3. **AC3 - Toggle Button:** Collapse/Expand button (◀/▶) toggles the sidebar state ✅
4. **AC4 - Unread Badge:** When collapsed, show a badge with unread event count ✅
5. **AC5 - Smooth Animation:** Collapse/expand transitions use 200ms ease-out animation ✅
6. **AC6 - State Persistence:** Sidebar collapsed/expanded state is persisted in localStorage ✅
7. **AC7 - Viewport Resize:** Game viewport resizes dynamically to fill remaining space when sidebar toggles ✅
8. **AC8 - Filter Dropdown:** Existing filter dropdown continues to work in sidebar layout ✅
9. **AC9 - Role-Based Borders:** Log entries have colored left border matching the agent's role color ✅

## Tasks / Subtasks

- [x] Task 1: Update HTML layout structure (AC: 1)
  - [x] 1.1 Change index.html layout from vertical (header-main-footer) to horizontal (header-main+sidebar)
  - [x] 1.2 Move activity-log div from footer to right sidebar position
  - [x] 1.3 Add CSS Grid or Flexbox layout for main content + sidebar

- [x] Task 2: Update ActivityLog class for sidebar layout (AC: 1, 2, 3, 8)
  - [x] 2.1 Refactor render() method for vertical sidebar layout (full height instead of fixed 128px)
  - [x] 2.2 Change toggle button icon from ▲/▼ to ◀/▶ for horizontal collapse
  - [x] 2.3 Update CSS classes for sidebar width (320px expanded, 40px collapsed)
  - [x] 2.4 Ensure filter panel works in vertical layout

- [x] Task 3: Implement unread count badge (AC: 4)
  - [x] 3.1 Add unreadCount tracking variable to ActivityLog class
  - [x] 3.2 Increment unreadCount when new logs arrive while collapsed
  - [x] 3.3 Reset unreadCount when sidebar is expanded
  - [x] 3.4 Render badge with count when collapsed and unreadCount > 0

- [x] Task 4: Add smooth animations (AC: 5)
  - [x] 4.1 Add CSS transition for sidebar width: "width 200ms ease-out"
  - [x] 4.2 Add CSS transition for game container resize
  - [x] 4.3 Ensure animations don't cause layout jank

- [x] Task 5: Implement localStorage persistence (AC: 6)
  - [x] 5.1 Save isExpanded state to localStorage key "sdlc_dashboard_sidebar_expanded"
  - [x] 5.2 Load saved state on component initialization
  - [x] 5.3 Default to expanded if no saved state exists

- [x] Task 6: Update main.ts and game resize handling (AC: 7)
  - [x] 6.1 Update getGameWidth() to subtract sidebar width
  - [x] 6.2 Listen for sidebar toggle events and trigger game.scale.resize()
  - [x] 6.3 Expose sidebar width getter from ActivityLog class
  - [x] 6.4 Emit custom event 'sidebarToggle' when state changes

- [x] Task 7: Add role-based colored borders (AC: 9)
  - [x] 7.1 Import ROLE_COLORS constant into ActivityLog
  - [x] 7.2 Get agent role from log entry
  - [x] 7.3 Add dynamic left border color to log entry elements
  - [x] 7.4 Handle unknown roles with default gray color

- [x] Task 8: Update tests (AC: all)
  - [x] 8.1 Update ActivityLog.test.ts for sidebar layout
  - [x] 8.2 Add tests for unread badge functionality
  - [x] 8.3 Add tests for localStorage persistence
  - [x] 8.4 Add tests for role-based borders

## Dev Notes

### Architecture Compliance

**Current Layout:**
```
┌─────────────────────────────────────────┐
│          Company Selector (80px)         │
├─────────────────────────────────────────┤
│                                         │
│            Game Viewport                │
│            (flex: 1)                    │
│                                         │
├─────────────────────────────────────────┤
│        Activity Log (128px footer)       │
└─────────────────────────────────────────┘
```

**Target Layout:**
```
┌─────────────────────────────────────────────────┐
│              Company Selector (80px)              │
├──────────────────────────────────┬──────────────┤
│                                  │              │
│         Game Viewport            │   Activity   │
│         (flex: 1)                │     Log      │
│                                  │   Sidebar    │
│                                  │   (320px)    │
│                                  │              │
└──────────────────────────────────┴──────────────┘
```

### Key Technical Decisions

1. **Layout Strategy:** Use CSS Flexbox for main content area (row direction)
   - Game container: `flex: 1` (takes remaining space)
   - Sidebar: fixed width 320px/40px

2. **Animation:** CSS transitions are preferred over JS animations for smoother performance
   - `transition: width 200ms ease-out`
   - `transition: flex 200ms ease-out` for game container

3. **Event Communication:** Custom DOM event for sidebar toggle
   - `window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: { expanded: boolean } }))`
   - main.ts listens and calls `game.scale.resize()`

4. **localStorage Key:** `"sdlc_dashboard_sidebar_expanded"` (namespaced to avoid conflicts)

### Existing Code Patterns

From `ActivityLog.ts`:
- Uses inline HTML template strings in `render()` method
- CSS classes use Tailwind utility classes
- Polling mechanism for log updates (every 2 seconds)
- `isExpanded` already exists but controls vertical height, needs repurposing

From `main.ts`:
- Game dimensions calculated by `getGameWidth()` and `getGameHeight()`
- `FOOTER_HEIGHT = 128` needs to be removed or repurposed
- Window resize listener already exists

### CSS Classes to Add/Modify

```css
/* Sidebar specific classes */
.activity-sidebar {
  width: 320px;
  min-width: 40px;
  transition: width 200ms ease-out;
}

.activity-sidebar.collapsed {
  width: 40px;
}

.main-content-wrapper {
  display: flex;
  flex-direction: row;
  flex: 1;
}

.game-container-wrapper {
  flex: 1;
  transition: flex 200ms ease-out;
}
```

### ROLE_COLORS Import

From `frontend/src/utils/constants.ts`:
```typescript
export const ROLE_COLORS: Record<string, number> = {
  customer: 0x9CA3AF,
  ba: 0x3B82F6,
  pm: 0x8B5CF6,
  architect: 0xF97316,
  developer: 0x22C55E,
  qa: 0xEF4444,
};
```

Convert hex number to CSS color: `#${color.toString(16).padStart(6, '0')}`

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
- Activity Log is in `frontend/src/ui/ActivityLog.ts`
- Main entry point: `frontend/src/main.ts`
- HTML structure: `frontend/index.html`
- Styles: `frontend/src/style.css` (Tailwind config)

### References

- [Source: _bmad-output/planning-artifacts/ui-ux-design-2026-02-03.md#Section 3 - Main Layout Structure]
- [Source: _bmad-output/implementation-artifacts/stories/ux-v2-implementation-stories.md#UX-2.1]
- [Source: frontend/src/ui/ActivityLog.ts - Current implementation]
- [Source: frontend/src/main.ts - Game initialization and resize handling]
- [Source: frontend/index.html - Current HTML layout]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All tests pass: 36 tests in 3 test files

### Completion Notes List

- Converted Activity Log from bottom footer to right sidebar
- Implemented collapsible sidebar (320px expanded, 40px collapsed)
- Added toggle button with ◀/▶ icons
- Implemented unread badge with count when collapsed
- Added smooth CSS transitions (200ms ease-out)
- localStorage persistence for sidebar state
- Game viewport auto-resizes on sidebar toggle via CustomEvent
- Role-based colored left borders on log entries
- All existing filter functionality preserved
- Updated tests with 19 test cases covering all ACs

### File List

- `frontend/index.html` - Updated layout structure (footer → aside sidebar)
- `frontend/src/ui/ActivityLog.ts` - Complete rewrite for sidebar layout
- `frontend/src/ui/ActivityLog.test.ts` - Updated tests for sidebar functionality
- `frontend/src/main.ts` - Added sidebar toggle event listener and resize handling
- `frontend/src/style.css` - Added sidebar CSS classes and animations

## Senior Developer Review (AI)

**Review Date:** 2026-02-04
**Review Outcome:** Approved with fixes applied
**Reviewer:** Claude Opus 4.5 (Adversarial Code Review)

### Issues Found & Fixed

| Severity | Issue | Resolution |
|----------|-------|------------|
| MEDIUM | [x] M1: Tests mostly unit tests, not integration | Added XSS prevention tests and unread count edge case tests |
| MEDIUM | [x] M2: Memory leak - event listener not cleaned up | Added cleanup on game destroy event |
| MEDIUM | [x] M3: Unread count edge case bug with decreasing logs | Changed to ID-based tracking instead of count comparison |
| MEDIUM | [x] M4: XSS vulnerability in log summary display | Added escapeHtml() function and sanitized all user content |
| LOW | L1: Magic numbers for sidebar dimensions | Not fixed - acceptable for now |
| LOW | L2: Missing ARIA attributes | Not fixed - can be addressed in accessibility story |
| LOW | L3: Polling interval not configurable | Not fixed - acceptable for MVP |

### Action Items

All HIGH and MEDIUM issues have been fixed. LOW issues are acceptable for current scope.

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-04 | Story created with comprehensive dev context | Claude Opus 4.5 |
| 2026-02-04 | Implementation complete - all 8 tasks done, all tests pass | Claude Opus 4.5 |
| 2026-02-04 | Code review complete - 4 MEDIUM issues fixed, story approved | Claude Opus 4.5 |
