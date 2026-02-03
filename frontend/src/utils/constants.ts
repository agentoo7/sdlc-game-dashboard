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

// Zone positions in the office layout (following organic flow)
export const ZONE_POSITIONS = {
  customer: { x: 400, y: 80 },
  ba: { x: 200, y: 250 },
  pm: { x: 400, y: 250 },
  architect: { x: 600, y: 250 },
  developer: { x: 400, y: 450 },
  qa: { x: 400, y: 650 },
} as const;

// Agent status types
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  WALKING = 'walking',
}

// Event types from backend
export enum EventType {
  WORK_REQUEST = 'WORK_REQUEST',
  WORK_COMPLETE = 'WORK_COMPLETE',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  FEEDBACK = 'FEEDBACK',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  IDLE = 'IDLE',
}

// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const POLLING_INTERVAL = 1000; // 1 second
