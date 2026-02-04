# Story 5.1: Simulator Web App Setup

Status: ready-for-dev

## Story

As a **developer**,
I want **to run a standalone simulator web app alongside the dashboard**,
so that **I can test dashboard functionality without building the real client app**.

## Acceptance Criteria

1. **AC1: Simulator accessible via Docker**
   - Given the project is running with docker-compose
   - When I access `http://localhost:3001` (simulator port)
   - Then I see the Simulator Client web interface
   - And the app loads in <3 seconds
   - And the app is built with React + TypeScript + Vite

2. **AC2: Layout with required sections**
   - Given the simulator app is loaded
   - When I view the interface
   - Then I see a clean layout with sections for: Company Management, Agent Management, Event Sender, Event History
   - And the UI uses consistent styling with the dashboard (dark theme, same color palette)

## Tasks / Subtasks

- [ ] Task 1: Create simulator project structure (AC: 1)
  - [ ] 1.1: Create `simulator/` folder with Vite + React + TypeScript setup
  - [ ] 1.2: Configure `package.json` with dependencies (React, TypeScript, Vite, TailwindCSS)
  - [ ] 1.3: Create `tsconfig.json` with strict mode
  - [ ] 1.4: Create `vite.config.ts` with port 3001

- [ ] Task 2: Docker integration (AC: 1)
  - [ ] 2.1: Create `simulator/Dockerfile` based on Node 20 Alpine
  - [ ] 2.2: Update `docker-compose.yml` to add simulator service on port 3001
  - [ ] 2.3: Configure environment variables (VITE_API_URL=http://localhost:8000/api)
  - [ ] 2.4: Verify hot-reload works with volume mounts

- [ ] Task 3: Base layout and styling (AC: 2)
  - [ ] 3.1: Configure TailwindCSS with dark theme (matching dashboard colors)
  - [ ] 3.2: Create `App.tsx` with main layout structure
  - [ ] 3.3: Create placeholder components for 4 sections:
    - CompanyManagement.tsx
    - AgentManagement.tsx
    - EventSender.tsx
    - EventHistory.tsx
  - [ ] 3.4: Create responsive grid layout (2x2 or stacked on mobile)

- [ ] Task 4: API service setup (AC: 1, 2)
  - [ ] 4.1: Create `src/services/api.ts` with base fetch configuration
  - [ ] 4.2: Add health check call to verify backend connection
  - [ ] 4.3: Create types/interfaces matching backend API schemas

- [ ] Task 5: Testing and validation (AC: 1, 2)
  - [ ] 5.1: Verify `docker-compose up` starts simulator on port 3001
  - [ ] 5.2: Verify page loads in <3 seconds (Performance API measurement)
  - [ ] 5.3: Verify all 4 section placeholders render correctly
  - [ ] 5.4: Verify dark theme colors match dashboard palette

## Dev Notes

### Architecture Requirements

**Simulator is a SEPARATE React app** that runs alongside the existing Phaser dashboard:
- Dashboard (Phaser.js): `http://localhost:3000` - Visualization for viewers
- Simulator (React): `http://localhost:3001` - Testing tool for developers

**Tech Stack (from Architecture Document):**
- React 18+ with TypeScript
- Vite for fast HMR
- TailwindCSS for styling (dark theme)
- Fetch API for backend communication

### Color Palette (must match dashboard)

```typescript
// From architecture document - Role-based colors
const colors = {
  background: '#1F2937',    // Slate 800
  surface: '#374151',       // Slate 700
  text: '#F9FAFB',          // Gray 50
  textMuted: '#9CA3AF',     // Gray 400

  // Role colors (for badges)
  customer: '#9CA3AF',
  ba: '#3B82F6',
  pm: '#8B5CF6',
  architect: '#F97316',
  developer: '#22C55E',
  qa: '#EF4444',
};
```

### Docker Compose Addition

```yaml
# Add to existing docker-compose.yml
simulator:
  build:
    context: ./simulator
    dockerfile: Dockerfile
  volumes:
    - ./simulator:/app
    - /app/node_modules
  ports:
    - "3001:3001"
  environment:
    - VITE_API_URL=http://localhost:8000/api
  depends_on:
    - backend
  networks:
    - dashboard-network
```

### Project Structure

```
simulator/
├── Dockerfile
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css              # Tailwind imports
    ├── components/
    │   ├── CompanyManagement.tsx
    │   ├── AgentManagement.tsx
    │   ├── EventSender.tsx
    │   └── EventHistory.tsx
    ├── services/
    │   └── api.ts
    └── types/
        └── index.ts
```

### API Base Configuration

```typescript
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  health: () => fetch(`${API_URL}/health`).then(r => r.json()),
  // More endpoints in future stories
};
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  SIMULATOR CLIENT - SDLC Game Dashboard Testing Tool    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │  Company Management │  │   Agent Management      │   │
│  │  (Story 5.2)        │  │   (Story 5.3)           │   │
│  │  [Placeholder]      │  │   [Placeholder]         │   │
│  └─────────────────────┘  └─────────────────────────┘   │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │  Event Sender       │  │   Event History         │   │
│  │  (Story 5.4)        │  │   (Story 5.6)           │   │
│  │  [Placeholder]      │  │   [Placeholder]         │   │
│  └─────────────────────┘  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Previous Implementation Patterns (from Epic 1-4)

**Frontend patterns established:**
- Vite configuration with HMR
- TypeScript strict mode
- Docker volume mounts for development
- Environment variables via `VITE_` prefix

**Testing approach:**
- Integration tests verifying Docker services start correctly
- Performance measurements using browser Performance API
- Visual verification of UI components

### Project Structure Notes

- Simulator is a **new separate app**, NOT integrated into existing frontend
- Shares same Docker network to communicate with backend
- Uses same API contracts as dashboard frontend
- Independent build/deploy from dashboard

### References

- [Source: architecture-2026-02-03.md#7.1] Docker Compose configuration
- [Source: architecture-2026-02-03.md#4.1] Frontend project structure pattern
- [Source: project-context.md#Container-Strategy] Development containers
- [Source: epics.md#Epic-5] Epic goal and story acceptance criteria

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

