# Story 5.3: Agent Management UI

Status: review

## Story

As a **tester**,
I want **to create and manage agents for a selected company**,
so that **I can populate the dashboard with test agents**.

## Acceptance Criteria

1. **AC1: Add Agent form visible**
   - Given I have selected a company from the dropdown
   - When I click "Add Agent"
   - Then I see a form with fields:
     - Agent ID (required, e.g., "BA-001")
     - Name (required, e.g., "Alice")
     - Role (dropdown with defaults: customer, ba, pm, architect, developer, qa + custom input option)

2. **AC2: Successful agent creation**
   - Given I fill in agent details and click "Add"
   - When form is submitted
   - Then simulator calls POST /api/companies/{id}/agents
   - And success message shows "Agent added: {agent_id}"
   - And agent appears in the "Company Agents" list below

3. **AC3: Remove agent**
   - Given I click "Remove" next to an agent in the list
   - When confirmation is accepted
   - Then simulator calls DELETE /api/companies/{id}/agents/{agent_id}
   - And agent is removed from the list

4. **AC4: Agent list display**
   - Given company has agents
   - When I view the Company Agents list
   - Then I see each agent with: Agent ID, Name, Role (with color badge), Status
   - And list updates when dashboard state changes

## Tasks / Subtasks

- [x] Task 1: Agent form UI (AC: 1)
  - [x] 1.1: Create AddAgentForm component with Agent ID, Name fields
  - [x] 1.2: Create Role dropdown with default BMAD roles
  - [x] 1.3: Add "Custom" option to role dropdown that shows text input
  - [x] 1.4: Add form validation (all fields required)
  - [x] 1.5: Style form consistent with CompanyManagement

- [x] Task 2: API integration for agents (AC: 2, 3)
  - [x] 2.1: Add `createAgent(companyId, data)` to api.ts
  - [x] 2.2: Add `removeAgent(companyId, agentId)` to api.ts
  - [x] 2.3: Add Agent types to types/index.ts
  - [x] 2.4: Implement form submission handler

- [x] Task 3: Agent list component (AC: 4)
  - [x] 3.1: Create AgentList component showing all agents
  - [x] 3.2: Display Agent ID, Name, Role badge (with color), Status
  - [x] 3.3: Add Remove button with confirmation dialog
  - [x] 3.4: Style role badges with role colors from architecture

- [x] Task 4: State management (AC: 2, 3, 4)
  - [x] 4.1: Fetch agents when company is selected
  - [x] 4.2: Update list after agent creation
  - [x] 4.3: Update list after agent removal
  - [x] 4.4: Pass agents to other components (EventSender needs agent list)

- [x] Task 5: Testing (AC: 1, 2, 3, 4)
  - [x] 5.1: Test form validation
  - [x] 5.2: Test agent creation flow
  - [x] 5.3: Test agent removal with confirmation
  - [x] 5.4: Test role badge colors

## Dev Notes

### Dependencies

- **Requires Story 5.2**: Company must be selectable
- Uses selectedCompany from App.tsx state

### API Endpoints

**POST /api/companies/{company_id}/agents**
```typescript
// Request
{
  "agent_id": "BA-001",
  "role": "ba",
  "name": "Alice"
}

// Response (201)
{
  "agent_id": "BA-001",
  "company_id": "uuid",
  "role": "ba",
  "role_config": {
    "display_name": "Business Analyst",
    "color": "#3B82F6"
  },
  "status": "idle",
  "created_at": "2026-02-04T10:00:00Z"
}
```

**DELETE /api/companies/{company_id}/agents/{agent_id}**
```typescript
// Response (200)
{
  "agent_id": "BA-001",
  "status": "removed"
}
```

### Role Colors (from architecture)

```typescript
const ROLE_COLORS: Record<string, string> = {
  customer: '#9CA3AF',
  ba: '#3B82F6',
  pm: '#8B5CF6',
  architect: '#F97316',
  developer: '#22C55E',
  qa: '#EF4444',
};
```

### Types

```typescript
// types/index.ts
export interface Agent {
  agent_id: string;
  name: string;
  role: string;
  role_config?: {
    display_name: string;
    color: string;
  };
  status: 'idle' | 'thinking' | 'working' | 'walking';
}

export interface AgentCreateRequest {
  agent_id: string;
  name: string;
  role: string;
}
```

### Component Structure

```typescript
// AgentManagement.tsx
interface Props {
  company: Company | null;
  agents: Agent[];
  onAgentsChange: (agents: Agent[]) => void;
}

// Sections:
// 1. "No company selected" message if company is null
// 2. Add Agent form
// 3. Agent list with remove buttons
```

### References

- [Source: prd-dashboard-2026-02-03.md#FR-AG01] Create Agent API
- [Source: prd-dashboard-2026-02-03.md#FR-AG02] Remove Agent API
- [Source: architecture-2026-02-03.md#6.2] Dynamic Role System

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Docker build: SUCCESS
- TypeScript compilation: SUCCESS (37 modules, 1.19s)

### Completion Notes List

- Implemented full AgentManagement component with Add Agent form, role dropdown, custom role option
- Added form validation (Agent ID, Name, Role required; duplicate ID check)
- Implemented agent list with role badges (color-coded), status display, and remove buttons
- Added confirmation dialog for agent removal
- Added toast notifications for success/error feedback
- Updated API service with company-scoped agent endpoints (/companies/{id}/agents)
- Added Agent types (AgentStatus, RoleConfig, AgentCreateRequest) and helper functions (getRoleColor, getRoleDisplayName)
- Lifted agents state to App.tsx and passed to AgentManagement and EventSender
- Updated EventSender to receive company and agents props
- All acceptance criteria satisfied: AC1 (form), AC2 (creation), AC3 (removal), AC4 (list display)

### File List

- `simulator/src/components/AgentManagement.tsx` - MODIFIED (full implementation)
- `simulator/src/components/EventSender.tsx` - MODIFIED (added props)
- `simulator/src/App.tsx` - MODIFIED (added agents state, updated props)
- `simulator/src/types/index.ts` - MODIFIED (added Agent types, helpers)
- `simulator/src/services/api.ts` - MODIFIED (updated agent endpoints)

### Change Log

- 2026-02-04: Implemented Story 5.3 - Agent Management UI with form, list, role badges, and CRUD operations

