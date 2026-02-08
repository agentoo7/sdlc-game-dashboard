import { useState, useRef, useCallback, useEffect } from 'react'
import { api } from '../services/api'
import type { Company, Agent, EventPayload, SDLCWorkflow, WorkflowStatus, SDLCEvent } from '../types'
import { AGENT_NAMES, getSDLCRole } from '../types'

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
}

function findAgentByRole(agents: Agent[], role: string): Agent | undefined {
  return agents.find((a) => a.role === role)
}

function getRandomName(): string {
  const pool = Math.random() > 0.5 ? AGENT_NAMES.male : AGENT_NAMES.female
  return pool[Math.floor(Math.random() * pool.length)]
}

export function useWorkflowRunner({
  company,
  agents,
  workflow,
  onEventSent,
  onEventUpdate,
  onAgentsChange,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isStoppedRef.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  const autoCreateMissingAgents = useCallback(async (): Promise<Agent[]> => {
    if (!company) return agents

    const missingRoles = workflow.requiredRoles.filter(
      (role) => !findAgentByRole(agents, role)
    )

    if (missingRoles.length === 0) return agents

    let updatedAgents = [...agents]
    for (const role of missingRoles) {
      const name = getRandomName()
      const agentId = `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const response = await api.createAgent(company.id, agentId, name, role)
      if (response.data) {
        updatedAgents.push({
          ...response.data,
          id: response.data.id || agentId,
        })
      }
    }

    // Refresh agents from API for accurate state
    const refreshed = await api.getAgents(company.id)
    if (refreshed.data) {
      updatedAgents = refreshed.data
    }

    onAgentsChange(updatedAgents)
    return updatedAgents
  }, [company, agents, workflow.requiredRoles, onAgentsChange])

  const executeWorkflow = useCallback(async (startAgents: Agent[]) => {
    if (!company) return

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
        status: 'pending',
      }
      onEventSent(sdlcEvent)

      // Build API payload
      const eventPayload: EventPayload = {
        company_id: company.id,
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

      // Update state (reuse roleFrom/roleTo from above)
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
  }, [company, workflow, onEventSent, onEventUpdate])

  const start = useCallback(async () => {
    if (!company) {
      setState((prev) => ({ ...prev, status: 'error', error: 'No company selected' }))
      return
    }
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
      currentAction: 'Auto-creating missing agents...',
      error: null,
    })

    try {
      const readyAgents = await autoCreateMissingAgents()

      // Verify all roles present
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

      setState((prev) => ({ ...prev, currentAction: 'Starting workflow...' }))
      await executeWorkflow(readyAgents)
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
      runningRef.current = false
    }
  }, [company, workflow, autoCreateMissingAgents, executeWorkflow])

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
