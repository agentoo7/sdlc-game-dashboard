// Role-based colors (hex numbers for Phaser)
export const ROLE_COLORS = {
  customer: 0x9CA3AF,    // Gray
  ba: 0x3B82F6,          // Blue
  pm: 0x8B5CF6,          // Violet
  architect: 0xF97316,   // Orange
  developer: 0x22C55E,   // Green
  qa: 0xEF4444,          // Red
} as const;

// Role colors as hex strings (for CSS/Tailwind)
export const ROLE_COLORS_HEX = {
  customer: '#9CA3AF',
  ba: '#3B82F6',
  pm: '#8B5CF6',
  architect: '#F97316',
  developer: '#22C55E',
  qa: '#EF4444',
} as const;

// Extended color palette for custom roles
export const CUSTOM_ROLE_COLORS = [
  0xEC4899, // Pink
  0x06B6D4, // Cyan
  0x84CC16, // Lime
  0xF59E0B, // Amber
  0x6366F1, // Indigo
  0x14B8A6, // Teal
  0xF43F5E, // Rose
  0x0EA5E9, // Sky
] as const;

// Zone positions in the office layout (ChatDev-style 2x2 grid - Story 6.4)
// Layout:
// +-------------------+-------------------+
// |     DESIGNING     |    DOCUMENTING    |
// |   (BA, PM, Cust)  |    (Architect)    |
// +-------------------+-------------------+
// |      CODING       |      TESTING      |
// |    (Developer)    |       (QA)        |
// +-------------------+-------------------+
export const ZONE_POSITIONS = {
  // ChatDev-style department zones (2x2 grid)
  designing: { x: 200, y: 200 },    // Top-left
  documenting: { x: 600, y: 200 },  // Top-right
  coding: { x: 200, y: 500 },       // Bottom-left
  testing: { x: 600, y: 500 },      // Bottom-right
} as const;

// Role to zone mapping (Story 6.4)
export const ROLE_TO_ZONE: Record<string, keyof typeof ZONE_POSITIONS> = {
  customer: 'designing',
  ba: 'designing',
  pm: 'designing',
  architect: 'documenting',
  developer: 'coding',
  qa: 'testing',
} as const;

// Zone display labels (Story 6.4)
export const ZONE_LABELS: Record<keyof typeof ZONE_POSITIONS, string> = {
  designing: 'DESIGNING',
  documenting: 'DOCUMENTING',
  coding: 'CODING',
  testing: 'TESTING',
} as const;

// Legacy role-based zone positions (for backwards compatibility)
export const ROLE_ZONE_POSITIONS = {
  customer: ZONE_POSITIONS.designing,
  ba: ZONE_POSITIONS.designing,
  pm: ZONE_POSITIONS.designing,
  architect: ZONE_POSITIONS.documenting,
  developer: ZONE_POSITIONS.coding,
  qa: ZONE_POSITIONS.testing,
} as const;

// Agent status types (matches backend agent.status values)
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  EXECUTING = 'executing',
  ERROR = 'error',
  WALKING = 'walking',
}

// Event types from backend (must match backend/app/schemas/event.py EventType)
export enum EventType {
  // Core event types (Story 3.2)
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  EXECUTING = 'EXECUTING',
  IDLE = 'IDLE',
  ERROR = 'ERROR',
  TASK_COMPLETE = 'TASK_COMPLETE',

  // Communication event types (Story 3.3)
  MESSAGE_SEND = 'MESSAGE_SEND',
  MESSAGE_RECEIVE = 'MESSAGE_RECEIVE',

  // Work events
  WORK_REQUEST = 'WORK_REQUEST',
  WORK_COMPLETE = 'WORK_COMPLETE',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  FEEDBACK = 'FEEDBACK',

  // Custom event (Story 3.10)
  CUSTOM_EVENT = 'CUSTOM_EVENT',
}

// Status indicator icons for agent visualization
export const STATUS_ICONS: Record<string, string> = {
  thinking: '💭',
  working: '📝',
  executing: '⚡',
  error: '❌',
  walking: '🚶',
  idle: '',
} as const;

// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';
export const POLLING_INTERVAL = 1000; // 1 second
