import { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import mermaid from 'mermaid'
import type { SDLCEvent } from '../../types'

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1a1a3a',
    primaryTextColor: '#00ffff',
    lineColor: '#00ffff',
    secondaryColor: '#2a2a5a',
  },
})

// Configure marked — pass sanitized HTML through (XSS handled in renderMarkdown)
marked.use({
  renderer: {
    html(token) {
      return typeof token === 'string' ? token : token.text
    },
  },
})

function renderMarkdown(md: string): string {
  if (!md) return ''
  // Strip dangerous patterns, allow safe HTML
  const sanitized = md
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
  return marked.parse(sanitized, { breaks: true, async: false }) as string
}

interface EventHistorySectionProps {
  events: SDLCEvent[]
  onClear: () => void
}

const eventIconMap: Record<string, { icon: string; color: string }> = {
  WORK_REQUEST: { icon: 'code', color: 'bg-blue-500/10 text-blue-400' },
  WORKING: { icon: 'engineering', color: 'bg-amber-500/10 text-amber-400' },
  REVIEW_REQUEST: { icon: 'rate_review', color: 'bg-purple-500/10 text-purple-400' },
  FEEDBACK: { icon: 'feedback', color: 'bg-teal-500/10 text-teal-400' },
  MESSAGE_SEND: { icon: 'chat', color: 'bg-cyan-500/10 text-cyan-400' },
  TASK_COMPLETE: { icon: 'check_circle', color: 'bg-emerald-500/10 text-emerald-400' },
  ERROR: { icon: 'error', color: 'bg-red-500/10 text-red-400' },
  THINKING: { icon: 'psychology', color: 'bg-purple-500/10 text-purple-400' },
  EXECUTING: { icon: 'play_arrow', color: 'bg-cyan-500/10 text-cyan-400' },
  IDLE: { icon: 'pause_circle', color: 'bg-[#a0aac8]/10 text-[#a0aac8]' },
  CODING: { icon: 'terminal', color: 'bg-emerald-500/10 text-emerald-400' },
  DISCUSSING: { icon: 'forum', color: 'bg-amber-500/10 text-amber-400' },
  REVIEWING: { icon: 'fact_check', color: 'bg-teal-500/10 text-teal-400' },
  BREAK: { icon: 'coffee', color: 'bg-gray-500/10 text-gray-400' },
}

function getEventIcon(eventType: string, status: string) {
  if (status === 'error') return eventIconMap.ERROR
  return eventIconMap[eventType] || { icon: 'circle', color: 'bg-[#a0aac8]/10 text-[#a0aac8]' }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour12: false })
}

