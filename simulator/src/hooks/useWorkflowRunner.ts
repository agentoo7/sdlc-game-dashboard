import { useState, useRef, useCallback, useEffect } from 'react'
import { api } from '../services/api'
import type { Company, Agent, EventPayload, SDLCWorkflow, WorkflowStatus, SDLCEvent } from '../types'
import { getSDLCRole } from '../types'

// BMAD canonical agent names per role
const BMAD_AGENT_NAMES: Record<string, string> = {
  analyst: 'Mary',
  pm: 'John',
  architect: 'Winston',
  ux: 'Sally',
  sm: 'Bob',
  dev: 'Amelia',
  qa: 'Quinn',
}

interface WorkflowRunnerState {
  status: WorkflowStatus
  currentStep: number
  totalSteps: number
  eventsSent: number
  currentAction: string
  error: string | null
}

interface UseWorkflowRunnerProps {
  company: Company | null
  agents: Agent[]
  workflow: SDLCWorkflow
  onEventSent: (event: SDLCEvent) => void
  onEventUpdate: (eventId: string, updates: Partial<SDLCEvent>) => void
  onAgentsChange: (agents: Agent[]) => void
  onCompanyChange: (company: Company) => void
}

function findAgentByRole(agents: Agent[], role: string): Agent | undefined {
  return agents.find((a) => a.role === role)
}

