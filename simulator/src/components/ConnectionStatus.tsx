import { useState, useRef, useEffect } from 'react'
import { useConnectionStatus } from '../hooks/useConnectionStatus'

interface ConnectionStatusProps {
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void
}

function ConnectionStatus({ onToast }: ConnectionStatusProps) {
  const { status, apiUrl, version, error, setApiUrl, testConnection, retry } =
    useConnectionStatus(onToast)

  // Settings panel state
  const [showSettings, setShowSettings] = useState(false)
  const [urlInput, setUrlInput] = useState(apiUrl)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false)

  // Ref for click outside handling
  const panelRef = useRef<HTMLDivElement>(null)

  // Update URL input when apiUrl changes
  useEffect(() => {
    setUrlInput(apiUrl)
  }, [apiUrl])

  // Close settings panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])

  // Get status dot color
  const getStatusDotColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'disconnected':
        return 'bg-red-500'
      case 'checking':
        return 'bg-yellow-500 animate-pulse'
    }
  }

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'checking':
        return 'Checking...'
    }
  }

  // Get status text color
  const getStatusTextColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-400'
      case 'disconnected':
        return 'text-red-400'
      case 'checking':
        return 'text-yellow-400'
    }
  }

  // Handle test connection
  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    const success = await testConnection()
    setTestResult(success ? 'success' : 'error')
    setIsTesting(false)
  }

  // Handle save URL
  const handleSaveUrl = () => {
    setApiUrl(urlInput)
    setTestResult(null)
    if (onToast) {
      onToast('API URL updated', 'info')
    }
  }

  // Handle retry
  const handleRetry = () => {
    retry()
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Connection Status Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-700 transition-colors"
        aria-label="Connection status"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor()}`} />
        <span className={`text-sm ${getStatusTextColor()}`}>{getStatusText()}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && !showSettings && (
        <div className="absolute right-0 top-full mt-1 z-50 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-xs whitespace-nowrap">
          <div className="text-dashboard-muted">
            API URL: <span className="text-dashboard-text">{apiUrl}</span>
          </div>
          {status === 'connected' && version && (
            <div className="text-dashboard-muted mt-1">
              Version: <span className="text-dashboard-text">{version}</span>
            </div>
          )}
          {status === 'disconnected' && error && (
            <div className="text-red-400 mt-1">Error: {error}</div>
          )}
          <div className="text-dashboard-muted mt-1 text-[10px]">Click to configure</div>
        </div>
      )}

      {/* Retry Button (shown when disconnected) */}
      {status === 'disconnected' && !showSettings && (
        <button
          onClick={handleRetry}
          className="ml-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
        >
          Retry
        </button>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-dashboard-surface border border-gray-600 rounded-lg shadow-xl">
          {/* Panel Header */}
          <div className="px-4 py-3 border-b border-gray-600">
            <h3 className="text-sm font-semibold text-dashboard-text">Connection Settings</h3>
          </div>

          {/* Panel Content */}
          <div className="p-4 space-y-4">
            {/* Current Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-dashboard-muted">Status:</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusDotColor()}`} />
                <span className={`text-sm ${getStatusTextColor()}`}>{getStatusText()}</span>
              </div>
            </div>

            {/* Version (if connected) */}
            {status === 'connected' && version && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-dashboard-muted">Version:</span>
                <span className="text-sm text-dashboard-text">{version}</span>
              </div>
            )}

            {/* Error (if disconnected) */}
            {status === 'disconnected' && error && (
              <div className="p-2 bg-red-900/30 border border-red-600/50 rounded text-xs text-red-400">
                {error}
              </div>
            )}

            {/* API URL Input */}
            <div>
              <label className="block text-sm text-dashboard-muted mb-1">API Base URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8002/api"
                className="w-full px-3 py-2 bg-dashboard-bg border border-gray-600 rounded text-sm text-dashboard-text placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-dashboard-muted mt-1">
                Default: http://localhost:8002/api
              </p>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-2 rounded text-xs ${
                  testResult === 'success'
                    ? 'bg-green-900/30 border border-green-600/50 text-green-400'
                    : 'bg-red-900/30 border border-red-600/50 text-red-400'
                }`}
              >
                {testResult === 'success' ? 'Connection successful!' : 'Connection failed'}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 rounded text-sm text-white transition-colors"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={handleSaveUrl}
                disabled={urlInput === apiUrl}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm text-white transition-colors"
              >
                Save URL
              </button>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="px-4 py-2 border-t border-gray-600 bg-dashboard-bg/50 rounded-b-lg">
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-dashboard-muted hover:text-dashboard-text"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionStatus
