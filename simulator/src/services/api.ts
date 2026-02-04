import type { Company, Agent, EventPayload, ApiResponse } from '../types'

// Default API URL from env or fallback
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api'

// Get stored URL or default
const getStoredApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dashboard_api_url') || DEFAULT_API_URL
  }
  return DEFAULT_API_URL
}

// Current API URL (mutable)
let currentApiUrl = getStoredApiUrl()

// Export functions to get/set API URL
export const getApiBaseUrl = (): string => currentApiUrl

export const setApiBaseUrl = (url: string): void => {
  // Ensure URL ends with /api
  const normalizedUrl = url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`
  currentApiUrl = normalizedUrl
  if (typeof window !== 'undefined') {
    localStorage.setItem('dashboard_api_url', normalizedUrl)
  }
}

class ApiService {
  private get baseUrl(): string {
    return currentApiUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle array of validation errors from API
        let errorMessage = 'Request failed'
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Format validation errors: "field: message"
            errorMessage = data.detail
              .map((err: { loc?: string[]; msg?: string }) => {
                const field = err.loc?.slice(-1)[0] || 'unknown'
                return `${field}: ${err.msg || 'invalid'}`
              })
              .join(', ')
          } else {
            errorMessage = String(data.detail)
          }
        } else if (data.message) {
          errorMessage = String(data.message)
        }
        return {
          error: errorMessage,
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health')
  }

  // Company endpoints
  async getCompanies(): Promise<ApiResponse<Company[]>> {
    return this.request<Company[]>('/companies')
  }

  async createCompany(name: string, description?: string): Promise<ApiResponse<Company>> {
    const body: { name: string; description?: string } = { name }
    if (description) {
      body.description = description
    }
    return this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request<Company>(`/companies/${id}`)
  }

  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/companies/${id}`, {
      method: 'DELETE',
    })
  }

  // Agent endpoints - get agents from company state
  async getAgents(companyId?: string): Promise<ApiResponse<Agent[]>> {
    if (!companyId) {
      return { data: [], status: 200 }
    }
    // Agents are fetched from company state endpoint
    const response = await this.request<{ agents: (Agent & { agent_id?: string })[] }>(`/companies/${companyId}/state`)
    if (response.data) {
      // Map agent_id to id for frontend compatibility
      const agents = (response.data.agents || []).map(agent => ({
        ...agent,
        id: agent.id || agent.agent_id || '',
      }))
      return { data: agents, status: response.status }
    }
    return { data: [], status: response.status, error: response.error }
  }

  async createAgent(
    companyId: string,
    agentId: string,
    name: string,
    role: string
  ): Promise<ApiResponse<Agent>> {
    return this.request<Agent>(`/companies/${companyId}/agents`, {
      method: 'POST',
      body: JSON.stringify({
        agent_id: agentId,
        name,
        role,
      }),
    })
  }

  async getAgent(companyId: string, agentId: string): Promise<ApiResponse<Agent>> {
    return this.request<Agent>(`/companies/${companyId}/agents/${agentId}`)
  }

  async deleteAgent(companyId: string, agentId: string): Promise<ApiResponse<{ agent_id: string; status: string }>> {
    return this.request<{ agent_id: string; status: string }>(`/companies/${companyId}/agents/${agentId}`, {
      method: 'DELETE',
    })
  }

  // Event endpoints
  async sendEvent(payload: EventPayload): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/events', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    })
  }

  // Batch events
  async sendEvents(payloads: EventPayload[]): Promise<ApiResponse<unknown>[]> {
    return Promise.all(payloads.map((payload) => this.sendEvent(payload)))
  }
}

// Export singleton instance
export const api = new ApiService()
