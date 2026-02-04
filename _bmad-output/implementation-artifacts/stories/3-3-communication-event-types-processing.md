# Story 3.3: Communication Event Types Processing

Status: done

## Story

As a **server**,
I want **to process communication events (MESSAGE_SEND, MESSAGE_RECEIVE)**,
So that **agent-to-agent interactions trigger movement animations**.

## Acceptance Criteria

1. **Given** BA-001 sends MESSAGE_SEND to Dev-001
   **When** event is processed
   **Then** server infers actions: `["BA-001:walk_to:Dev-001", "BA-001:handoff", "BA-001:return"]`
   **And** movement is queued in `pending_movements`
   **And** BA-001 status becomes "walking"

## Tasks / Subtasks

- [x] Task 1: Implement communication event processing
  - [x] 1.1 MESSAGE_SEND creates walk_to + handoff + return actions
  - [x] 1.2 Set agent status to "walking"
  - [x] 1.3 Set target agent status to "working"

- [x] Task 2: Create Movement records
  - [x] 2.1 Create Movement model
  - [x] 2.2 Queue movements in database
  - [x] 2.3 Include artifact from payload

## Dev Notes

### File List

**Created:**
- `backend/app/models/movement.py` - Movement model

**Modified:**
- `backend/app/api/events.py` - create_movements() function
- `backend/app/models/__init__.py` - Export Movement
- `backend/app/models/company.py` - Add movements relationship
