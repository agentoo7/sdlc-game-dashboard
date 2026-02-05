import { apiService } from '@/services/ApiService';
import { ROLE_COLORS } from '@/utils/constants';
import type { LogEntry } from '@/types';

const STORAGE_KEY = 'sdlc_dashboard_sidebar_expanded';
const SIDEBAR_WIDTH_EXPANDED = 320;
const SIDEBAR_WIDTH_COLLAPSED = 40;

/** Escape HTML to prevent XSS */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export class ActivityLog {
  private container: HTMLElement;
  private currentCompanyId: string | null = null;
  private logs: LogEntry[] = [];
  private isExpanded: boolean;
  private selectedLogId: string | null = null;
  private unreadCount = 0;
  private lastSeenLogId: string | null = null;
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

    // Load saved state from localStorage (default to expanded)
    this.isExpanded = this.loadExpandedState();

    this.render();
    this.updateSidebarClass();
  }

  /** Get current sidebar width */
  getSidebarWidth(): number {
    return this.isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
  }

  /** Check if sidebar is expanded */
  getIsExpanded(): boolean {
    return this.isExpanded;
  }

  private loadExpandedState(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true; // Default to expanded if localStorage fails
    }
  }

  private saveExpandedState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.isExpanded));
    } catch {
      // Ignore localStorage errors
    }
  }

  private updateSidebarClass(): void {
    if (this.isExpanded) {
      this.container.classList.remove('collapsed');
    } else {
      this.container.classList.add('collapsed');
    }
  }

  private emitToggleEvent(): void {
    window.dispatchEvent(new CustomEvent('sidebarToggle', {
      detail: {
        expanded: this.isExpanded,
        width: this.getSidebarWidth()
      }
    }));
  }

  setCompany(companyId: string): void {
    this.currentCompanyId = companyId;
    this.logs = [];
    this.unreadCount = 0;
    this.lastSeenLogId = null;
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
      const newLogs = response.logs.map((log) => ({
        ...log,
        summary: this.generateSummary(log),
      }));

      // Track unread count when collapsed - count logs newer than lastSeenLogId
      if (!this.isExpanded && this.lastSeenLogId && newLogs.length > 0) {
        const lastSeenIndex = newLogs.findIndex(log => log.id === this.lastSeenLogId);
        if (lastSeenIndex > 0) {
          // New logs appear at the beginning (newest first)
          this.unreadCount += lastSeenIndex;
        } else if (lastSeenIndex === -1) {
          // lastSeenLogId not found - all logs are new
          this.unreadCount += newLogs.length;
        }
      }

      this.logs = newLogs;

      // Update lastSeenLogId when expanded (user is viewing logs)
      if (this.isExpanded && newLogs.length > 0) {
        this.lastSeenLogId = newLogs[0].id;
      }
      this.renderLogs();
      this.updateUnreadBadge();
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
      case 'EXECUTING':
        return payload.command as string || 'Executing...';
      case 'WORK_REQUEST':
        return `Requested work from ${log.to_agent}`;
      case 'WORK_COMPLETE':
        return `Completed work for ${log.to_agent}`;
      case 'REVIEW_REQUEST':
        return `Requested review from ${log.to_agent}`;
      case 'FEEDBACK':
        return `Provided feedback to ${log.to_agent}`;
      case 'MESSAGE_SEND':
        return `Sent message to ${log.to_agent}`;
      case 'MESSAGE_RECEIVE':
        return `Received message from ${log.from_agent}`;
      case 'TASK_COMPLETE':
        return 'Task completed';
      case 'IDLE':
        return 'Became idle';
      case 'ERROR':
        return payload.error as string || 'Error occurred';
      case 'CUSTOM_EVENT':
        return payload.event_name as string || 'Custom event';
      default:
        return log.event_type;
    }
  }

  private getRoleColor(role: string | undefined): string {
    if (!role) return '#64748B'; // Default slate gray

    const roleKey = role.toLowerCase();
    const colorNum = ROLE_COLORS[roleKey];

    if (colorNum !== undefined) {
      return `#${colorNum.toString(16).padStart(6, '0')}`;
    }

    return '#64748B'; // Default for unknown roles
  }

  private render(): void {
    if (this.isExpanded) {
      this.renderExpanded();
    } else {
      this.renderCollapsed();
    }
  }

  private renderExpanded(): void {
    this.container.innerHTML = `
      <div class="flex flex-col h-full">
        <div class="sidebar-header">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm">Activity Log</span>
            <span class="text-xs text-slate-400" id="log-count">(0)</span>
          </div>
          <div class="flex items-center gap-2">
            <button id="filter-btn" class="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded" title="Filter events">
              <span>Filter</span>
            </button>
            <button id="toggle-btn" class="sidebar-toggle-btn" title="Collapse sidebar">
              <span>▶</span>
            </button>
          </div>
        </div>
        <div id="log-list" class="sidebar-content">
          <div class="text-slate-500 text-xs italic">Select a company to view logs</div>
        </div>
        <div id="filter-panel" class="hidden border-t border-slate-700 p-2 bg-slate-800">
          <!-- Filter options -->
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderCollapsed(): void {
    this.container.innerHTML = `
      <div class="flex flex-col h-full items-center py-3 gap-3">
        <button id="toggle-btn" class="sidebar-toggle-btn" title="Expand sidebar">
          <span>◀</span>
        </button>
        <div id="unread-badge" class="unread-badge ${this.unreadCount > 0 ? '' : 'hidden'}">
          ${this.unreadCount > 99 ? '99+' : this.unreadCount}
        </div>
        <div class="writing-mode-vertical text-xs text-slate-400 tracking-wider" style="writing-mode: vertical-rl; text-orientation: mixed;">
          Activity Log
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Toggle button
    this.container.querySelector('#toggle-btn')?.addEventListener('click', () => {
      this.toggle();
    });

    // Filter button (only in expanded mode)
    this.container.querySelector('#filter-btn')?.addEventListener('click', () => {
      const panel = this.container.querySelector('#filter-panel');
      panel?.classList.toggle('hidden');
      this.renderFilterPanel();
    });
  }

  private toggle(): void {
    this.isExpanded = !this.isExpanded;

    // Reset unread count when expanding
    if (this.isExpanded) {
      this.unreadCount = 0;
    }

    this.saveExpandedState();
    this.updateSidebarClass();
    this.render();
    this.renderLogs();
    this.emitToggleEvent();
  }

  private updateUnreadBadge(): void {
    const badge = this.container.querySelector('#unread-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : String(this.unreadCount);
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  private renderLogs(): void {
    if (!this.isExpanded) return;

    const logList = this.container.querySelector('#log-list');
    const logCount = this.container.querySelector('#log-count');

    if (!logList) return;

    if (logCount) {
      logCount.textContent = `(${this.logs.length})`;
    }

    if (this.logs.length === 0) {
      logList.innerHTML = '<div class="text-slate-500 text-xs italic py-2">No events yet</div>';
      return;
    }

    logList.innerHTML = this.logs.slice(0, 50).map((log) => {
      const roleColor = this.getRoleColor(log.agent_role);
      const isSelected = this.selectedLogId === log.id;
      // Escape user-provided content to prevent XSS
      const safeFromAgent = escapeHtml(log.from_agent || 'System');
      const safeToAgent = log.to_agent ? escapeHtml(log.to_agent) : '';
      const safeSummary = escapeHtml(log.summary || '');
      const safeEventType = escapeHtml(log.event_type);

      return `
        <div class="log-entry cursor-pointer ${isSelected ? 'bg-slate-700' : ''}"
             data-log-id="${escapeHtml(log.id)}"
             style="border-left-color: ${roleColor}">
          <div class="log-entry-header">
            <span class="text-slate-400">${this.formatTime(log.timestamp)}</span>
            <span class="text-amber-400 font-medium">${safeEventType}</span>
          </div>
          <div class="log-entry-content">
            <span class="text-blue-400">${safeFromAgent}</span>
            ${safeToAgent ? `<span class="text-slate-500 mx-1">→</span><span class="text-green-400">${safeToAgent}</span>` : ''}
          </div>
          <div class="text-xs text-slate-400 truncate">${safeSummary}</div>
        </div>
        ${isSelected ? this.renderLogDetails(log) : ''}
      `;
    }).join('');

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
      <div class="bg-slate-900 p-2 mb-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
        <pre class="text-green-400 whitespace-pre-wrap">${JSON.stringify(log.payload, null, 2)}</pre>
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

    // All event types matching backend EventType enum
    const eventTypes = [
      'THINKING',
      'WORKING',
      'EXECUTING',
      'IDLE',
      'ERROR',
      'TASK_COMPLETE',
      'MESSAGE_SEND',
      'MESSAGE_RECEIVE',
      'WORK_REQUEST',
      'WORK_COMPLETE',
      'REVIEW_REQUEST',
      'FEEDBACK',
      'CUSTOM_EVENT',
    ];

    panel.innerHTML = `
      <div class="text-xs">
        <div class="font-semibold mb-2">Event Types:</div>
        <div class="flex flex-col gap-1 mb-3 max-h-48 overflow-y-auto">
          ${eventTypes.map((type) => `
            <label class="flex items-center gap-2 cursor-pointer hover:bg-slate-700 px-1 rounded">
              <input type="checkbox" class="event-filter" value="${type}"
                ${this.filters.eventTypes.includes(type) ? 'checked' : ''}>
              <span class="text-slate-300">${type}</span>
            </label>
          `).join('')}
        </div>
        <div class="flex gap-2">
          <button id="apply-filter" class="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white">
            Apply
          </button>
          <button id="clear-filter" class="flex-1 px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">
            Clear
          </button>
        </div>
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
