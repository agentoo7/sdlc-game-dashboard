import { apiService } from '@/services/ApiService';
import type { LogEntry } from '@/types';

export class ActivityLog {
  private container: HTMLElement;
  private currentCompanyId: string | null = null;
  private logs: LogEntry[] = [];
  private isExpanded = false;
  private selectedLogId: string | null = null;
  private filters: { eventTypes: string[]; agentIds: string[] } = {
    eventTypes: [],
    agentIds: [],
  };
  private pollingInterval: number | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = container;
    this.render();
  }

  setCompany(companyId: string): void {
    this.currentCompanyId = companyId;
    this.logs = [];
    this.loadLogs();

    // Start polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = window.setInterval(() => this.loadLogs(), 2000);
  }

  private async loadLogs(): Promise<void> {
    if (!this.currentCompanyId) return;

    try {
      const options: Record<string, string | number> = { limit: 50 };

      if (this.filters.eventTypes.length > 0) {
        options.event_type = this.filters.eventTypes[0]; // API supports single filter
      }
      if (this.filters.agentIds.length > 0) {
        options.agent_id = this.filters.agentIds[0];
      }

      const response = await apiService.getCompanyLogs(this.currentCompanyId, options);
      this.logs = response.logs.map((log) => ({
        ...log,
        summary: this.generateSummary(log),
      }));
      this.renderLogs();
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  private generateSummary(log: LogEntry): string {
    const payload = log.payload as Record<string, unknown>;

    switch (log.event_type) {
      case 'THINKING':
        return payload.thought as string || 'Thinking...';
      case 'WORKING':
        return payload.task as string || 'Working on task';
      case 'WORK_REQUEST':
        return `Requested work from ${log.to_agent}`;
      case 'WORK_COMPLETE':
        return `Completed work for ${log.to_agent}`;
      case 'IDLE':
        return 'Became idle';
      case 'ERROR':
        return payload.error as string || 'Error occurred';
      default:
        return log.event_type;
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between px-4 py-2 border-b border-slate-700">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm">Activity Log</span>
            <span class="text-xs text-slate-400" id="log-count">(0 events)</span>
          </div>
          <div class="flex items-center gap-2">
            <button id="filter-btn" class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded">
              Filter
            </button>
            <button id="toggle-btn" class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded">
              ${this.isExpanded ? '▼ Collapse' : '▲ Expand'}
            </button>
          </div>
        </div>
        <div id="log-list" class="flex-1 overflow-y-auto px-2 py-1 ${this.isExpanded ? '' : 'max-h-8'}">
          <div class="text-slate-500 text-xs italic">Select a company to view logs</div>
        </div>
        <div id="filter-panel" class="hidden border-t border-slate-700 p-2 bg-slate-800">
          <!-- Filter options -->
        </div>
      </div>
    `;

    // Attach event listeners
    this.container.querySelector('#toggle-btn')?.addEventListener('click', () => {
      this.isExpanded = !this.isExpanded;
      this.render();
      this.renderLogs();
    });

    this.container.querySelector('#filter-btn')?.addEventListener('click', () => {
      const panel = this.container.querySelector('#filter-panel');
      panel?.classList.toggle('hidden');
      this.renderFilterPanel();
    });
  }

  private renderLogs(): void {
    const logList = this.container.querySelector('#log-list');
    const logCount = this.container.querySelector('#log-count');

    if (!logList) return;

    if (logCount) {
      logCount.textContent = `(${this.logs.length} events)`;
    }

    if (this.logs.length === 0) {
      logList.innerHTML = '<div class="text-slate-500 text-xs italic py-2">No events yet</div>';
      return;
    }

    const displayLogs = this.isExpanded ? this.logs.slice(0, 20) : this.logs.slice(0, 1);

    logList.innerHTML = displayLogs.map((log) => `
      <div class="log-entry cursor-pointer ${this.selectedLogId === log.id ? 'bg-slate-700' : ''}" data-log-id="${log.id}">
        <span class="log-time">${this.formatTime(log.timestamp)}</span>
        <span class="log-from">${log.from_agent || '-'}</span>
        <span class="log-arrow">→</span>
        <span class="log-to">${log.to_agent || '-'}</span>
        <span class="log-type">${log.event_type}</span>
        <span class="log-summary">${log.summary}</span>
      </div>
      ${this.selectedLogId === log.id ? this.renderLogDetails(log) : ''}
    `).join('');

    // Attach click handlers
    logList.querySelectorAll('.log-entry').forEach((entry) => {
      entry.addEventListener('click', () => {
        const logId = entry.getAttribute('data-log-id');
        if (logId) {
          this.selectedLogId = this.selectedLogId === logId ? null : logId;
          this.renderLogs();
        }
      });
    });
  }

  private renderLogDetails(log: LogEntry): string {
    return `
      <div class="bg-slate-900 p-2 mx-2 mb-2 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
        <pre class="text-green-400">${JSON.stringify(log.payload, null, 2)}</pre>
        ${log.inferred_actions?.length ? `
          <div class="mt-2 text-amber-400">
            <div class="font-semibold">Inferred Actions:</div>
            ${log.inferred_actions.map((a) => `<div>• ${a}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderFilterPanel(): void {
    const panel = this.container.querySelector('#filter-panel');
    if (!panel) return;

    const eventTypes = ['THINKING', 'WORKING', 'WORK_REQUEST', 'WORK_COMPLETE', 'IDLE', 'ERROR'];

    panel.innerHTML = `
      <div class="text-xs">
        <div class="font-semibold mb-1">Event Types:</div>
        <div class="flex flex-wrap gap-2 mb-2">
          ${eventTypes.map((type) => `
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" class="event-filter" value="${type}"
                ${this.filters.eventTypes.includes(type) ? 'checked' : ''}>
              <span>${type}</span>
            </label>
          `).join('')}
        </div>
        <button id="apply-filter" class="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white">
          Apply
        </button>
        <button id="clear-filter" class="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded ml-2">
          Clear
        </button>
      </div>
    `;

    panel.querySelector('#apply-filter')?.addEventListener('click', () => {
      const checkboxes = panel.querySelectorAll('.event-filter:checked');
      this.filters.eventTypes = Array.from(checkboxes).map((cb) => (cb as HTMLInputElement).value);
      this.loadLogs();
    });

    panel.querySelector('#clear-filter')?.addEventListener('click', () => {
      this.filters = { eventTypes: [], agentIds: [] };
      this.loadLogs();
    });
  }

  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  destroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}
