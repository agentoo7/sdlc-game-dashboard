import { useState } from 'react'
import type { SentEvent } from '../types'
import { getRoleColor } from '../types'

interface EventHistoryProps {
  events: SentEvent[]
  onClear: () => void
  onRetry: (event: SentEvent) => void
}

function EventHistory({ events, onClear, onRetry }: EventHistoryProps) {
  // Expanded event ID
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Clear confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Get status indicator
  const getStatusIndicator = (status: SentEvent['status']): JSX.Element => {
    switch (status) {
      case 'pending':
        return <span className="text-yellow-400 animate-pulse">⏳</span>
      case 'success':
        return <span className="text-green-400">✓</span>
      case 'error':
        return <span className="text-red-400">✗</span>
    }
  }

  // Get status text
  const getStatusText = (event: SentEvent): JSX.Element => {
    switch (event.status) {
      case 'pending':
        return <span className="text-yellow-400 text-xs">Sending...</span>
      case 'success':
        const eventId = (event.response as { event_id?: string })?.event_id
        return (
          <span className="text-green-400 text-xs">
            Sent{eventId ? ` (${eventId.slice(0, 8)}...)` : ''}
          </span>
        )
      case 'error':
        return <span className="text-red-400 text-xs">Failed</span>
    }
  }

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, eventId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(eventId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(eventId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Handle clear with confirmation
  const handleClearClick = () => {
    setShowClearConfirm(true)
  }

  const handleClearConfirm = () => {
    onClear()
    setShowClearConfirm(false)
  }

  const handleClearCancel = () => {
    setShowClearConfirm(false)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-gray-600 bg-dashboard-bg/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-dashboard-text">Event History</h2>
            <p className="text-sm text-dashboard-muted">
              {events.length > 0
                ? `${events.length} event${events.length === 1 ? '' : 's'} sent`
                : 'No events sent yet'}
            </p>
          </div>
          {events.length > 0 && (
            <button
              onClick={handleClearClick}
              className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-900/20 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Clear Confirmation Dialog */}
        {showClearConfirm && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg">
            <p className="text-dashboard-text text-sm mb-3">
              Clear all {events.length} events from history?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearConfirm}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Yes, Clear All
              </button>
              <button
                onClick={handleClearCancel}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dashboard-muted">
            <div className="text-center">
              <div className="text-4xl mb-2">📋</div>
              <p>No events yet</p>
              <p className="text-sm">Send an event using Event Sender</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const isExpanded = expandedId === event.id
              const isCopied = copiedId === event.id

              return (
                <div
                  key={event.id}
                  className={`rounded-lg border transition-all ${
                    event.status === 'error'
                      ? 'bg-red-900/20 border-red-600/50'
                      : event.status === 'pending'
                      ? 'bg-yellow-900/20 border-yellow-600/50'
                      : 'bg-dashboard-bg border-gray-600'
                  }`}
                >
                  {/* Clickable Header Row */}
                  <button
                    onClick={() => toggleExpand(event.id)}
                    className="w-full p-3 text-left hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getStatusIndicator(event.status)}
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: getRoleColor(event.agent_role) }}
                        >
                          {event.agent_id}
                        </span>
                        <span className="text-dashboard-text text-sm font-medium">
                          {event.event_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusText(event)}
                        <span className="text-dashboard-muted text-xs">
                          {formatTime(event.timestamp)}
                        </span>
                        <span className="text-dashboard-muted text-xs">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Agent Info */}
                    <div className="text-xs text-dashboard-muted">
                      {event.agent_name} • {event.company_name}
                    </div>

                    {/* Error Message Preview */}
                    {event.status === 'error' && event.error && !isExpanded && (
                      <div className="mt-1 text-xs text-red-400 truncate">
                        Error: {event.error}
                      </div>
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-600/50">
                      {/* Actions */}
                      <div className="flex gap-2 my-3">
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(event.payload, null, 2), event.id)
                          }
                          className="px-3 py-1 bg-dashboard-surface hover:bg-gray-700 border border-gray-600 rounded text-xs text-dashboard-text transition-colors"
                        >
                          {isCopied ? '✓ Copied!' : '📋 Copy Payload'}
                        </button>
                        {event.status === 'error' && (
                          <button
                            onClick={() => onRetry(event)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                          >
                            🔄 Retry
                          </button>
                        )}
                      </div>

                      {/* Request Payload */}
                      <div className="mb-3">
                        <p className="text-xs text-dashboard-muted mb-1 font-medium">
                          Request Payload:
                        </p>
                        <pre className="text-xs text-dashboard-text font-mono bg-dashboard-bg p-2 rounded border border-gray-600 overflow-x-auto max-h-32 overflow-y-auto">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      </div>

                      {/* Response / Error */}
                      {event.status === 'success' && event.response !== undefined && (
                        <div>
                          <p className="text-xs text-dashboard-muted mb-1 font-medium">
                            API Response:
                          </p>
                          <pre className="text-xs text-green-400 font-mono bg-dashboard-bg p-2 rounded border border-green-600/30 overflow-x-auto max-h-32 overflow-y-auto">
                            {JSON.stringify(event.response, null, 2)}
                          </pre>
                        </div>
                      )}

                      {event.status === 'error' && event.error && (
                        <div>
                          <p className="text-xs text-dashboard-muted mb-1 font-medium">
                            Error Details:
                          </p>
                          <pre className="text-xs text-red-400 font-mono bg-dashboard-bg p-2 rounded border border-red-600/30 overflow-x-auto">
                            {String(event.error)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventHistory
