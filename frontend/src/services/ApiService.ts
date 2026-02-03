import { API_URL } from '@/utils/constants';
import type { Company, CompanyState, LogEntry } from '@/types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  // Company endpoints
  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/companies`);
    if (!response.ok) throw new Error('Failed to fetch companies');
    const data = await response.json();
    return data.companies;
  }

  async getCompanyState(companyId: string): Promise<CompanyState> {
    const response = await fetch(`${this.baseUrl}/companies/${companyId}/state`);
    if (!response.ok) throw new Error('Failed to fetch company state');
    return response.json();
  }

  async getCompanyLogs(
    companyId: string,
    options?: {
      agent_id?: string;
      event_type?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ logs: LogEntry[]; total: number; has_more: boolean }> {
    const params = new URLSearchParams();
    if (options?.agent_id) params.set('agent_id', options.agent_id);
    if (options?.event_type) params.set('event_type', options.event_type);
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());

    const url = `${this.baseUrl}/companies/${companyId}/logs?${params}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('API health check failed');
    return response.json();
  }
}

export const apiService = new ApiService();
