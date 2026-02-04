import type { EventType } from '../types'

// Scenario event definition
export interface ScenarioEvent {
  agentRole: string // Maps to actual agent by role
  eventType: EventType
  payload: Record<string, unknown>
  delayMs: number // Wait before this event
}

// Scenario definition
export interface Scenario {
  id: string
  name: string
  description: string
  durationEstimate: string
  requiredRoles: string[]
  events: ScenarioEvent[]
}

// All predefined scenarios
export const SCENARIOS: Scenario[] = [
  // 1. Quick Demo - 5 events, 30 seconds
  {
    id: 'quick-demo',
    name: 'Quick Demo',
    description: '5 events showing basic workflow - BA analyzes, Developer implements',
    durationEstimate: '30 seconds',
    requiredRoles: ['ba', 'developer'],
    events: [
      {
        agentRole: 'ba',
        eventType: 'requirement_created',
        payload: { requirement_id: 'REQ-001', title: 'User Login Feature', description: 'Implement secure user authentication' },
        delayMs: 0,
      },
      {
        agentRole: 'ba',
        eventType: 'user_story_created',
        payload: { story_id: 'US-001', title: 'As a user, I want to log in securely', points: 5 },
        delayMs: 5000,
      },
      {
        agentRole: 'developer',
        eventType: 'code_started',
        payload: { task_id: 'TASK-001', branch: 'feature/user-login' },
        delayMs: 8000,
      },
      {
        agentRole: 'developer',
        eventType: 'code_completed',
        payload: { task_id: 'TASK-001', files_changed: 5, lines_added: 150 },
        delayMs: 20000,
      },
      {
        agentRole: 'developer',
        eventType: 'pull_request_created',
        payload: { pr_id: 'PR-42', title: 'Add user login feature', reviewers: ['senior-dev'] },
        delayMs: 25000,
      },
    ],
  },

  // 2. Full SDLC Cycle - BA → PM → Architect → Developer → QA
  {
    id: 'full-sdlc',
    name: 'Full SDLC Cycle',
    description: 'Complete workflow: Requirements → Design → Development → Testing',
    durationEstimate: '2 minutes',
    requiredRoles: ['customer', 'ba', 'pm', 'architect', 'developer', 'qa'],
    events: [
      // Customer request
      { agentRole: 'customer', eventType: 'customer_request', payload: { request: 'Add payment integration', priority: 'high' }, delayMs: 0 },
      // BA analysis
      { agentRole: 'ba', eventType: 'requirement_created', payload: { requirement_id: 'REQ-002', title: 'Payment Gateway Integration' }, delayMs: 5000 },
      { agentRole: 'ba', eventType: 'user_story_created', payload: { story_id: 'US-002', title: 'Process payments', points: 8 }, delayMs: 10000 },
      // PM planning
      { agentRole: 'pm', eventType: 'sprint_started', payload: { sprint_id: 'Sprint-5', goal: 'Payment feature', duration_days: 14 }, delayMs: 15000 },
      { agentRole: 'pm', eventType: 'task_assigned', payload: { task_id: 'TASK-010', assignee: 'architect', description: 'Design payment architecture' }, delayMs: 20000 },
      // Architect design
      { agentRole: 'architect', eventType: 'design_created', payload: { design_id: 'ARCH-002', type: 'component', title: 'Payment Service Architecture' }, delayMs: 30000 },
      { agentRole: 'architect', eventType: 'technical_decision', payload: { decision: 'Use Stripe API', rationale: 'Best documentation and support' }, delayMs: 40000 },
      { agentRole: 'architect', eventType: 'design_approved', payload: { design_id: 'ARCH-002', approver: 'Tech Lead' }, delayMs: 50000 },
      // Developer implementation
      { agentRole: 'developer', eventType: 'code_started', payload: { task_id: 'TASK-011', branch: 'feature/payment' }, delayMs: 55000 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'abc123', message: 'feat: add payment service' }, delayMs: 70000 },
      { agentRole: 'developer', eventType: 'code_completed', payload: { task_id: 'TASK-011', files_changed: 12, lines_added: 450 }, delayMs: 80000 },
      { agentRole: 'developer', eventType: 'pull_request_created', payload: { pr_id: 'PR-55', title: 'Payment integration' }, delayMs: 85000 },
      // QA testing
      { agentRole: 'qa', eventType: 'test_plan_created', payload: { plan_id: 'TP-002', coverage: ['unit', 'integration', 'e2e'] }, delayMs: 90000 },
      { agentRole: 'qa', eventType: 'test_started', payload: { test_suite: 'payment-tests', total_tests: 15 }, delayMs: 95000 },
      { agentRole: 'qa', eventType: 'test_passed', payload: { test_name: 'payment_success', duration_ms: 250 }, delayMs: 105000 },
      { agentRole: 'qa', eventType: 'test_passed', payload: { test_name: 'payment_refund', duration_ms: 180 }, delayMs: 110000 },
      // Completion
      { agentRole: 'pm', eventType: 'milestone_reached', payload: { milestone: 'Payment MVP', achieved_at: new Date().toISOString() }, delayMs: 115000 },
      { agentRole: 'customer', eventType: 'customer_approval', payload: { approved_item: 'Payment feature', comments: 'Great work!' }, delayMs: 120000 },
    ],
  },

  // 3. Multi-Agent Collaboration
  {
    id: 'multi-agent',
    name: 'Multi-Agent Collaboration',
    description: '3 agents working together with handoffs and communication',
    durationEstimate: '1 minute',
    requiredRoles: ['ba', 'developer', 'qa'],
    events: [
      { agentRole: 'ba', eventType: 'requirement_clarification', payload: { question: 'What validation rules?', context: 'Email field' }, delayMs: 0 },
      { agentRole: 'ba', eventType: 'communication', payload: { to_agent: 'developer', message_type: 'info', subject: 'Spec update', content: 'Added validation rules' }, delayMs: 5000 },
      { agentRole: 'developer', eventType: 'code_started', payload: { task_id: 'TASK-020', branch: 'feature/validation' }, delayMs: 10000 },
      { agentRole: 'developer', eventType: 'code_review_requested', payload: { pr_id: 'PR-60', reviewer: 'qa', urgency: 'normal' }, delayMs: 25000 },
      { agentRole: 'qa', eventType: 'test_started', payload: { test_suite: 'validation-tests', total_tests: 8 }, delayMs: 30000 },
      { agentRole: 'qa', eventType: 'bug_reported', payload: { bug_id: 'BUG-005', severity: 'medium', title: 'Email regex too strict' }, delayMs: 40000 },
      { agentRole: 'developer', eventType: 'bug_fixed', payload: { bug_id: 'BUG-005', fix_description: 'Updated regex pattern' }, delayMs: 50000 },
      { agentRole: 'qa', eventType: 'bug_verified', payload: { bug_id: 'BUG-005', verified_by: 'QA' }, delayMs: 55000 },
      { agentRole: 'qa', eventType: 'test_passed', payload: { test_name: 'email_validation', duration_ms: 50 }, delayMs: 60000 },
    ],
  },

  // 4. Stress Test - Rapid events
  {
    id: 'stress-test',
    name: 'Stress Test',
    description: 'Rapid-fire events to test dashboard performance',
    durationEstimate: '15 seconds',
    requiredRoles: ['developer'],
    events: [
      { agentRole: 'developer', eventType: 'code_started', payload: { task_id: 'STRESS-1' }, delayMs: 0 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'a1', message: 'commit 1' }, delayMs: 500 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'a2', message: 'commit 2' }, delayMs: 1000 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'a3', message: 'commit 3' }, delayMs: 1500 },
      { agentRole: 'developer', eventType: 'build_started', payload: { build_id: 'B1', trigger: 'push' }, delayMs: 2000 },
      { agentRole: 'developer', eventType: 'build_completed', payload: { build_id: 'B1', duration_seconds: 30 }, delayMs: 2500 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'a4', message: 'commit 4' }, delayMs: 3000 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'a5', message: 'commit 5' }, delayMs: 3500 },
      { agentRole: 'developer', eventType: 'build_started', payload: { build_id: 'B2', trigger: 'push' }, delayMs: 4000 },
      { agentRole: 'developer', eventType: 'build_failed', payload: { build_id: 'B2', error: 'Test failure' }, delayMs: 4500 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'a6', message: 'fix tests' }, delayMs: 5000 },
      { agentRole: 'developer', eventType: 'build_started', payload: { build_id: 'B3', trigger: 'push' }, delayMs: 5500 },
      { agentRole: 'developer', eventType: 'build_completed', payload: { build_id: 'B3', duration_seconds: 25 }, delayMs: 6000 },
      { agentRole: 'developer', eventType: 'pull_request_created', payload: { pr_id: 'PR-100' }, delayMs: 6500 },
      { agentRole: 'developer', eventType: 'pull_request_merged', payload: { pr_id: 'PR-100', merged_by: 'auto' }, delayMs: 7000 },
    ],
  },

  // 5. All Event Types Demo
  {
    id: 'all-events',
    name: 'All Event Types',
    description: 'Demonstrates each event category with representative events',
    durationEstimate: '1.5 minutes',
    requiredRoles: ['customer', 'ba', 'pm', 'architect', 'developer', 'qa'],
    events: [
      // Customer events
      { agentRole: 'customer', eventType: 'customer_request', payload: { request: 'New feature' }, delayMs: 0 },
      { agentRole: 'customer', eventType: 'customer_feedback', payload: { feedback: 'Looking good', sentiment: 'positive' }, delayMs: 5000 },
      // BA events
      { agentRole: 'ba', eventType: 'requirement_created', payload: { requirement_id: 'REQ-DEMO' }, delayMs: 10000 },
      { agentRole: 'ba', eventType: 'user_story_created', payload: { story_id: 'US-DEMO', points: 3 }, delayMs: 15000 },
      { agentRole: 'ba', eventType: 'acceptance_criteria_defined', payload: { story_id: 'US-DEMO', criteria: ['Given...', 'When...'] }, delayMs: 20000 },
      // PM events
      { agentRole: 'pm', eventType: 'sprint_started', payload: { sprint_id: 'Sprint-DEMO' }, delayMs: 25000 },
      { agentRole: 'pm', eventType: 'task_assigned', payload: { task_id: 'TASK-DEMO', assignee: 'developer' }, delayMs: 30000 },
      { agentRole: 'pm', eventType: 'blocker_reported', payload: { blocker: 'API dependency', severity: 'high' }, delayMs: 35000 },
      { agentRole: 'pm', eventType: 'blocker_resolved', payload: { blocker: 'API dependency', resolution: 'Mocked' }, delayMs: 40000 },
      // Architect events
      { agentRole: 'architect', eventType: 'design_created', payload: { design_id: 'ARCH-DEMO' }, delayMs: 45000 },
      { agentRole: 'architect', eventType: 'technical_decision', payload: { decision: 'Use React', rationale: 'Team expertise' }, delayMs: 50000 },
      { agentRole: 'architect', eventType: 'architecture_review', payload: { component: 'Frontend', findings: 'Good structure' }, delayMs: 55000 },
      // Developer events
      { agentRole: 'developer', eventType: 'code_started', payload: { task_id: 'TASK-DEMO' }, delayMs: 60000 },
      { agentRole: 'developer', eventType: 'code_committed', payload: { commit_hash: 'demo123', message: 'feat: demo' }, delayMs: 65000 },
      { agentRole: 'developer', eventType: 'build_started', payload: { build_id: 'BUILD-DEMO' }, delayMs: 70000 },
      { agentRole: 'developer', eventType: 'build_completed', payload: { build_id: 'BUILD-DEMO', duration_seconds: 60 }, delayMs: 75000 },
      // QA events
      { agentRole: 'qa', eventType: 'test_plan_created', payload: { plan_id: 'TP-DEMO' }, delayMs: 80000 },
      { agentRole: 'qa', eventType: 'test_started', payload: { test_suite: 'demo-tests', total_tests: 10 }, delayMs: 85000 },
      { agentRole: 'qa', eventType: 'test_passed', payload: { test_name: 'demo_test_1' }, delayMs: 88000 },
      { agentRole: 'qa', eventType: 'test_failed', payload: { test_name: 'demo_test_2', error: 'Assertion failed' }, delayMs: 90000 },
      { agentRole: 'qa', eventType: 'bug_reported', payload: { bug_id: 'BUG-DEMO', severity: 'low' }, delayMs: 93000 },
      // General
      { agentRole: 'pm', eventType: 'status_update', payload: { message: 'Demo complete', progress: 100 }, delayMs: 95000 },
    ],
  },
]

// Find agent by role
export const findAgentByRole = (agents: { id: string; name: string; role: string }[], role: string) => {
  return agents.find((a) => a.role === role)
}

// Check if scenario can run (all required roles have agents)
export const canRunScenario = (scenario: Scenario, agents: { role: string }[]): boolean => {
  const availableRoles = new Set(agents.map((a) => a.role))
  return scenario.requiredRoles.every((role) => availableRoles.has(role))
}

// Get missing roles for a scenario
export const getMissingRoles = (scenario: Scenario, agents: { role: string }[]): string[] => {
  const availableRoles = new Set(agents.map((a) => a.role))
  return scenario.requiredRoles.filter((role) => !availableRoles.has(role))
}
