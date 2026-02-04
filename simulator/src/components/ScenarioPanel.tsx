import { useState } from 'react'
import type { Company, Agent, SentEvent } from '../types'
import { SCENARIOS, canRunScenario, getMissingRoles, type Scenario } from '../data/scenarios'
import { useScenarioRunner } from '../hooks/useScenarioRunner'
import { getRoleDisplayName } from '../types'

interface ScenarioPanelProps {
  company: Company | null
  agents: Agent[]
  onEventSent: (event: SentEvent) => void
  onEventUpdate: (eventId: string, updates: Partial<SentEvent>) => void
}

function ScenarioPanel({ company, agents, onEventSent, onEventUpdate }: ScenarioPanelProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)

  const runner = useScenarioRunner({
    company,
    agents,
    onEventSent,
    onEventUpdate,
  })

  const handleSelectScenario = (scenario: Scenario) => {
    if (runner.state === 'idle' || runner.state === 'completed') {
      setSelectedScenario(scenario)
    }
  }

  const handleStart = () => {
    if (selectedScenario && canRunScenario(selectedScenario, agents)) {
      runner.start(selectedScenario)
    }
  }

  const handleClose = () => {
    if (runner.state === 'idle' || runner.state === 'completed') {
      setSelectedScenario(null)
      runner.reset()
    }
  }

  // No company selected
  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-dashboard-muted">
        <div className="text-center">
          <div className="text-4xl mb-2">👈</div>
          <p>Select a company first</p>
        </div>
      </div>
    )
  }

  // No agents
  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-dashboard-muted">
        <div className="text-center">
          <div className="text-4xl mb-2">🤖</div>
          <p>Add agents first</p>
          <p className="text-sm">Scenarios require agents with specific roles</p>
        </div>
      </div>
    )
  }

  // Scenario detail/execution view
  if (selectedScenario) {
    const canRun = canRunScenario(selectedScenario, agents)
    const missingRoles = getMissingRoles(selectedScenario, agents)
    const isRunning = runner.state === 'running' || runner.state === 'paused'
    const isCompleted = runner.state === 'completed'

    return (
      <div className="space-y-4">
        {/* Scenario Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-dashboard-text font-medium">{selectedScenario.name}</h3>
          {!isRunning && (
            <button
              onClick={handleClose}
              className="text-dashboard-muted hover:text-dashboard-text text-sm"
            >
              ← Back to list
            </button>
          )}
        </div>

        {/* Scenario Info */}
        <div className="p-3 bg-dashboard-bg rounded-lg border border-gray-600">
          <p className="text-dashboard-text text-sm mb-2">{selectedScenario.description}</p>
          <div className="flex gap-4 text-xs text-dashboard-muted">
            <span>⏱ {selectedScenario.durationEstimate}</span>
            <span>📝 {selectedScenario.events.length} events</span>
          </div>
          <div className="mt-2 text-xs text-dashboard-muted">
            Required roles:{' '}
            {selectedScenario.requiredRoles.map((role) => (
              <span
                key={role}
                className={`inline-block px-1.5 py-0.5 rounded mr-1 ${
                  agents.some((a) => a.role === role)
                    ? 'bg-green-900/50 text-green-400'
                    : 'bg-red-900/50 text-red-400'
                }`}
              >
                {getRoleDisplayName(role)}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Roles Warning */}
        {!canRun && (
          <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <p className="text-yellow-400 text-sm">
              Missing agents for roles: {missingRoles.map((r) => getRoleDisplayName(r)).join(', ')}
            </p>
            <p className="text-yellow-400/70 text-xs mt-1">
              Add agents with these roles to run this scenario
            </p>
          </div>
        )}

        {/* Progress Bar (when running) */}
        {isRunning && (
          <div>
            <div className="flex justify-between text-xs text-dashboard-muted mb-1">
              <span>Progress</span>
              <span>{runner.eventsSent} / {runner.totalEvents} events</span>
            </div>
            <div className="h-2 bg-dashboard-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${runner.progress}%` }}
              />
            </div>
            {runner.state === 'running' && (
              <p className="text-xs text-dashboard-muted mt-1 animate-pulse">
                Sending event {runner.currentEventIndex + 1} of {runner.totalEvents}...
              </p>
            )}
            {runner.state === 'paused' && (
              <p className="text-xs text-yellow-400 mt-1">Paused</p>
            )}
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <p className="text-green-400 text-sm flex items-center gap-2">
              <span>✓</span>
              Scenario complete: {runner.eventsSent} events sent
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {runner.state === 'idle' && (
            <button
              onClick={handleStart}
              disabled={!canRun}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg p-2 transition-colors"
            >
              ▶ Start Scenario
            </button>
          )}

          {runner.state === 'running' && (
            <>
              <button
                onClick={runner.pause}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg p-2 transition-colors"
              >
                ⏸ Pause
              </button>
              <button
                onClick={runner.stop}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg p-2 transition-colors"
              >
                ⏹ Stop
              </button>
            </>
          )}

          {runner.state === 'paused' && (
            <>
              <button
                onClick={runner.resume}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg p-2 transition-colors"
              >
                ▶ Resume
              </button>
              <button
                onClick={runner.stop}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg p-2 transition-colors"
              >
                ⏹ Stop
              </button>
            </>
          )}

          {isCompleted && (
            <>
              <button
                onClick={handleStart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg p-2 transition-colors"
              >
                🔄 Run Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg p-2 transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Scenario List View
  return (
    <div className="space-y-3">
      <p className="text-dashboard-muted text-sm">
        Select a scenario to run automated event sequences
      </p>

      {SCENARIOS.map((scenario) => {
        const canRun = canRunScenario(scenario, agents)
        const missingRoles = getMissingRoles(scenario, agents)

        return (
          <button
            key={scenario.id}
            onClick={() => handleSelectScenario(scenario)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              canRun
                ? 'bg-dashboard-bg border-gray-600 hover:border-blue-500'
                : 'bg-dashboard-bg/50 border-gray-700 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-dashboard-text font-medium">{scenario.name}</span>
              <span className="text-xs text-dashboard-muted">{scenario.durationEstimate}</span>
            </div>
            <p className="text-sm text-dashboard-muted mb-2">{scenario.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dashboard-muted">
                {scenario.events.length} events
              </span>
              {!canRun && (
                <span className="text-xs text-yellow-400">
                  Missing: {missingRoles.map((r) => getRoleDisplayName(r)).join(', ')}
                </span>
              )}
              {canRun && (
                <span className="text-xs text-green-400">Ready to run</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ScenarioPanel
