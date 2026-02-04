import { useState, useCallback } from 'react'
import CompanyManagement from './components/CompanyManagement'
import AgentManagement from './components/AgentManagement'
import EventSender from './components/EventSender'
import EventHistory from './components/EventHistory'
import ConnectionStatus from './components/ConnectionStatus'
import { api } from './services/api'
import type { Company, Agent, SentEvent } from './types'

// Toast notification type
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

function App() {
  // Lifted state for selected company - shared across components
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Agents for the selected company
  const [agents, setAgents] = useState<Agent[]>([])

  // Event history - shared between EventSender and EventHistory
  const [eventHistory, setEventHistory] = useState<SentEvent[]>([])

  // Toast notifications for connection status
  const [toasts, setToasts] = useState<Toast[]>([])

  // Add toast notification
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  // Handle company selection - clear agents when company changes
  const handleCompanySelect = (company: Company | null) => {
    setSelectedCompany(company)
    if (!company) {
      setAgents([])
    }
  }

  // Handle event sent - add to history (keep max 100)
  const handleEventSent = (event: SentEvent) => {
    setEventHistory(prev => [event, ...prev].slice(0, 100))
  }

  // Update event status in history
  const handleEventUpdate = (eventId: string, updates: Partial<SentEvent>) => {
    setEventHistory(prev =>
      prev.map(e => (e.id === eventId ? { ...e, ...updates } : e))
    )
  }

  // Clear all event history
  const handleClearHistory = useCallback(() => {
    setEventHistory([])
  }, [])

  // Retry a failed event
  const handleRetryEvent = useCallback(async (event: SentEvent) => {
    // Update status to pending
    handleEventUpdate(event.id, { status: 'pending', error: undefined })

    // Re-send the event
    const response = await api.sendEvent({
      event_type: event.event_type,
      agent_id: event.agent_id,
      data: event.payload,
    })

    if (response.data) {
      handleEventUpdate(event.id, {
        status: 'success',
        response: response.data,
        error: undefined,
      })
    } else if (response.error) {
      handleEventUpdate(event.id, {
        status: 'error',
        error: response.error,
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-dashboard-surface border-b border-gray-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-dashboard-text">
            SDLC Dashboard Simulator
          </h1>
          <div className="flex items-center gap-4">
            <ConnectionStatus onToast={addToast} />
          </div>
        </div>
      </header>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-20 right-6 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in ${
                toast.type === 'success'
                  ? 'bg-green-600 text-white'
                  : toast.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {/* Main Content - 2x2 Grid */}
      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Top Left - Company Management */}
          <div className="bg-dashboard-surface rounded-lg border border-gray-600 overflow-hidden">
            <CompanyManagement
              selectedCompany={selectedCompany}
              onCompanySelect={handleCompanySelect}
            />
          </div>

          {/* Top Right - Agent Management */}
          <div className="bg-dashboard-surface rounded-lg border border-gray-600 overflow-hidden">
            <AgentManagement
              company={selectedCompany}
              agents={agents}
              onAgentsChange={setAgents}
            />
          </div>

          {/* Bottom Left - Event Sender */}
          <div className="bg-dashboard-surface rounded-lg border border-gray-600 overflow-hidden">
            <EventSender
              company={selectedCompany}
              agents={agents}
              onEventSent={handleEventSent}
              onEventUpdate={handleEventUpdate}
            />
          </div>

          {/* Bottom Right - Event History */}
          <div className="bg-dashboard-surface rounded-lg border border-gray-600 overflow-hidden">
            <EventHistory
              events={eventHistory}
              onClear={handleClearHistory}
              onRetry={handleRetryEvent}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
