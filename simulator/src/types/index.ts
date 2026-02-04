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

// Event types - all 43 event types from the SDLC Game
export type EventType =
  // Customer events
  | 'customer_request'
  | 'customer_feedback'
  | 'customer_approval'
  | 'customer_rejection'
  // BA events
  | 'requirement_created'
  | 'requirement_updated'
  | 'requirement_clarification'
  | 'user_story_created'
  | 'acceptance_criteria_defined'
  // PM events
  | 'sprint_started'
  | 'sprint_completed'
  | 'task_assigned'
  | 'task_updated'
  | 'blocker_reported'
  | 'blocker_resolved'
  | 'milestone_reached'
  // Architect events
  | 'design_created'
  | 'design_updated'
  | 'design_approved'
  | 'technical_decision'
  | 'architecture_review'
  // Developer events
  | 'code_started'
  | 'code_completed'
  | 'code_committed'
  | 'pull_request_created'
  | 'pull_request_merged'
  | 'code_review_requested'
  | 'code_review_completed'
  | 'build_started'
  | 'build_completed'
  | 'build_failed'
  // QA events
  | 'test_plan_created'
  | 'test_started'
  | 'test_passed'
  | 'test_failed'
  | 'bug_reported'
  | 'bug_fixed'
  | 'bug_verified'
  | 'regression_found'
  // General events
  | 'status_update'
  | 'communication'
  | 'document_created'
  | 'meeting_scheduled'

// Event payload interface
export interface EventPayload {
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

// Event type categories
export const EVENT_CATEGORIES: Record<string, EventType[]> = {
  Customer: ['customer_request', 'customer_feedback', 'customer_approval', 'customer_rejection'],
  'Business Analyst': [
    'requirement_created',
    'requirement_updated',
    'requirement_clarification',
    'user_story_created',
    'acceptance_criteria_defined',
  ],
  'Project Manager': [
    'sprint_started',
    'sprint_completed',
    'task_assigned',
    'task_updated',
    'blocker_reported',
    'blocker_resolved',
    'milestone_reached',
  ],
  Architect: [
    'design_created',
    'design_updated',
    'design_approved',
    'technical_decision',
    'architecture_review',
  ],
  Developer: [
    'code_started',
    'code_completed',
    'code_committed',
    'pull_request_created',
    'pull_request_merged',
    'code_review_requested',
    'code_review_completed',
    'build_started',
    'build_completed',
    'build_failed',
  ],
  QA: [
    'test_plan_created',
    'test_started',
    'test_passed',
    'test_failed',
    'bug_reported',
    'bug_fixed',
    'bug_verified',
    'regression_found',
  ],
  General: ['status_update', 'communication', 'document_created', 'meeting_scheduled'],
}

// Communication event types (show "To Agent" dropdown)
export const COMMUNICATION_EVENTS: EventType[] = [
  'communication',
  'task_assigned',
  'code_review_requested',
  'code_review_completed',
]

// Check if event type is a communication event
export const isCommunicationEvent = (eventType: EventType): boolean => {
  return COMMUNICATION_EVENTS.includes(eventType)
}

// Payload templates for each event type
export const EVENT_PAYLOAD_TEMPLATES: Record<EventType, Record<string, unknown>> = {
  // Customer events
  customer_request: { request: "New feature request", priority: "high", details: "..." },
  customer_feedback: { feedback: "Great work!", sentiment: "positive" },
  customer_approval: { approved_item: "Sprint deliverable", comments: "Looks good" },
  customer_rejection: { rejected_item: "Design mockup", reason: "Not aligned with vision" },
  // BA events
  requirement_created: { requirement_id: "REQ-001", title: "User authentication", description: "..." },
  requirement_updated: { requirement_id: "REQ-001", changes: "Added 2FA support" },
  requirement_clarification: { question: "What about edge cases?", context: "..." },
  user_story_created: { story_id: "US-001", title: "As a user, I want to...", points: 5 },
  acceptance_criteria_defined: { story_id: "US-001", criteria: ["Given...", "When...", "Then..."] },
  // PM events
  sprint_started: { sprint_id: "Sprint-1", goal: "MVP features", duration_days: 14 },
  sprint_completed: { sprint_id: "Sprint-1", velocity: 34, completed_points: 34 },
  task_assigned: { task_id: "TASK-001", assignee: "", description: "Implement login" },
  task_updated: { task_id: "TASK-001", status: "in_progress", progress: 50 },
  blocker_reported: { blocker: "API dependency", severity: "high", affected_tasks: ["TASK-001"] },
  blocker_resolved: { blocker: "API dependency", resolution: "Mocked the API" },
  milestone_reached: { milestone: "Alpha release", achieved_at: new Date().toISOString() },
  // Architect events
  design_created: { design_id: "ARCH-001", type: "system_design", title: "Microservices architecture" },
  design_updated: { design_id: "ARCH-001", changes: "Added caching layer" },
  design_approved: { design_id: "ARCH-001", approver: "Tech Lead" },
  technical_decision: { decision: "Use PostgreSQL", rationale: "Better for complex queries" },
  architecture_review: { component: "Auth service", findings: "Good separation of concerns" },
  // Developer events
  code_started: { task_id: "TASK-001", branch: "feature/login" },
  code_completed: { task_id: "TASK-001", files_changed: 5, lines_added: 150 },
  code_committed: { commit_hash: "abc123", message: "feat: add login endpoint" },
  pull_request_created: { pr_id: "PR-42", title: "Add login feature", reviewers: [] },
  pull_request_merged: { pr_id: "PR-42", merged_by: "reviewer" },
  code_review_requested: { pr_id: "PR-42", reviewer: "", urgency: "normal" },
  code_review_completed: { pr_id: "PR-42", status: "approved", comments: 3 },
  build_started: { build_id: "BUILD-001", trigger: "push" },
  build_completed: { build_id: "BUILD-001", duration_seconds: 120, artifacts: ["app.js"] },
  build_failed: { build_id: "BUILD-001", error: "Test failures", failed_tests: 2 },
  // QA events
  test_plan_created: { plan_id: "TP-001", coverage: ["unit", "integration", "e2e"] },
  test_started: { test_suite: "auth-tests", total_tests: 25 },
  test_passed: { test_name: "login_success", duration_ms: 150 },
  test_failed: { test_name: "login_invalid_password", error: "Expected 401, got 500" },
  bug_reported: { bug_id: "BUG-001", severity: "critical", title: "Login fails on Safari" },
  bug_fixed: { bug_id: "BUG-001", fix_description: "Added browser compatibility" },
  bug_verified: { bug_id: "BUG-001", verified_by: "QA" },
  regression_found: { test_name: "checkout_flow", affected_version: "v1.2.0" },
  // General events
  status_update: { message: "Working on authentication module", progress: 75 },
  communication: { to_agent: "", message_type: "info", subject: "Update", content: "..." },
  document_created: { doc_type: "technical_spec", title: "API Documentation" },
  meeting_scheduled: { meeting_type: "standup", participants: [], scheduled_at: new Date().toISOString() },
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
