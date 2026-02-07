import { useState } from 'react'
import { api } from '../../services/api'
import type { Company, Agent, SDLCEvent } from '../../types'
import { getSDLCRole } from '../../types'

interface ManualEventSectionProps {
  company: Company | null
  agents: Agent[]
  onEventSent: (event: SDLCEvent) => void
  onEventUpdate: (eventId: string, updates: Partial<SDLCEvent>) => void
}

export default function ManualEventSection({
  company,
  agents,
  onEventSent,
  onEventUpdate,
}: ManualEventSectionProps) {
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!company || !sourceId || !message.trim()) return

    const sourceAgent = agents.find((a) => a.id === sourceId)
    const targetAgent = agents.find((a) => a.id === targetId)
    if (!sourceAgent) return

    setSending(true)

    const isInterAgent = targetAgent && targetAgent.id !== sourceAgent.id
    const eventType = isInterAgent ? 'WORK_REQUEST' as const : 'WORKING' as const
    const sourceRole = getSDLCRole(sourceAgent.role)
    const targetRole = targetAgent ? getSDLCRole(targetAgent.role) : sourceRole

    const eventId = `manual-${Date.now()}`
    const sdlcEvent: SDLCEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      fromAgent: sourceAgent.name,
      fromRole: sourceRole?.label || sourceAgent.role,
      toAgent: targetAgent?.name || sourceAgent.name,
      toRole: targetRole?.label || sourceAgent.role,
      action: message.trim(),
      eventType,
      topicTitle: message.trim(),
      status: 'pending',
    }
    onEventSent(sdlcEvent)

    const response = await api.sendEvent({
      company_id: company.id,
      agent_id: sourceAgent.id,
      event_type: eventType,
      payload: { task: message.trim() },
      ...(isInterAgent && targetAgent ? { to_agent: targetAgent.id } : {}),
    })

    if (response.data) {
      onEventUpdate(eventId, { status: 'success' })
    } else {
      onEventUpdate(eventId, { status: 'error', error: response.error })
    }

    setMessage('')
    setSending(false)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a0aac8]">
        Manual Event Trigger
      </h2>
      <div className="rounded-xl p-4 border space-y-4" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-[#a0aac8] uppercase tracking-tighter font-bold">
              Source Agent
            </label>
            <div className="relative">
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                disabled={agents.length === 0}
                className="w-full appearance-none rounded-lg text-xs text-[#e0e8ff] h-10 pl-3 pr-8 outline-none focus:ring-1 focus:ring-cyan-400/40"
                style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}
              >
                <option value="">Select agent...</option>
                {agents.map((a) => {
                  const r = getSDLCRole(a.role)
                  return (
                    <option key={a.id} value={a.id}>
                      {r?.icon || ''} {a.name} ({r?.label || a.role})
                    </option>
                  )
                })}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400/60 text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[#a0aac8] uppercase tracking-tighter font-bold">
              Target Agent
            </label>
            <div className="relative">
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                disabled={agents.length === 0}
                className="w-full appearance-none rounded-lg text-xs text-[#e0e8ff] h-10 pl-3 pr-8 outline-none focus:ring-1 focus:ring-cyan-400/40"
                style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}
              >
                <option value="">Select agent...</option>
                {agents.map((a) => {
                  const r = getSDLCRole(a.role)
                  return (
                    <option key={a.id} value={a.id}>
                      {r?.icon || ''} {a.name} ({r?.label || a.role})
                    </option>
                  )
                })}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400/60 text-sm pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type event action or message..."
            disabled={!sourceId}
            className="flex-1 rounded-lg text-xs text-[#e0e8ff] h-11 px-4 outline-none focus:ring-1 focus:ring-cyan-400/40 placeholder-[#a0aac8]/50"
            style={{ background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }}
          />
          <button
            onClick={handleSend}
            disabled={!sourceId || !message.trim() || sending}
            aria-label="Send event"
            className="p-2 rounded-lg flex items-center justify-center w-12 h-11 disabled:opacity-50 transition-colors text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/10"
            style={{ background: 'rgba(0,255,255,0.1)' }}
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </section>
  )
}
