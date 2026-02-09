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
export type AgentStatus = 'idle' | 'thinking' | 'working' | 'walking' | 'coding' | 'discussing' | 'reviewing' | 'break' | string

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

// Default role for new agents (index 4 = developer)
export const DEFAULT_AGENT_ROLE = DEFAULT_ROLES[4].value

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

// Free-form event type — backend accepts any string
export type EventType = string

// Well-known event types for UI dropdowns and documentation
export const KNOWN_EVENT_TYPES = [
  'THINKING', 'WORKING', 'EXECUTING', 'IDLE', 'ERROR', 'TASK_COMPLETE',
  'MESSAGE_SEND', 'MESSAGE_RECEIVE',
  'WORK_REQUEST', 'WORK_COMPLETE', 'REVIEW_REQUEST', 'FEEDBACK',
  'CODING', 'DISCUSSING', 'REVIEWING', 'BREAK',
  'CUSTOM_EVENT',
] as const

// Event payload interface (matches backend EventCreate schema)
export interface EventPayload {
  company_id: string
  event_type: EventType
  agent_id: string
  to_agent?: string
  payload?: Record<string, unknown>
  timestamp?: string
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
export const EVENT_CATEGORIES: Record<string, string[]> = {
  'Status Updates': ['THINKING', 'WORKING', 'EXECUTING', 'CODING', 'IDLE', 'ERROR'],
  'Activity States': ['DISCUSSING', 'REVIEWING', 'BREAK'],
  'Task Management': ['TASK_COMPLETE', 'WORK_REQUEST', 'WORK_COMPLETE'],
  'Communication': ['MESSAGE_SEND', 'MESSAGE_RECEIVE', 'REVIEW_REQUEST', 'FEEDBACK'],
  'Custom': ['CUSTOM_EVENT'],
}

// Communication event types (show "To Agent" dropdown)
export const COMMUNICATION_EVENTS: string[] = [
  'MESSAGE_SEND',
  'WORK_REQUEST',
  'REVIEW_REQUEST',
  'FEEDBACK',
]

// Check if event type is a communication event
export const isCommunicationEvent = (eventType: string): boolean => {
  return COMMUNICATION_EVENTS.includes(eventType)
}

// Payload templates for known event types
export const EVENT_PAYLOAD_TEMPLATES: Record<string, Record<string, unknown>> = {
  // Status updates
  THINKING: { thought: "Analyzing requirements...", context: "task planning" },
  WORKING: { task: "Implementing feature", progress: 50 },
  EXECUTING: { action: "Running tests", command: "npm test" },
  CODING: { task: "Writing implementation code", language: "typescript" },
  IDLE: { reason: "Waiting for dependencies", duration_seconds: 30 },
  ERROR: { error_type: "ValidationError", message: "Invalid input", details: "..." },
  // Activity states
  DISCUSSING: { task: "Team discussion", agent_state: "discussing" },
  REVIEWING: { task: "Code review", agent_state: "reviewing" },
  BREAK: { reason: "Coffee break", agent_state: "break" },
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

// ============================================================
// SDLC Simulator Types
// ============================================================

// 10 SDLC roles (from ref app) — enriched with fullName, description, tasks, skills
export const SDLC_ROLES = [
  { value: 'analyst', label: 'Analyst', fullName: 'Business Analyst (Mary)', color: '#4ECDC4', icon: '📊', description: 'Market/domain/technical research and product briefs', tasks: ['Research market', 'Document requirements', 'Create product brief'], skills: ['Research', 'Documentation', 'Analysis', 'Communication'] },
  { value: 'pm', label: 'PM', fullName: 'Product Manager (John)', color: '#FF6B6B', icon: '📋', description: 'PRD creation, stakeholder alignment, requirements', tasks: ['Create PRD', 'Define features', 'Prioritize backlog', 'Create epics'], skills: ['Strategy', 'Prioritization', 'Communication', 'Vision'] },
  { value: 'architect', label: 'Architect', fullName: 'System Architect (Winston)', color: '#95E1D3', icon: '🏗️', description: 'Technical decisions, architecture design, scalability', tasks: ['Design system', 'Define APIs', 'Tech decisions', 'Architecture doc'], skills: ['System Design', 'Tech Stack', 'Scalability', 'Integration'] },
  { value: 'ux', label: 'UX', fullName: 'UX Designer (Sally)', color: '#DDA0DD', icon: '🎨', description: 'User experience design, interaction patterns, UI planning', tasks: ['User research', 'Create wireframes', 'Design system', 'UI specs'], skills: ['Design', 'Prototyping', 'User Research', 'Accessibility'] },
  { value: 'sm', label: 'SM', fullName: 'Scrum Master (Bob)', color: '#F7DC6F', icon: '🎯', description: 'Sprint planning, story preparation, agile ceremonies', tasks: ['Plan sprints', 'Draft stories', 'Remove blockers', 'Retrospective'], skills: ['Agile', 'Facilitation', 'Planning', 'Coaching'] },
  { value: 'dev', label: 'Dev', fullName: 'Developer (Amelia)', color: '#74B9FF', icon: '💻', description: 'Code implementation, test writing, story execution', tasks: ['Write code', 'Code review', 'Unit testing', 'Story implementation'], skills: ['Coding', 'Testing', 'Problem Solving', 'Collaboration'] },
  { value: 'qa', label: 'QA', fullName: 'QA Engineer (Quinn)', color: '#A29BFE', icon: '🔍', description: 'Test automation, test generation, quality assurance', tasks: ['Write test cases', 'Automation', 'Bug verification', 'Test coverage'], skills: ['Testing', 'Automation', 'Quality Control', 'Detail-oriented'] },
] as const

export type SDLCRoleValue = typeof SDLC_ROLES[number]['value']

// Get SDLC role info by value
export const getSDLCRole = (role: string) => {
  return SDLC_ROLES.find(r => r.value === role)
}

// Workflow step interface
export interface WorkflowStep {
  from: string
  to: string
  action: string
  eventType: string
  topics: { title: string; markdown: string }[]
}

// SDLC Workflow definition
export interface SDLCWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  requiredRoles: string[]
}

// Agent name pools
export const AGENT_NAMES = {
  male: ['Alex', 'Brian', 'Chris', 'David', 'Eric', 'Frank', 'George', 'Henry', 'Ivan', 'Jack'],
  female: ['Anna', 'Beth', 'Cathy', 'Diana', 'Emma', 'Fiona', 'Grace', 'Helen', 'Ivy', 'Julia'],
}

// Workflow runner status
export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error'

// SDLC Event for history display
export interface SDLCEvent {
  id: string
  timestamp: string
  fromAgent: string
  fromRole: string
  toAgent: string
  toRole: string
  action: string
  eventType: EventType
  topicTitle: string
  description?: string
  status: 'pending' | 'success' | 'error'
  error?: string
}
