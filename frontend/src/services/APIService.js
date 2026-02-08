export class APIService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';
        this._timeout = 10000; // M3: 10s fetch timeout
    }

    // M3: Fetch with AbortController timeout
    async _fetch(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this._timeout);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) throw new Error(res.status);
            return await res.json();
        } catch (e) {
            clearTimeout(timeoutId);
            console.error('API error:', e.name === 'AbortError' ? `Timeout: ${url}` : e);
            return null;
        }
    }

    async getCompanies() {
        return this._fetch(`${this.baseUrl}/companies`);
    }

    async getCompanyState(companyId) {
        return this._fetch(`${this.baseUrl}/companies/${companyId}/state`);
    }

    async getCompanyLogs(companyId, { limit = 50, offset = 0, agentId = null, eventType = null } = {}) {
        let url = `${this.baseUrl}/companies/${companyId}/logs?limit=${limit}&offset=${offset}`;
        if (agentId) url += `&agent_id=${encodeURIComponent(agentId)}`;
        if (eventType) url += `&event_type=${encodeURIComponent(eventType)}`;
        return this._fetch(url);
    }

    async updateMovementProgress(companyId, movementId, progress) {
        return this._fetch(`${this.baseUrl}/companies/${companyId}/movements/${movementId}?progress=${progress}`, { method: 'PATCH' });
    }

    async completeMovement(companyId, movementId) {
        return this._fetch(`${this.baseUrl}/companies/${companyId}/movements/${movementId}/complete`, { method: 'POST' });
    }

    async cleanupMovements(companyId) {
        return this._fetch(`${this.baseUrl}/companies/${companyId}/movements/cleanup`, { method: 'DELETE' });
    }

    async checkHealth() {
        return this._fetch(`${this.baseUrl}/health`);
    }
}
