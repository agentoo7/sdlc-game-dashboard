import { useState, useRef, useCallback } from 'react'
import { api } from '../services/api'
import type { Company, Agent, SentEvent } from '../types'
import type { Scenario, ScenarioEvent } from '../data/scenarios'
import { findAgentByRole } from '../data/scenarios'

export type ScenarioState = 'idle' | 'running' | 'paused' | 'completed' | 'error'

export interface ScenarioRunnerState {
  state: ScenarioState
  currentScenario: Scenario | null
  progress: number // 0-100
  currentEventIndex: number
  totalEvents: number
  eventsSent: number
  error: string | null
}

interface UseScenarioRunnerProps {
  company: Company | null
  agents: Agent[]
  onEventSent: (event: SentEvent) => void
  onEventUpdate: (eventId: string, updates: Partial<SentEvent>) => void
}

export function useScenarioRunner({
  company,
  agents,
  onEventSent,
  onEventUpdate,
}: UseScenarioRunnerProps) {
  const [state, setState] = useState<ScenarioRunnerState>({
    state: 'idle',
    currentScenario: null,
    progress: 0,
    currentEventIndex: 0,
    totalEvents: 0,
    eventsSent: 0,
    error: null,
  })

  // Refs for controlling execution
  const isPausedRef = useRef(false)
  const isStoppedRef = useRef(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate unique event ID
  const generateEventId = () => {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  // Send a single scenario event
  const sendScenarioEvent = useCallback(
    async (scenarioEvent: ScenarioEvent): Promise<boolean> => {
      if (!company) return false

      // Find agent by role
      const agent = findAgentByRole(agents, scenarioEvent.agentRole)
      if (!agent) {
        console.warn(`No agent found for role: ${scenarioEvent.agentRole}`)
        return false
      }

      // Create event entry
      const eventId = generateEventId()
      const sentEvent: SentEvent = {
        id: eventId,
        timestamp: new Date().toISOString(),
        company_id: company.id,
        company_name: company.name,
        agent_id: agent.id,
        agent_name: agent.name,
        agent_role: agent.role,
        event_type: scenarioEvent.eventType,
        payload: scenarioEvent.payload,
        status: 'pending',
      }

      // Add to history as pending
      onEventSent(sentEvent)

      // Send to API
      const response = await api.sendEvent({
        company_id: company.id,
        event_type: scenarioEvent.eventType,
        agent_id: agent.id,
        payload: scenarioEvent.payload,
      })

      if (response.data) {
        onEventUpdate(eventId, { status: 'success', response: response.data })
        return true
      } else {
        onEventUpdate(eventId, { status: 'error', error: response.error })
        return false
      }
    },
    [company, agents, onEventSent, onEventUpdate]
  )

  // Run scenario
  const start = useCallback(
    async (scenario: Scenario) => {
      if (!company || state.state === 'running') return

      // Reset state
      isPausedRef.current = false
      isStoppedRef.current = false

      setState({
        state: 'running',
        currentScenario: scenario,
        progress: 0,
        currentEventIndex: 0,
        totalEvents: scenario.events.length,
        eventsSent: 0,
        error: null,
      })

      // Execute events with delays
      for (let i = 0; i < scenario.events.length; i++) {
        // Check if stopped
        if (isStoppedRef.current) {
          setState((prev) => ({ ...prev, state: 'idle' }))
          return
        }

        // Wait for unpause
        while (isPausedRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          if (isStoppedRef.current) {
            setState((prev) => ({ ...prev, state: 'idle' }))
            return
          }
        }

        const event = scenario.events[i]

        // Wait for delay (except first event)
        if (i > 0 && event.delayMs > 0) {
          const prevDelay = scenario.events[i - 1]?.delayMs || 0
          const waitTime = event.delayMs - prevDelay
          if (waitTime > 0) {
            await new Promise((resolve) => {
              timeoutRef.current = setTimeout(resolve, waitTime)
            })
          }
        } else if (i === 0 && event.delayMs > 0) {
          await new Promise((resolve) => {
            timeoutRef.current = setTimeout(resolve, event.delayMs)
          })
        }

        // Check again after delay
        if (isStoppedRef.current) {
          setState((prev) => ({ ...prev, state: 'idle' }))
          return
        }

        // Update current event index
        setState((prev) => ({
          ...prev,
          currentEventIndex: i,
          progress: Math.round(((i + 1) / scenario.events.length) * 100),
        }))

        // Send event
        const success = await sendScenarioEvent(event)

        if (success) {
          setState((prev) => ({ ...prev, eventsSent: prev.eventsSent + 1 }))
        }
      }

      // Complete
      setState((prev) => ({
        ...prev,
        state: 'completed',
        progress: 100,
      }))
    },
    [company, state.state, sendScenarioEvent]
  )

  // Pause execution
  const pause = useCallback(() => {
    if (state.state === 'running') {
      isPausedRef.current = true
      setState((prev) => ({ ...prev, state: 'paused' }))
    }
  }, [state.state])

  // Resume execution
  const resume = useCallback(() => {
    if (state.state === 'paused') {
      isPausedRef.current = false
      setState((prev) => ({ ...prev, state: 'running' }))
    }
  }, [state.state])

  // Stop execution
  const stop = useCallback(() => {
    isStoppedRef.current = true
    isPausedRef.current = false
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState((prev) => ({
      ...prev,
      state: 'idle',
      currentScenario: null,
      progress: 0,
      currentEventIndex: 0,
    }))
  }, [])

  // Reset after completion
  const reset = useCallback(() => {
    setState({
      state: 'idle',
      currentScenario: null,
      progress: 0,
      currentEventIndex: 0,
      totalEvents: 0,
      eventsSent: 0,
      error: null,
    })
  }, [])

  return {
    ...state,
    start,
    pause,
    resume,
    stop,
    reset,
  }
}
