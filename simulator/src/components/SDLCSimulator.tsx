import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { useWorkflowRunner } from '../hooks/useWorkflowRunner'
import { SIMPLE_SHOP_WORKFLOW } from '../data/simple-shop-workflow'
import type { Company, Agent, SDLCEvent } from '../types'
import WorkflowSection from './sdlc/WorkflowSection'
import CompanySection from './sdlc/CompanySection'
import AgentFleetSection from './sdlc/AgentFleetSection'
import ManualEventSection from './sdlc/ManualEventSection'
import EventHistorySection from './sdlc/EventHistorySection'

export default function SDLCSimulator() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [eventHistory, setEventHistory] = useState<SDLCEvent[]>([])

  const handleEventSent = useCallback((event: SDLCEvent) => {
    setEventHistory((prev) => [event, ...prev].slice(0, 100))
  }, [])

  const handleEventUpdate = useCallback((eventId: string, updates: Partial<SDLCEvent>) => {
    setEventHistory((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    )
  }, [])

  const handleAgentsChange = useCallback((newAgents: Agent[]) => {
    setAgents(newAgents)
  }, [])

  const runner = useWorkflowRunner({
    company: selectedCompany,
    agents,
    workflow: SIMPLE_SHOP_WORKFLOW,
    onEventSent: handleEventSent,
    onEventUpdate: handleEventUpdate,
    onAgentsChange: handleAgentsChange,
  })

  // Load companies on mount
  useEffect(() => {
    loadCompanies()
  }, [])

  // Load agents when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadAgents(selectedCompany.id)
    } else {
      setAgents([])
    }
  }, [selectedCompany])

  const loadCompanies = async () => {
    try {
      const response = await api.getCompanies()
      if (response.data?.companies) {
        setCompanies(response.data.companies)
      }
    } catch {
      // API unreachable — companies list stays empty
    }
  }

  const loadAgents = async (companyId: string) => {
    try {
      const response = await api.getAgents(companyId)
      if (response.data) {
        setAgents(response.data)
      }
    } catch {
      // API unreachable — agents list stays empty
    }
  }

  const handleCreateCompany = async (name: string) => {
    try {
      const response = await api.createCompany(name)
      if (response.data) {
        await loadCompanies()
        setSelectedCompany(response.data)
      }
    } catch {
      // Silently fail — user will see company not appear
    }
  }

  const handleDeleteCompany = async (id: string) => {
    try {
      await api.deleteCompany(id)
      if (selectedCompany?.id === id) {
        if (runner.status === 'running' || runner.status === 'paused') {
          runner.stop()
        }
        setSelectedCompany(null)
      }
      await loadCompanies()
    } catch {
      // Silently fail
    }
  }

  const handleSelectCompany = (company: Company) => {
    // Stop running workflow when switching company (F2: race condition guard)
    if (runner.status === 'running' || runner.status === 'paused') {
      runner.stop()
    }
    setSelectedCompany(company)
  }

  const handleClearHistory = useCallback(() => {
    setEventHistory([])
  }, [])

  const handleBottomButton = () => {
    switch (runner.status) {
      case 'idle':
      case 'completed':
      case 'error':
        runner.start()
        break
      case 'running':
        runner.pause()
        break
      case 'paused':
        runner.resume()
        break
    }
  }

  const bottomButtonConfig = {
    idle: { label: 'Execute Workflow', icon: 'bolt', classes: 'bg-[#135bec] shadow-[#135bec]/30' },
    running: { label: 'Pause Workflow', icon: 'pause', classes: 'bg-amber-500 shadow-amber-500/30' },
    paused: { label: 'Resume Workflow', icon: 'play_arrow', classes: 'bg-emerald-500 shadow-emerald-500/30' },
    completed: { label: 'Run Again', icon: 'replay', classes: 'bg-[#135bec] shadow-[#135bec]/30' },
    error: { label: 'Retry Workflow', icon: 'replay', classes: 'bg-red-500 shadow-red-500/30' },
  }

  const btn = bottomButtonConfig[runner.status]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0d0d2a] text-[#e0e8ff] font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-cyan-400/20" style={{ background: 'linear-gradient(90deg, rgba(20,20,50,0.95) 0%, rgba(40,40,80,0.9) 50%, rgba(20,20,50,0.95) 100%)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,255,255,0.15)', border: '1px solid rgba(0,255,255,0.3)' }}>
              <span className="material-symbols-outlined text-cyan-400 text-xl">account_tree</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-cyan-300">SDLC Simulator</h1>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] text-cyan-400/60 uppercase tracking-wider self-center">
              {runner.status !== 'idle' ? `Step ${runner.currentStep}/${runner.totalSteps}` : ''}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 pb-32">
        <WorkflowSection
          workflowStatus={runner.status}
          currentStep={runner.currentStep}
          totalSteps={runner.totalSteps}
          currentAction={runner.currentAction}
          error={runner.error}
        />

        <CompanySection
          companies={companies}
          selectedCompany={selectedCompany}
          totalAgents={agents.length}
          onSelect={handleSelectCompany}
          onCreate={handleCreateCompany}
          onDelete={handleDeleteCompany}
        />

        <AgentFleetSection
          company={selectedCompany}
          agents={agents}
          onAgentsChange={handleAgentsChange}
        />

        <ManualEventSection
          company={selectedCompany}
          agents={agents}
          onEventSent={handleEventSent}
          onEventUpdate={handleEventUpdate}
        />

        <EventHistorySection events={eventHistory} onClear={handleClearHistory} />
      </main>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a] to-transparent">
        <button
          onClick={handleBottomButton}
          disabled={!selectedCompany && runner.status === 'idle'}
          aria-label={btn.label}
          className={`w-full text-white py-4 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 ${btn.classes}`}
        >
          <span className="material-symbols-outlined">{btn.icon}</span>
          {btn.label}
        </button>
      </div>
    </div>
  )
}