export function useWorkflowRunner({
  company,
  agents,
  workflow,
  onEventSent,
  onEventUpdate,
  onAgentsChange,
  onCompanyChange,
}: UseWorkflowRunnerProps) {
  const [state, setState] = useState<WorkflowRunnerState>({
    status: 'idle',
    currentStep: 0,
    totalSteps: workflow.steps.length,
    eventsSent: 0,
    currentAction: '',
    error: null,
  })

  const isPausedRef = useRef(false)
  const isStoppedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentStepRef = useRef(0)
  const runningRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  // Keep a mutable ref to the active company (may be auto-created during start)
  const activeCompanyRef = useRef<Company | null>(company)
  activeCompanyRef.current = company

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppedRef.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  const autoCreateCompany = useCallback(async (): Promise<Company> => {
    setState((prev) => ({ ...prev, currentAction: 'Creating company "Simple Shop"...' }))
    const response = await api.createCompany('Simple Shop', 'BMAD SDLC demo — Simple Shop project')
    if (!response.data) {
      throw new Error(response.error || 'Failed to create company')
    }
    const newCompany: Company = {
      ...response.data,
      id: response.data.id || '',
    }
    activeCompanyRef.current = newCompany
    onCompanyChange(newCompany)
    return newCompany
  }, [onCompanyChange])

  const autoCreateAgents = useCallback(async (targetCompany: Company): Promise<Agent[]> => {
    setState((prev) => ({ ...prev, currentAction: 'Creating BMAD agents...' }))

    const existingAgents = [...agents]
    const missingRoles = workflow.requiredRoles.filter(
      (role) => !findAgentByRole(existingAgents, role)
    )

    if (missingRoles.length === 0) return existingAgents

    let updatedAgents = [...existingAgents]
    for (const role of missingRoles) {
      const name = BMAD_AGENT_NAMES[role] || role
      const agentId = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const response = await api.createAgent(targetCompany.id, agentId, name, role)
      if (response.data) {
        updatedAgents.push({
          ...response.data,
          id: response.data.id || agentId,
        })
      }
    }

    // Refresh agents from API for accurate state
    const refreshed = await api.getAgents(targetCompany.id)
    if (refreshed.data) {
      updatedAgents = refreshed.data
    }

    onAgentsChange(updatedAgents)
    return updatedAgents
  }, [agents, workflow.requiredRoles, onAgentsChange])

  const executeWorkflow = useCallback(async (targetCompany: Company, startAgents: Agent[]) => {
    for (let i = currentStepRef.current; i < workflow.steps.length; i++) {
      // Check stopped
      if (isStoppedRef.current) break

      // Check paused — wait loop
      while (isPausedRef.current && !isStoppedRef.current) {
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(resolve, 500)
        })
      }
      if (isStoppedRef.current) break

      const step = workflow.steps[i]
      if (!step.topics || step.topics.length === 0) continue // Skip steps with no topics
      const topic = step.topics[0] // Deterministic: always use first topic
      const sourceAgent = findAgentByRole(startAgents, step.from)
      const targetAgent = findAgentByRole(startAgents, step.to)

      if (!sourceAgent) {
        // Skip step if agent not found
        continue
      }

      const roleFrom = getSDLCRole(step.from)
      const roleTo = getSDLCRole(step.to)

      // Build event for history
      const eventId = `wf-${Date.now()}-${i}`
      const sdlcEvent: SDLCEvent = {
        id: eventId,
        timestamp: new Date().toISOString(),
        fromAgent: sourceAgent.name,
        fromRole: roleFrom?.label || step.from,
        toAgent: targetAgent?.name || sourceAgent.name,
        toRole: roleTo?.label || step.to,
        action: step.action,
        eventType: step.eventType,
        topicTitle: topic.title,
        description: topic.markdown,
        status: 'pending',
      }
      onEventSent(sdlcEvent)

      // Build API payload
      const eventPayload: EventPayload = {
        company_id: targetCompany.id,
        agent_id: sourceAgent.id,
        event_type: step.eventType,
        payload: { task: topic.title, description: topic.markdown },
      }
      if (step.from !== step.to && targetAgent) {
        eventPayload.to_agent = targetAgent.id
      }

      // Send event
      const response = await api.sendEvent(eventPayload)
      if (isStoppedRef.current) break
      if (response.data) {
        onEventUpdate(eventId, { status: 'success' })
      } else {
        onEventUpdate(eventId, { status: 'error', error: response.error })
      }

      // Update state
      currentStepRef.current = i + 1
      setState((prev) => ({
        ...prev,
        currentStep: i + 1,
        eventsSent: prev.eventsSent + 1,
        currentAction: `${roleFrom?.icon || ''} ${step.from} ${step.action} ${roleTo?.icon || ''} ${step.to}: ${topic.title}`,
      }))

      // Wait 15 seconds before next step (skip on last step)
      if (i < workflow.steps.length - 1 && !isStoppedRef.current) {
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(resolve, 15000)
        })
      }
    }

    // Completed
    if (!isStoppedRef.current) {
      setState((prev) => ({ ...prev, status: 'completed', currentAction: 'Workflow complete!' }))
    }
    runningRef.current = false
  }, [workflow, onEventSent, onEventUpdate])

  const start = useCallback(async () => {
    if (runningRef.current) return

    runningRef.current = true
    isPausedRef.current = false
    isStoppedRef.current = false
    currentStepRef.current = 0
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()

    setState({
      status: 'running',
      currentStep: 0,
      totalSteps: workflow.steps.length,
      eventsSent: 0,
      currentAction: 'Initializing...',
      error: null,
    })

    try {
      // Step 1: Ensure company exists
      let targetCompany = activeCompanyRef.current
      if (!targetCompany) {
        targetCompany = await autoCreateCompany()
      }

      // Step 2: Create BMAD agents
      const readyAgents = await autoCreateAgents(targetCompany)

      // Step 3: Verify all roles present
      const stillMissing = workflow.requiredRoles.filter(
        (role) => !findAgentByRole(readyAgents, role)
      )
      if (stillMissing.length > 0) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: `Missing roles: ${stillMissing.join(', ')}`,
        }))
        runningRef.current = false
        return
      }

      // Step 4: Execute workflow
      setState((prev) => ({ ...prev, currentAction: 'Starting workflow...' }))
      await executeWorkflow(targetCompany, readyAgents)
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
      runningRef.current = false
    }
  }, [workflow, autoCreateCompany, autoCreateAgents, executeWorkflow])

  const pause = useCallback(() => {
    isPausedRef.current = true
    setState((prev) => ({ ...prev, status: 'paused' }))
  }, [])

  const resume = useCallback(() => {
    isPausedRef.current = false
    setState((prev) => ({ ...prev, status: 'running' }))
  }, [])

  const stop = useCallback(() => {
    isStoppedRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (abortControllerRef.current) abortControllerRef.current.abort()
    currentStepRef.current = 0
    runningRef.current = false
    setState({
      status: 'idle',
      currentStep: 0,
      totalSteps: workflow.steps.length,
      eventsSent: 0,
      currentAction: '',
      error: null,
    })
  }, [workflow.steps.length])

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset: stop,
  }
}
