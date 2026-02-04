# Story 5.5: Predefined Test Scenarios

Status: review

## Story

As a **demo presenter**,
I want **to run predefined event sequences**,
so that **I can demonstrate dashboard features without manual event sending**.

## Acceptance Criteria

1. **AC1: Scenarios tab visible**
   - Given I have a company selected
   - When I click "Scenarios" tab
   - Then I see a list of predefined scenarios:
     - "Quick Demo" - 5 events showing basic workflow (30 seconds)
     - "Full SDLC Cycle" - Complete BA→Dev→QA flow (2 minutes)
     - "Multi-Agent Collaboration" - 3 agents working together
     - "Stress Test" - Rapid events to test performance
     - "All Event Types" - Demonstrates each event type once

2. **AC2: Scenario info panel**
   - Given I select "Quick Demo" scenario
   - When I click "Run Scenario"
   - Then scenario info panel shows: description, estimated duration, events count
   - And "Start" and "Cancel" buttons appear

3. **AC3: Scenario execution**
   - Given I click "Start" on a scenario
   - When scenario runs
   - Then events are sent automatically with realistic timing delays
   - And progress bar shows completion percentage
   - And current event being sent is highlighted
   - And I can click "Pause" to pause execution
   - And I can click "Stop" to cancel remaining events

4. **AC4: Scenario completion**
   - Given scenario completes
   - When all events are sent
   - Then success message shows "Scenario complete: X events sent"
   - And all events appear in Event History

## Tasks / Subtasks

- [x] Task 1: Scenarios UI (AC: 1)
  - [x] 1.1: Add "Scenarios" tab/section to EventSender or new component
  - [x] 1.2: Create scenario list with cards showing name, description, duration
  - [x] 1.3: Disable scenarios if no company selected or no agents exist

- [x] Task 2: Define scenarios (AC: 1)
  - [x] 2.1: Define "Quick Demo" scenario (5 events, 30 sec)
  - [x] 2.2: Define "Full SDLC Cycle" scenario (BA→Dev→QA)
  - [x] 2.3: Define "Multi-Agent Collaboration" scenario
  - [x] 2.4: Define "Stress Test" scenario (rapid events)
  - [x] 2.5: Define "All Event Types" demo scenario

- [x] Task 3: Scenario execution engine (AC: 3)
  - [x] 3.1: Create ScenarioRunner class/hook
  - [x] 3.2: Implement timed event sending with delays
  - [x] 3.3: Implement progress tracking
  - [x] 3.4: Implement pause/resume functionality
  - [x] 3.5: Implement stop/cancel functionality

- [x] Task 4: Scenario UI controls (AC: 2, 3)
  - [x] 4.1: Create scenario info panel
  - [x] 4.2: Add Start/Pause/Stop buttons
  - [x] 4.3: Add progress bar
  - [x] 4.4: Highlight current event being sent

- [x] Task 5: Integration and feedback (AC: 4)
  - [x] 5.1: Connect to EventHistory (emit events as sent)
  - [x] 5.2: Show completion message with stats
  - [x] 5.3: Handle errors during scenario execution

## Dev Notes

### Dependencies

- **Requires Story 5.3**: Agents must exist for scenarios
- **Requires Story 5.4**: Uses same event sending API

### Scenario Definitions

```typescript
interface Scenario {
  id: string;
  name: string;
  description: string;
  durationEstimate: string;
  events: ScenarioEvent[];
}

interface ScenarioEvent {
  agentRole: string;  // Maps to actual agent by role
  eventType: string;
  payload: object;
  delayMs: number;    // Wait before this event
}

const SCENARIOS: Scenario[] = [
  {
    id: 'quick-demo',
    name: 'Quick Demo',
    description: '5 events showing basic workflow',
    durationEstimate: '30 seconds',
    events: [
      { agentRole: 'ba', eventType: 'THINKING', payload: { thought: 'Analyzing requirements...' }, delayMs: 0 },
      { agentRole: 'ba', eventType: 'WORKING', payload: { task: 'Writing user story' }, delayMs: 3000 },
      { agentRole: 'ba', eventType: 'MESSAGE_SEND', payload: { to_role: 'developer', ... }, delayMs: 5000 },
      { agentRole: 'developer', eventType: 'WORKING', payload: { task: 'Implementing feature' }, delayMs: 8000 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { result: 'success' }, delayMs: 15000 },
    ]
  },
  // ... more scenarios
];
```

### Scenario Runner Hook

```typescript
function useScenarioRunner(company: Company, agents: Agent[]) {
  const [state, setState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [progress, setProgress] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  const start = async (scenario: Scenario) => { /* ... */ };
  const pause = () => { /* ... */ };
  const resume = () => { /* ... */ };
  const stop = () => { /* ... */ };

  return { state, progress, currentEventIndex, start, pause, resume, stop };
}
```

### Agent Mapping

Scenarios use role names, not agent IDs. Map at runtime:
```typescript
const findAgentByRole = (agents: Agent[], role: string): Agent | undefined => {
  return agents.find(a => a.role === role);
};
```

### References

- [Source: prd-dashboard-2026-02-03.md#7.6] Event Types
- [Source: epics.md#Story-5.5] Acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Docker build: SUCCESS
- TypeScript compilation: SUCCESS (40 modules, 1.27s)

### Completion Notes List

- Created 5 predefined scenarios in scenarios.ts:
  - Quick Demo (5 events, 30 sec) - BA + Developer workflow
  - Full SDLC Cycle (18 events, 2 min) - Complete Customer→BA→PM→Architect→Developer→QA flow
  - Multi-Agent Collaboration (9 events, 1 min) - BA, Developer, QA working together
  - Stress Test (15 events, 15 sec) - Rapid-fire developer events
  - All Event Types (22 events, 1.5 min) - Demonstrates all event categories
- Created useScenarioRunner hook with start/pause/resume/stop controls
- Created ScenarioPanel component with scenario list, info panel, progress bar
- Added "Manual" and "Scenarios" tabs to EventSender
- Each scenario shows required roles, missing roles warning, ready/not-ready status
- Events are sent with realistic timing delays, progress tracking, and history integration
- All acceptance criteria satisfied: AC1-AC4

### File List

- `simulator/src/data/scenarios.ts` - NEW (scenario definitions)
- `simulator/src/hooks/useScenarioRunner.ts` - NEW (scenario execution hook)
- `simulator/src/components/ScenarioPanel.tsx` - NEW (scenarios UI)
- `simulator/src/components/EventSender.tsx` - MODIFIED (added tabs for Manual/Scenarios)

### Change Log

- 2026-02-04: Implemented Story 5.5 - Predefined Test Scenarios with 5 scenarios, execution engine, pause/resume/stop controls

