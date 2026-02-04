# Story 2.9: Company Selector UI

Status: done

## Story

As a **viewer**,
I want **to see a thumbnail grid of all companies and click to switch**,
So that **I can choose which team to watch**.

## Acceptance Criteria

1. **Given** 5 companies are registered
   **When** I view the dashboard
   **Then** I see a horizontal bar at top with 5 company thumbnails
   **And** each thumbnail shows: company name, agent count
   **And** the currently selected company has a gold border highlight

2. **Given** I click on a different company thumbnail
   **When** the click is processed
   **Then** the game view switches to that company's state
   **And** the selected thumbnail updates to show gold border
   **And** transition completes in <500ms

## Tasks / Subtasks

- [x] Task 1: Create CompanySelector component (AC: #1)
  - [x] 1.1 Create ui/CompanySelector.ts
  - [x] 1.2 Fetch companies from API on init
  - [x] 1.3 Render company cards in header

- [x] Task 2: Handle company selection (AC: #1, #2)
  - [x] 2.1 Add click handlers to company cards
  - [x] 2.2 Update selected state and gold border highlight
  - [x] 2.3 Emit event for MainScene to handle

- [x] Task 3: Connect MainScene to API (AC: #2)
  - [x] 3.1 Load company state on selection
  - [x] 3.2 Update agents from API data
  - [x] 3.3 Clear existing agents before loading new company

- [x] Task 4: Update main.ts (AC: #1, #2)
  - [x] 4.1 Initialize CompanySelector after game ready
  - [x] 4.2 Connect selector events to game events

## Dev Notes

### Component Architecture

```
main.ts
  └── Game
  │    └── MainScene (listens to 'selectCompany' event)
  └── CompanySelector
       ├── fetches /api/companies
       ├── renders company cards
       └── emits 'selectCompany' event on click
```

### Company Card UI

- Border: 2px amber-500 when selected, slate-600 otherwise
- Background: amber-500/10 when selected
- Content: Company name + agent count
- Transition: 150ms

### References

- [Source: epics.md#Story-2.9] - Original story definition

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

1. **CompanySelector component created** - Handles API calls, rendering, selection
2. **MainScene updated** - Loads agents from API instead of demo data
3. **Event system** - Game events connect UI to MainScene
4. **Styling** - Gold border for selected, hover states

### File List

**Created:**
- `frontend/src/ui/CompanySelector.ts` - Company selector component

**Modified:**
- `frontend/src/main.ts` - Initialize CompanySelector, emit events
- `frontend/src/scenes/MainScene.ts` - Load company state from API
- `frontend/src/types/index.ts` - Added status to Company, role_config to Agent
