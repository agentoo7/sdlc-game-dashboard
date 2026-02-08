import { useState, useCallback } from 'react'
import CompanyManagement from './components/CompanyManagement'
import AgentManagement from './components/AgentManagement'
import EventSender from './components/EventSender'
import EventHistory from './components/EventHistory'
import ConnectionStatus from './components/ConnectionStatus'
import SDLCSimulator from './components/SDLCSimulator'
import { api } from './services/api'
import type { Company, Agent, SentEvent } from './types'

// Toast notification type
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

type PageView = 'sdlc' | 'dashboard'

function App() {
  const [page, setPage] = useState<PageView>('sdlc')

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
      company_id: event.company_id,
      event_type: event.event_type,
      agent_id: event.agent_id,
      payload: event.payload,
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
    <>
      {/* Page Navigation */}
      <div className="fixed top-0 left-0 right-0 z-[100] border-b border-cyan-400/20" style={{ background: 'linear-gradient(90deg, rgba(10,10,26,0.98) 0%, rgba(26,26,58,0.95) 50%, rgba(10,10,26,0.98) 100%)' }}>
        <div className="flex items-center gap-1 px-4 h-10">
          <button
            onClick={() => setPage('sdlc')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              page === 'sdlc'
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                : 'text-[#a0aac8] hover:text-cyan-300 hover:bg-cyan-400/10'
            }`}
          >
            SDLC Simulator
          </button>
          <button
            onClick={() => setPage('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              page === 'dashboard'
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30'
                : 'text-[#a0aac8] hover:text-cyan-300 hover:bg-cyan-400/10'
            }`}
          >
            Dashboard Simulator
          </button>
          <div className="ml-auto">
            <ConnectionStatus onToast={addToast} />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed top-14 right-6 z-[101] space-y-2">
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

      {/* SDLC Simulator Page (stays mounted) */}
      <div style={{ display: page === 'sdlc' ? 'block' : 'none' }} className="pt-10">
        <SDLCSimulator />
      </div>

      {/* Dashboard Simulator Page (stays mounted) */}
      <div style={{ display: page === 'dashboard' ? 'block' : 'none' }} className="pt-10">
        <div className="min-h-screen bg-dashboard-bg text-dashboard-text">
          {/* Header */}
          <header className="bg-dashboard-surface border-b border-gray-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-dashboard-text">
                Dashboard Simulator
              </h1>
            </div>
          </header>

          {/* Main Content - 2x2 Grid */}
          <main className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-160px)]">
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
      </div>
    </>
  )
}

export default App
