import { useState } from 'react'
import { api } from '../../services/api'
import type { Company, Agent, SDLCEvent } from '../../types'
import { getSDLCRole } from '../../types'
import { SIMPLE_SHOP_WORKFLOW } from '../../data/simple-shop-workflow'

// Flatten workflow steps × topics into a template list
const TOPIC_TEMPLATES = SIMPLE_SHOP_WORKFLOW.steps.flatMap((step, si) =>
  step.topics.map((topic, ti) => ({
    key: `${si}-${ti}`,
    from: step.from,
    to: step.to,
    action: step.action,
    eventType: step.eventType,
    topicTitle: topic.title,
    topicMarkdown: topic.markdown,
    label: `${getSDLCRole(step.from)?.icon || ''} ${step.from} → ${getSDLCRole(step.to)?.icon || ''} ${step.to}: ${topic.title}`,
  }))
)

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
  const [actionText, setActionText] = useState('')
  const [topicTitle, setTopicTitle] = useState('')
  const [topicMarkdown, setTopicMarkdown] = useState('')
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number>(-1)
  const [sending, setSending] = useState(false)

  const handleTemplateChange = (idx: number) => {
    setSelectedTemplateIdx(idx)
    if (idx < 0) return

    const tpl = TOPIC_TEMPLATES[idx]
    if (!tpl) return

    // Auto-fill source/target by matching role to agents
    const srcAgent = agents.find((a) => a.role === tpl.from)
    const tgtAgent = agents.find((a) => a.role === tpl.to)
    if (srcAgent) setSourceId(srcAgent.id)
    if (tgtAgent) setTargetId(tgtAgent.id)

    setActionText(tpl.action)
    setTopicTitle(tpl.topicTitle)
    setTopicMarkdown(tpl.topicMarkdown)
  }

  const handleSend = async () => {
    if (!company || !sourceId || !topicTitle.trim()) return

    const sourceAgent = agents.find((a) => a.id === sourceId)
    const targetAgent = agents.find((a) => a.id === targetId)
    if (!sourceAgent) return

    setSending(true)

    const isInterAgent = targetAgent && targetAgent.id !== sourceAgent.id
    const eventType = isInterAgent ? ('WORK_REQUEST' as const) : ('WORKING' as const)
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
      action: actionText.trim() || topicTitle.trim(),
      eventType,
      topicTitle: topicTitle.trim(),
      description: topicMarkdown.trim() || undefined,
      status: 'pending',
    }
    onEventSent(sdlcEvent)

    const response = await api.sendEvent({
      company_id: company.id,
      agent_id: sourceAgent.id,
      event_type: eventType,
      payload: { task: topicTitle.trim(), description: topicMarkdown.trim() || undefined },
      ...(isInterAgent && targetAgent ? { to_agent: targetAgent.id } : {}),
    })

    if (response.data) {
      onEventUpdate(eventId, { status: 'success' })
    } else {
      onEventUpdate(eventId, { status: 'error', error: response.error })
    }

    setActionText('')
    setTopicTitle('')
    setTopicMarkdown('')
    setSelectedTemplateIdx(-1)
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const inputStyle = { background: 'rgba(20,20,50,0.9)', border: '1px solid rgba(0,255,255,0.4)' }
  const inputClasses = 'w-full rounded-lg text-xs text-[#e0e8ff] h-10 px-3 outline-none focus:ring-1 focus:ring-cyan-400/40 placeholder-[#a0aac8]/50'

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a0aac8]">
        Manual Event Trigger
      </h2>
      <div
        className="rounded-xl p-4 border space-y-3"
        style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}
      >
        {/* Source / Target Agent row */}
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
                style={inputStyle}
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
                style={inputStyle}
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

        {/* Predefined Template */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#a0aac8] uppercase tracking-tighter font-bold">
            Predefined Template (optional)
          </label>
          <div className="relative">
            <select
              value={selectedTemplateIdx}
              onChange={(e) => handleTemplateChange(Number(e.target.value))}
              disabled={agents.length === 0}
              className="w-full appearance-none rounded-lg text-xs text-[#e0e8ff] h-10 pl-3 pr-8 outline-none focus:ring-1 focus:ring-cyan-400/40"
              style={inputStyle}
            >
              <option value={-1}>— Custom (no template) —</option>
              {TOPIC_TEMPLATES.map((tpl, idx) => (
                <option key={tpl.key} value={idx}>
                  {tpl.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400/60 text-sm pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Action text */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#a0aac8] uppercase tracking-tighter font-bold">
            Action
          </label>
          <input
            type="text"
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. chia sẻ kết quả nghiên cứu với"
            disabled={!sourceId}
            className={inputClasses}
            style={inputStyle}
          />
        </div>

        {/* Topic Title */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#a0aac8] uppercase tracking-tighter font-bold">
            Topic Title
          </label>
          <input
            type="text"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. User Persona Analysis"
            disabled={!sourceId}
            className={inputClasses}
            style={inputStyle}
          />
        </div>

        {/* Topic Markdown */}
        <div className="space-y-1">
          <label className="text-[10px] text-[#a0aac8] uppercase tracking-tighter font-bold">
            Topic Markdown
          </label>
          <textarea
            value={topicMarkdown}
            onChange={(e) => setTopicMarkdown(e.target.value)}
            onKeyDown={(e) => {
              // Ctrl/Cmd+Enter sends, plain Enter inserts newline
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Full markdown content (optional)..."
            disabled={!sourceId}
            rows={6}
            className="w-full rounded-lg text-xs text-[#e0e8ff] px-3 py-2 outline-none focus:ring-1 focus:ring-cyan-400/40 placeholder-[#a0aac8]/50 resize-y"
            style={{ ...inputStyle, fontFamily: 'ui-monospace, SFMono-Regular, monospace', minHeight: '80px' }}
          />
        </div>

        {/* Send button */}
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={!sourceId || !topicTitle.trim() || sending}
            aria-label="Send event"
            className="px-4 py-2 rounded-lg flex items-center gap-2 h-10 disabled:opacity-50 transition-colors text-cyan-400 hover:text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/10 text-xs font-semibold"
            style={{ background: 'rgba(0,255,255,0.1)' }}
          >
            <span className="material-symbols-outlined text-base">send</span>
            Send Event
          </button>
        </div>
      </div>
    </section>
  )
}