export default function EventHistorySection({ events, onClear }: EventHistorySectionProps) {
  const [selectedEvent, setSelectedEvent] = useState<SDLCEvent | null>(null)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a0aac8]">
          Event History
        </h2>
        <div className="flex items-center gap-2 text-[10px] text-[#a0aac8]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Logs
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border flex flex-col" style={{ background: 'rgba(30,30,60,0.5)', borderColor: 'rgba(100,100,150,0.2)' }}>
        <div className="max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,255,0.3) rgba(0,0,0,0.2)' }}>
          {events.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#a0aac8]">
              No events yet. Start a workflow or send a manual event.
            </div>
          ) : (
            <ul className="divide-y divide-[#646496]/20">
              {events.map((event) => {
                const iconInfo = getEventIcon(event.eventType, event.status)
                return (
                  <li
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-4 flex items-start gap-3 hover:bg-cyan-400/5 transition-colors cursor-pointer"
                  >
                    <div
                      className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconInfo.color}`}
                    >
                      <span className="material-symbols-outlined text-sm">{iconInfo.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-[#e0e8ff]">
                          {event.fromRole} → {event.toRole}
                        </span>
                        <span className="text-[10px] font-medium text-[#a0aac8]">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-300/60 truncate">
                        {event.fromAgent} {event.action} {event.toAgent}
                        {event.topicTitle && ` — ${event.topicTitle}`}
                      </p>
                      <div className="mt-1.5 flex gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-[#a0aac8] uppercase tracking-tighter" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          {event.eventType}
                        </span>
                        {event.description && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 uppercase tracking-tighter">
                            HAS CONTENT
                          </span>
                        )}
                        {event.status === 'error' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 uppercase tracking-tighter">
                            FAILED
                          </span>
                        )}
                        {event.status === 'pending' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase tracking-tighter animate-pulse">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        {events.length > 0 && (
          <div className="p-3 border-t border-[#646496]/20 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <button
              onClick={onClear}
              className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors"
            >
              Clear History
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  )
}

function EventDetailModal({ event, onClose }: { event: SDLCEvent; onClose: () => void }) {
  const markdownRef = useRef<HTMLDivElement>(null)
  const statusText = event.status === 'success' ? '✅ Hoàn thành' : event.status === 'error' ? '❌ Lỗi' : '⏳ Đang xử lý'

  // Post-process: find mermaid code blocks, replace with div.mermaid, and render
  useEffect(() => {
    if (!markdownRef.current) return
    markdownRef.current.querySelectorAll('pre code').forEach((codeEl) => {
      if (codeEl.className && codeEl.className.includes('language-mermaid')) {
        const pre = codeEl.parentElement
        if (!pre) return
        const div = document.createElement('div')
        div.className = 'mermaid'
        div.textContent = codeEl.textContent
        pre.replaceWith(div)
      }
    })
    const mermaidEls = markdownRef.current.querySelectorAll('.mermaid')
    if (mermaidEls.length > 0) {
      mermaid.run({ nodes: mermaidEls as NodeListOf<HTMLElement> }).catch(() => {})
    }
  }, [event.description])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(20,20,55,0.98) 0%, rgba(30,30,70,0.98) 100%)', borderColor: 'rgba(0,255,255,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/20">
          <h3 className="text-sm font-bold text-cyan-300 truncate pr-4">
            {event.topicTitle || event.eventType}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a0aac8] hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,255,0.3) rgba(0,0,0,0.2)' }}>
          {/* Participants */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto text-lg" style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)' }}>
                👤
              </div>
              <div className="mt-1 text-xs font-bold text-[#e0e8ff]">{event.fromAgent}</div>
              <div className="text-[10px] text-[#a0aac8]">{event.fromRole}</div>
            </div>
            <span className="text-cyan-400 text-xl">➜</span>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto text-lg" style={{ background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)' }}>
                👤
              </div>
              <div className="mt-1 text-xs font-bold text-[#e0e8ff]">{event.toAgent}</div>
              <div className="text-[10px] text-[#a0aac8]">{event.toRole}</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="text-[9px] text-[#a0aac8] uppercase tracking-wider mb-0.5">Thời gian</div>
              <div className="text-xs text-[#e0e8ff]">🕐 {formatTime(event.timestamp)}</div>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="text-[9px] text-[#a0aac8] uppercase tracking-wider mb-0.5">Trạng thái</div>
              <div className="text-xs text-[#e0e8ff]">{statusText}</div>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="text-[9px] text-[#a0aac8] uppercase tracking-wider mb-0.5">Hành động</div>
              <div className="text-xs text-[#e0e8ff]">{event.action || event.eventType}</div>
            </div>
            <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="text-[9px] text-[#a0aac8] uppercase tracking-wider mb-0.5">Chủ đề</div>
              <div className="text-xs text-amber-400">📌 {event.topicTitle || event.eventType}</div>
            </div>
          </div>

          {/* Error */}
          {event.error && (
            <div className="rounded-lg p-3 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <div className="text-[9px] text-red-400 uppercase tracking-wider mb-1 font-bold">Error</div>
              <div className="text-xs text-red-300">{event.error}</div>
            </div>
          )}

          {/* Markdown Content */}
          {event.description && (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(0,255,255,0.2)' }}>
              <div className="flex items-center gap-2 px-3 py-2 border-b text-xs font-bold text-cyan-300" style={{ background: 'rgba(0,255,255,0.05)', borderColor: 'rgba(0,255,255,0.2)' }}>
                <span>📄</span>
                <span>Nội dung chi tiết / Output</span>
              </div>
              <div
                ref={markdownRef}
                className="p-4 prose prose-invert prose-sm max-w-none
                  prose-headings:text-cyan-300 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                  prose-p:text-[#c8d0e8] prose-p:text-xs prose-p:leading-relaxed
                  prose-li:text-[#c8d0e8] prose-li:text-xs
                  prose-strong:text-[#e0e8ff]
                  prose-code:text-cyan-300 prose-code:bg-black/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px]
                  prose-pre:bg-black/40 prose-pre:border prose-pre:border-cyan-400/20 prose-pre:rounded-lg prose-pre:text-[11px]
                  prose-table:text-xs
                  prose-th:text-cyan-300 prose-th:border-cyan-400/20 prose-th:px-2 prose-th:py-1
                  prose-td:text-[#c8d0e8] prose-td:border-cyan-400/20 prose-td:px-2 prose-td:py-1
                  prose-blockquote:border-cyan-400/40 prose-blockquote:text-cyan-300/70
                  prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                  prose-hr:border-cyan-400/20
                  [&_pre.mermaid]:bg-black/40 [&_pre.mermaid]:border [&_pre.mermaid]:border-cyan-400/20 [&_pre.mermaid]:rounded-lg [&_pre.mermaid]:p-4 [&_pre.mermaid]:text-center
                  [&_pre.mermaid_svg]:max-w-full [&_pre.mermaid_svg]:h-auto"
                style={{ background: 'rgba(0,0,0,0.2)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
