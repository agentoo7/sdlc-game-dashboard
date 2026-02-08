// Scenario event definition
export interface ScenarioEvent {
  agentRole: string // Maps to actual agent by role
  eventType: string
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
        eventType: 'THINKING',
        payload: { thought: 'Analyzing user login requirements', context: 'requirement analysis' },
        delayMs: 0,
      },
      {
        agentRole: 'ba',
        eventType: 'TASK_COMPLETE',
        payload: { task_id: 'REQ-001', result: 'success', output: 'User story created: As a user, I want to log in securely' },
        delayMs: 5000,
      },
      {
        agentRole: 'developer',
        eventType: 'WORKING',
        payload: { task: 'Implementing login feature', progress: 25 },
        delayMs: 8000,
      },
      {
        agentRole: 'developer',
        eventType: 'TASK_COMPLETE',
        payload: { task_id: 'TASK-001', result: 'success', output: 'Login feature implemented - 5 files, 150 lines' },
        delayMs: 20000,
      },
      {
        agentRole: 'developer',
        eventType: 'REVIEW_REQUEST',
        payload: { reviewer: '', item_type: 'code', item_id: 'PR-42', description: 'Add user login feature' },
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
      { agentRole: 'customer', eventType: 'WORK_REQUEST', payload: { task_id: 'REQ-002', assignee: 'ba', description: 'Add payment integration', priority: 'high' }, delayMs: 0 },
      // BA analysis
      { agentRole: 'ba', eventType: 'THINKING', payload: { thought: 'Analyzing payment gateway requirements', context: 'requirement analysis' }, delayMs: 5000 },
      { agentRole: 'ba', eventType: 'TASK_COMPLETE', payload: { task_id: 'US-002', result: 'success', output: 'User story: Process payments (8 points)' }, delayMs: 10000 },
      // PM planning
      { agentRole: 'pm', eventType: 'WORKING', payload: { task: 'Starting Sprint-5', progress: 10 }, delayMs: 15000 },
      { agentRole: 'pm', eventType: 'WORK_REQUEST', payload: { task_id: 'TASK-010', assignee: 'architect', description: 'Design payment architecture', priority: 'high' }, delayMs: 20000 },
      // Architect design
      { agentRole: 'architect', eventType: 'THINKING', payload: { thought: 'Evaluating payment service options', context: 'architecture design' }, delayMs: 30000 },
      { agentRole: 'architect', eventType: 'TASK_COMPLETE', payload: { task_id: 'ARCH-002', result: 'success', output: 'Payment Service Architecture designed' }, delayMs: 40000 },
      { agentRole: 'architect', eventType: 'FEEDBACK', payload: { to_agent: 'pm', feedback_type: 'positive', content: 'Design approved - using Stripe API' }, delayMs: 50000 },
      // Developer implementation
      { agentRole: 'developer', eventType: 'WORKING', payload: { task: 'Implementing payment service', progress: 25 }, delayMs: 55000 },
      { agentRole: 'developer', eventType: 'EXECUTING', payload: { action: 'Running build', command: 'npm run build' }, delayMs: 70000 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'TASK-011', result: 'success', output: 'Payment integration complete - 12 files, 450 lines' }, delayMs: 80000 },
      { agentRole: 'developer', eventType: 'REVIEW_REQUEST', payload: { reviewer: 'qa', item_type: 'code', item_id: 'PR-55', description: 'Payment integration' }, delayMs: 85000 },
      // QA testing
      { agentRole: 'qa', eventType: 'THINKING', payload: { thought: 'Creating test plan for payment feature', context: 'test planning' }, delayMs: 90000 },
      { agentRole: 'qa', eventType: 'EXECUTING', payload: { action: 'Running payment tests', command: 'npm test payment' }, delayMs: 95000 },
      { agentRole: 'qa', eventType: 'TASK_COMPLETE', payload: { task_id: 'TEST-001', result: 'success', output: 'All payment tests passed' }, delayMs: 105000 },
      { agentRole: 'qa', eventType: 'FEEDBACK', payload: { to_agent: 'developer', feedback_type: 'positive', content: 'Payment refund test passed - good work!' }, delayMs: 110000 },
      // Completion
      { agentRole: 'pm', eventType: 'TASK_COMPLETE', payload: { task_id: 'MILESTONE-1', result: 'success', output: 'Payment MVP milestone achieved' }, delayMs: 115000 },
      { agentRole: 'customer', eventType: 'FEEDBACK', payload: { to_agent: 'pm', feedback_type: 'positive', content: 'Payment feature approved - Great work!' }, delayMs: 120000 },
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
      { agentRole: 'ba', eventType: 'MESSAGE_SEND', payload: { to_agent: 'developer', subject: 'Validation Requirements', content: 'What validation rules should we use for email fields?' }, delayMs: 0 },
      { agentRole: 'ba', eventType: 'MESSAGE_SEND', payload: { to_agent: 'developer', subject: 'Spec Update', content: 'Added validation rules to the specification' }, delayMs: 5000 },
      { agentRole: 'developer', eventType: 'WORKING', payload: { task: 'Implementing validation feature', progress: 30 }, delayMs: 10000 },
      { agentRole: 'developer', eventType: 'REVIEW_REQUEST', payload: { reviewer: 'qa', item_type: 'code', item_id: 'PR-60', description: 'Email validation feature' }, delayMs: 25000 },
      { agentRole: 'qa', eventType: 'EXECUTING', payload: { action: 'Running validation tests', command: 'npm test validation' }, delayMs: 30000 },
      { agentRole: 'qa', eventType: 'ERROR', payload: { error_type: 'BugFound', message: 'Email regex too strict', details: 'Valid emails being rejected' }, delayMs: 40000 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'BUG-005', result: 'success', output: 'Fixed: Updated regex pattern' }, delayMs: 50000 },
      { agentRole: 'qa', eventType: 'FEEDBACK', payload: { to_agent: 'developer', feedback_type: 'positive', content: 'Bug verified fixed' }, delayMs: 55000 },
      { agentRole: 'qa', eventType: 'TASK_COMPLETE', payload: { task_id: 'TEST-VAL', result: 'success', output: 'Email validation test passed' }, delayMs: 60000 },
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
      { agentRole: 'developer', eventType: 'WORKING', payload: { task: 'Starting stress test', progress: 0 }, delayMs: 0 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'COMMIT-1', result: 'success', output: 'commit 1' }, delayMs: 500 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'COMMIT-2', result: 'success', output: 'commit 2' }, delayMs: 1000 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'COMMIT-3', result: 'success', output: 'commit 3' }, delayMs: 1500 },
      { agentRole: 'developer', eventType: 'EXECUTING', payload: { action: 'Build B1', command: 'npm run build' }, delayMs: 2000 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'BUILD-1', result: 'success', output: 'Build completed in 30s' }, delayMs: 2500 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'COMMIT-4', result: 'success', output: 'commit 4' }, delayMs: 3000 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'COMMIT-5', result: 'success', output: 'commit 5' }, delayMs: 3500 },
      { agentRole: 'developer', eventType: 'EXECUTING', payload: { action: 'Build B2', command: 'npm run build' }, delayMs: 4000 },
      { agentRole: 'developer', eventType: 'ERROR', payload: { error_type: 'BuildFailed', message: 'Test failure', details: 'Build B2 failed' }, delayMs: 4500 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'COMMIT-6', result: 'success', output: 'fix tests' }, delayMs: 5000 },
      { agentRole: 'developer', eventType: 'EXECUTING', payload: { action: 'Build B3', command: 'npm run build' }, delayMs: 5500 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'BUILD-3', result: 'success', output: 'Build completed in 25s' }, delayMs: 6000 },
      { agentRole: 'developer', eventType: 'REVIEW_REQUEST', payload: { reviewer: '', item_type: 'code', item_id: 'PR-100', description: 'Stress test PR' }, delayMs: 6500 },
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'PR-100', result: 'success', output: 'PR merged' }, delayMs: 7000 },
    ],
  },

  // 5. All Event Types Demo
  {
    id: 'all-events',
    name: 'All Event Types',
    description: 'Demonstrates each event type available in the API',
    durationEstimate: '1.5 minutes',
    requiredRoles: ['customer', 'ba', 'pm', 'architect', 'developer', 'qa'],
    events: [
      // THINKING
      { agentRole: 'ba', eventType: 'THINKING', payload: { thought: 'Analyzing requirements', context: 'planning' }, delayMs: 0 },
      // WORKING
      { agentRole: 'developer', eventType: 'WORKING', payload: { task: 'Implementing feature', progress: 50 }, delayMs: 5000 },
      // EXECUTING
      { agentRole: 'qa', eventType: 'EXECUTING', payload: { action: 'Running tests', command: 'npm test' }, delayMs: 10000 },
      // IDLE
      { agentRole: 'pm', eventType: 'IDLE', payload: { reason: 'Waiting for dependencies', duration_seconds: 10 }, delayMs: 15000 },
      // ERROR
      { agentRole: 'developer', eventType: 'ERROR', payload: { error_type: 'CompileError', message: 'Syntax error', details: 'Missing semicolon' }, delayMs: 20000 },
      // TASK_COMPLETE
      { agentRole: 'developer', eventType: 'TASK_COMPLETE', payload: { task_id: 'FIX-001', result: 'success', output: 'Error fixed' }, delayMs: 25000 },
      // MESSAGE_SEND
      { agentRole: 'ba', eventType: 'MESSAGE_SEND', payload: { to_agent: 'developer', subject: 'Update', content: 'New requirements ready' }, delayMs: 30000 },
      // MESSAGE_RECEIVE
      { agentRole: 'developer', eventType: 'MESSAGE_RECEIVE', payload: { from_agent: 'ba', subject: 'Update', content: 'Acknowledged' }, delayMs: 35000 },
      // WORK_REQUEST
      { agentRole: 'pm', eventType: 'WORK_REQUEST', payload: { task_id: 'TASK-DEMO', assignee: 'developer', description: 'Implement demo feature', priority: 'medium' }, delayMs: 40000 },
      // WORK_COMPLETE
      { agentRole: 'developer', eventType: 'WORK_COMPLETE', payload: { task_id: 'TASK-DEMO', deliverable: 'Feature implemented', notes: 'Ready for review' }, delayMs: 50000 },
      // REVIEW_REQUEST
      { agentRole: 'developer', eventType: 'REVIEW_REQUEST', payload: { reviewer: 'qa', item_type: 'code', item_id: 'PR-DEMO', description: 'Demo feature PR' }, delayMs: 55000 },
      // FEEDBACK
      { agentRole: 'qa', eventType: 'FEEDBACK', payload: { to_agent: 'developer', feedback_type: 'positive', content: 'Great implementation!' }, delayMs: 60000 },
      // CUSTOM_EVENT
      { agentRole: 'architect', eventType: 'CUSTOM_EVENT', payload: { event_name: 'architecture_decision', data: { decision: 'Use microservices', rationale: 'Better scalability' } }, delayMs: 65000 },
      // Final status
      { agentRole: 'customer', eventType: 'FEEDBACK', payload: { to_agent: 'pm', feedback_type: 'positive', content: 'Demo complete - all event types shown!' }, delayMs: 70000 },
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
