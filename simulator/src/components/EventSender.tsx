import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import type { Company, Agent, EventType, SentEvent } from '../types'
import { EVENT_CATEGORIES, EVENT_PAYLOAD_TEMPLATES, isCommunicationEvent } from '../types'
import ScenarioPanel from './ScenarioPanel'

interface EventSenderProps {
  company: Company | null
  agents: Agent[]
  onEventSent: (event: SentEvent) => void
  onEventUpdate: (eventId: string, updates: Partial<SentEvent>) => void
}

type TabType = 'manual' | 'scenarios'

function EventSender({ company, agents, onEventSent, onEventUpdate }: EventSenderProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('manual')

  // Form state
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [selectedEventType, setSelectedEventType] = useState<EventType>('THINKING')
  const [toAgentId, setToAgentId] = useState('')
  const [payloadJson, setPayloadJson] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)

  // UI state
  const [sending, setSending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when company changes
  useEffect(() => {
    setSelectedAgentId('')
    setToAgentId('')
  }, [company?.id])

  // Auto-select first agent when agents change
  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id)
    }
  }, [agents, selectedAgentId])

  // Auto-fill payload when event type changes
  useEffect(() => {
    const template = EVENT_PAYLOAD_TEMPLATES[selectedEventType]
    if (template) {
      const payload = { ...template }
      if (isCommunicationEvent(selectedEventType) && toAgentId) {
        if ('to_agent' in payload) {
          payload.to_agent = toAgentId
        }
        if ('assignee' in payload) {
          payload.assignee = toAgentId
        }
        if ('reviewer' in payload) {
          payload.reviewer = toAgentId
        }
      }
      setPayloadJson(JSON.stringify(payload, null, 2))
      setJsonError(null)
    }
  }, [selectedEventType, toAgentId])

  // Validate JSON as user types
  const handlePayloadChange = (value: string) => {
    setPayloadJson(value)
    try {
      if (value.trim()) {
        JSON.parse(value)
        setJsonError(null)
      }
    } catch {
      setJsonError('Invalid JSON syntax')
    }
  }

  // Generate unique event ID
  const generateEventId = () => {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Send event
  const handleSend = useCallback(async () => {
    if (!company || !selectedAgentId || sending) return

    let payload: Record<string, unknown>
    try {
      payload = payloadJson.trim() ? JSON.parse(payloadJson) : {}
    } catch {
      setError('Invalid JSON payload')
      return
    }

    setSending(true)
    setError(null)

    const agent = agents.find(a => a.id === selectedAgentId)
    if (!agent) {
      setError('Selected agent not found')
      setSending(false)
      return
    }

    const eventId = generateEventId()
    const sentEvent: SentEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      company_id: company.id,
      company_name: company.name,
      agent_id: agent.id,
      agent_name: agent.name,
      agent_role: agent.role,
      event_type: selectedEventType,
      payload,
      status: 'pending',
    }

    onEventSent(sentEvent)

    const response = await api.sendEvent({
      company_id: company.id,
      event_type: selectedEventType,
      agent_id: selectedAgentId,
      data: payload,
    })

    if (response.data) {
      onEventUpdate(eventId, {
        status: 'success',
        response: response.data,
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 1500)
    } else if (response.error) {
      onEventUpdate(eventId, {
        status: 'error',
        error: response.error,
      })
      setError(response.error)
    }

    setSending(false)
  }, [company, selectedAgentId, selectedEventType, payloadJson, agents, onEventSent, onEventUpdate, sending])

  // Keyboard shortcut: Ctrl+Enter to send (only for manual tab)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && activeTab === 'manual') {
        e.preventDefault()
        handleSend()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSend, activeTab])

  const showToAgent = isCommunicationEvent(selectedEventType)

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-600 bg-dashboard-bg/50">
        <h2 className="text-lg font-semibold text-dashboard-text">Event Sender</h2>
        <p className="text-sm text-dashboard-muted">
          {company
            ? `Send events for ${company.name} (${agents.length} agents)`
            : 'Select a company first'
          }
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'manual'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-dashboard-bg/30'
              : 'text-dashboard-muted hover:text-dashboard-text'
          }`}
        >
          📤 Manual
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'scenarios'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-dashboard-bg/30'
              : 'text-dashboard-muted hover:text-dashboard-text'
          }`}
        >
          🎬 Scenarios
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === 'scenarios' ? (
          <ScenarioPanel
            company={company}
            agents={agents}
            onEventSent={onEventSent}
            onEventUpdate={onEventUpdate}
          />
        ) : (
          <>
            {/* No company selected */}
            {!company ? (
              <div className="flex items-center justify-center h-full text-dashboard-muted">
                <div className="text-center">
                  <div className="text-4xl mb-2">👈</div>
                  <p>Select a company first</p>
                </div>
              </div>
            ) : agents.length === 0 ? (
              /* No agents available */
              <div className="flex items-center justify-center h-full text-dashboard-muted">
                <div className="text-center">
                  <div className="text-4xl mb-2">🤖</div>
                  <p>No agents available</p>
                  <p className="text-sm">Add agents using Agent Management</p>
                </div>
              </div>
            ) : (
              /* Manual Event Form */
              <>
                {/* Success Indicator */}
                {showSuccess && (
                  <div className="mb-3 p-2 bg-green-900/50 border border-green-600 rounded-lg text-green-400 text-center text-sm flex items-center justify-center gap-2">
                    <span className="text-lg">✓</span> Event sent successfully
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-3 p-2 bg-red-900/50 border border-red-600 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Agent Dropdown */}
                <div className="mb-3">
                  <label className="block text-dashboard-muted text-sm mb-1">Agent</label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    disabled={sending}
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.id} - {agent.name} ({agent.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type Dropdown with Categories */}
                <div className="mb-3">
                  <label className="block text-dashboard-muted text-sm mb-1">Event Type</label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value as EventType)}
                    className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                    disabled={sending}
                  >
                    {Object.entries(EVENT_CATEGORIES).map(([category, eventTypes]) => (
                      <optgroup key={category} label={category}>
                        {eventTypes.map((eventType) => (
                          <option key={eventType} value={eventType}>
                            {eventType.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* To Agent Dropdown (for communication events) */}
                {showToAgent && (
                  <div className="mb-3">
                    <label className="block text-dashboard-muted text-sm mb-1">To Agent</label>
                    <select
                      value={toAgentId}
                      onChange={(e) => setToAgentId(e.target.value)}
                      className="w-full bg-dashboard-bg text-dashboard-text rounded-lg p-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                      disabled={sending}
                    >
                      <option value="">Select recipient...</option>
                      {agents
                        .filter((a) => a.id !== selectedAgentId)
                        .map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.id} - {agent.name} ({agent.role})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Payload Editor */}
                <div className="mb-3">
                  <label className="block text-dashboard-muted text-sm mb-1">
                    Payload (JSON)
                    {jsonError && <span className="text-red-400 ml-2">{jsonError}</span>}
                  </label>
                  <textarea
                    value={payloadJson}
                    onChange={(e) => handlePayloadChange(e.target.value)}
                    className={`w-full bg-dashboard-bg text-dashboard-text rounded-lg p-2 border ${
                      jsonError ? 'border-red-500' : 'border-gray-600'
                    } focus:border-blue-500 focus:outline-none font-mono text-xs h-24 resize-none`}
                    placeholder='{ "key": "value" }'
                    disabled={sending}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={sending || !selectedAgentId || !!jsonError}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg p-2 transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin">⏳</span> Sending...
                    </>
                  ) : (
                    <>
                      <span>📤</span> Send Event
                    </>
                  )}
                </button>

                {/* Keyboard Shortcut Hint */}
                <p className="text-center text-dashboard-muted text-xs mt-2">
                  Press <kbd className="px-1 py-0.5 bg-dashboard-bg border border-gray-600 rounded text-xs">Ctrl</kbd>+<kbd className="px-1 py-0.5 bg-dashboard-bg border border-gray-600 rounded text-xs">Enter</kbd> to send
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EventSender
