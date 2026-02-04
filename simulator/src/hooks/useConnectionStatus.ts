import { useState, useEffect, useRef, useCallback } from 'react'
import { api, setApiBaseUrl, getApiBaseUrl } from '../services/api'

// Health check response type
export interface HealthResponse {
  status: string
  version?: string
  database?: string
}

// Connection state
export interface ConnectionState {
  status: 'connected' | 'disconnected' | 'checking'
  apiUrl: string
  version?: string
  error?: string
  lastChecked: Date | null
}

// Hook return type
export interface UseConnectionStatusReturn extends ConnectionState {
  setApiUrl: (url: string) => void
  testConnection: () => Promise<boolean>
  retry: () => void
}

// Toast callback type for notifications
type ToastCallback = (message: string, type: 'success' | 'error' | 'info') => void

export function useConnectionStatus(onToast?: ToastCallback): UseConnectionStatusReturn {
  const [state, setState] = useState<ConnectionState>({
    status: 'checking',
    apiUrl: getApiBaseUrl(),
    lastChecked: null,
  })

  // Track previous status to detect changes
  const prevStatusRef = useRef<'connected' | 'disconnected' | 'checking'>('checking')
  const isFirstCheck = useRef(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check connection function
  const checkConnection = useCallback(async () => {
    try {
      const response = await api.healthCheck()

      if (response.data) {
        const health = response.data as HealthResponse
        const newStatus = 'connected'

        // Show toast on status change (skip first check)
        if (!isFirstCheck.current && prevStatusRef.current === 'disconnected' && onToast) {
          onToast('Dashboard connected', 'success')
        }

        prevStatusRef.current = newStatus
        isFirstCheck.current = false

        setState((prev) => ({
          ...prev,
          status: newStatus,
          version: health.version,
          error: undefined,
          lastChecked: new Date(),
        }))

        return true
      } else {
        throw new Error(response.error || 'Health check failed')
      }
    } catch (err) {
      const newStatus = 'disconnected'
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'

      // Show toast on status change (skip first check)
      if (!isFirstCheck.current && prevStatusRef.current === 'connected' && onToast) {
        onToast('Dashboard disconnected', 'error')
      }

      prevStatusRef.current = newStatus
      isFirstCheck.current = false

      setState((prev) => ({
        ...prev,
        status: newStatus,
        error: errorMessage,
        lastChecked: new Date(),
      }))

      return false
    }
  }, [onToast])

  // Set up periodic polling
  useEffect(() => {
    // Initial check
    checkConnection()

    // Set up interval for polling every 5 seconds
    intervalRef.current = setInterval(checkConnection, 5000)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkConnection])

  // Update API URL and re-check
  const setApiUrl = useCallback((url: string) => {
    setApiBaseUrl(url)
    setState((prev) => ({
      ...prev,
      apiUrl: url,
      status: 'checking',
    }))
    // Reset first check flag to show toast on reconnection
    isFirstCheck.current = false
    // Immediate check with new URL
    setTimeout(checkConnection, 100)
  }, [checkConnection])

  // Manual retry
  const retry = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'checking' }))
    checkConnection()
  }, [checkConnection])

  // Test connection (for settings panel)
  const testConnection = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, status: 'checking' }))
    return checkConnection()
  }, [checkConnection])

  return {
    ...state,
    setApiUrl,
    testConnection,
    retry,
  }
}
