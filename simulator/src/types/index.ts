// Role types matching the SDLC Game
export type AgentRole = 'customer' | 'ba' | 'pm' | 'architect' | 'developer' | 'qa'

// Company interface (matches API response)
export interface Company {
  id: string
  name: string
  description?: string
  agent_count?: number
  last_activity?: string | null
  status?: string
  created_at: string
}

// Company creation request
export interface CompanyCreateRequest {
  name: string
  description?: string
}

// Company creation response
export interface CompanyCreateResponse {
  id: string
  name: string
  created_at: string
}

// API Error response
export interface ApiErrorDetail {
  loc: string[]
  msg: string
  type: string
}

export interface ApiErrorResponse {
  detail: string | ApiErrorDetail[]
}

// Agent status types
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'walking'

// Role config from API
export interface RoleConfig {
  display_name: string
  color: string
}

// Agent interface (matches API response)
export interface Agent {
  id: string
  company_id: string
  name: string
  role: string
  role_config?: RoleConfig
  status: AgentStatus
  created_at: string
}

// Agent creation request
export interface AgentCreateRequest {
  agent_id: string
  name: string
  role: string
}

// Default roles for the dropdown
export const DEFAULT_ROLES: { value: string; label: string; color: string }[] = [
  { value: 'customer', label: 'Customer', color: '#9CA3AF' },
  { value: 'ba', label: 'Business Analyst', color: '#3B82F6' },
  { value: 'pm', label: 'Project Manager', color: '#8B5CF6' },
  { value: 'architect', label: 'Architect', color: '#F97316' },
  { value: 'developer', label: 'Developer', color: '#22C55E' },
  { value: 'qa', label: 'QA Engineer', color: '#EF4444' },
]

// Get role color by role value
export const getRoleColor = (role: string): string => {
  const found = DEFAULT_ROLES.find(r => r.value === role)
  return found?.color || '#6B7280'
}

// Get role display name
export const getRoleDisplayName = (role: string): string => {
  const found = DEFAULT_ROLES.find(r => r.value === role)
  return found?.label || role
}

// Event types - matching the API enum
export type EventType =
  | 'THINKING'
  | 'WORKING'
  | 'EXECUTING'
  | 'IDLE'
  | 'ERROR'
  | 'TASK_COMPLETE'
  | 'MESSAGE_SEND'
  | 'MESSAGE_RECEIVE'
  | 'WORK_REQUEST'
  | 'WORK_COMPLETE'
  | 'REVIEW_REQUEST'
  | 'FEEDBACK'
  | 'CUSTOM_EVENT'

// Event payload interface
export interface EventPayload {
  company_id: string
  event_type: EventType
  agent_id: string
  timestamp?: string
  data?: Record<string, unknown>
}

// API Response interfaces
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Event history entry
export interface EventHistoryEntry {
  id: string
  timestamp: string
  event_type: EventType
  agent_id: string
  agent_name: string
  agent_role: AgentRole
  company_id: string
  company_name: string
  status: 'pending' | 'success' | 'error'
  response?: unknown
  error?: string
}

// Role color mapping
export const ROLE_COLORS: Record<AgentRole, string> = {
  customer: 'role-customer',
  ba: 'role-ba',
  pm: 'role-pm',
  architect: 'role-architect',
  developer: 'role-developer',
  qa: 'role-qa',
}

// Role display names
export const ROLE_NAMES: Record<AgentRole, string> = {
  customer: 'Customer',
  ba: 'Business Analyst',
  pm: 'Project Manager',
  architect: 'Architect',
  developer: 'Developer',
  qa: 'QA Engineer',
}

// Event type categories - organized by agent behavior
export const EVENT_CATEGORIES: Record<string, EventType[]> = {
  'Status Updates': ['THINKING', 'WORKING', 'EXECUTING', 'IDLE', 'ERROR'],
  'Task Management': ['TASK_COMPLETE', 'WORK_REQUEST', 'WORK_COMPLETE'],
  'Communication': ['MESSAGE_SEND', 'MESSAGE_RECEIVE', 'REVIEW_REQUEST', 'FEEDBACK'],
  'Custom': ['CUSTOM_EVENT'],
}

// Communication event types (show "To Agent" dropdown)
export const COMMUNICATION_EVENTS: EventType[] = [
  'MESSAGE_SEND',
  'WORK_REQUEST',
  'REVIEW_REQUEST',
  'FEEDBACK',
]

// Check if event type is a communication event
export const isCommunicationEvent = (eventType: EventType): boolean => {
  return COMMUNICATION_EVENTS.includes(eventType)
}

// Payload templates for each event type
export const EVENT_PAYLOAD_TEMPLATES: Record<EventType, Record<string, unknown>> = {
  // Status updates
  THINKING: { thought: "Analyzing requirements...", context: "task planning" },
  WORKING: { task: "Implementing feature", progress: 50 },
  EXECUTING: { action: "Running tests", command: "npm test" },
  IDLE: { reason: "Waiting for dependencies", duration_seconds: 30 },
  ERROR: { error_type: "ValidationError", message: "Invalid input", details: "..." },
  // Task management
  TASK_COMPLETE: { task_id: "TASK-001", result: "success", output: "Feature implemented" },
  WORK_REQUEST: { task_id: "TASK-002", assignee: "", description: "Review this PR", priority: "high" },
  WORK_COMPLETE: { task_id: "TASK-002", deliverable: "Code review completed", notes: "LGTM" },
  // Communication
  MESSAGE_SEND: { to_agent: "", subject: "Status Update", content: "Task completed successfully" },
  MESSAGE_RECEIVE: { from_agent: "", subject: "New Task", content: "Please review the design" },
  REVIEW_REQUEST: { reviewer: "", item_type: "code", item_id: "PR-42", description: "Please review" },
  FEEDBACK: { to_agent: "", feedback_type: "positive", content: "Great work on the implementation!" },
  // Custom
  CUSTOM_EVENT: { event_name: "custom_action", data: {} },
}

// Sent event for history
export interface SentEvent {
  id: string
  timestamp: string
  company_id: string
  company_name: string
  agent_id: string
  agent_name: string
  agent_role: string
  event_type: EventType
  payload: Record<string, unknown>
  status: 'pending' | 'success' | 'error'
  response?: unknown
  error?: string
}

// Event send response
export interface EventSendResponse {
  event_id: string
  timestamp: string
  status: string
}
