import type { SDLCEvent } from '../../types'

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
                    className="p-4 flex items-start gap-3 hover:bg-cyan-400/5 transition-colors"
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
    </section>
  )
}
