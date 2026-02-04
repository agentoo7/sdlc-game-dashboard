# Story 3.2: Core Event Types Processing

Status: done

## Story

As a **server**,
I want **to process core event types (THINKING, WORKING, EXECUTING, IDLE, ERROR, TASK_COMPLETE)**,
So that **agent states are updated correctly for visualization**.

## Acceptance Criteria

1. **Given** agent is "idle"
   **When** THINKING event is received
   **Then** agent status changes to "thinking"
   **And** `current_task` is updated from payload

2. **Given** agent is "thinking"
   **When** WORKING event is received
   **Then** agent status changes to "working"

3. **Given** any state
   **When** IDLE event is received
   **Then** agent status changes to "idle"
   **And** `current_task` is cleared

4. **Given** any state
   **When** ERROR event is received
   **Then** agent status changes to "error"

5. **Given** TASK_COMPLETE event is received
   **When** processed
   **Then** agent status changes to "idle"

## Tasks / Subtasks

- [x] Task 1: Implement state transitions (AC: #1-5)
  - [x] 1.1 THINKING → status: thinking, set current_task
  - [x] 1.2 WORKING → status: working
  - [x] 1.3 EXECUTING → status: executing
  - [x] 1.4 IDLE → status: idle, clear current_task
  - [x] 1.5 ERROR → status: error
  - [x] 1.6 TASK_COMPLETE → status: idle

- [x] Task 2: Verify implementation
  - [x] 2.1 Test THINKING event updates status and current_task ✓

## Dev Notes

### State Machine

```
idle → thinking → working → idle
          ↓
        error
```

### File List

**Modified:**
- `backend/app/api/events.py` - infer_actions() and update_agent_states()
