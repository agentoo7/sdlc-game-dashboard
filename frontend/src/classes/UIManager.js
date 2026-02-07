import { marked } from 'marked';

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// H1: Configure marked to escape raw HTML (prevent XSS from API payloads)
marked.use({
    renderer: {
        html(token) { return escapeHtml(typeof token === 'string' ? token : token.text); }
    }
});

function renderMarkdown(md) {
    return marked.parse(md, { breaks: true });
}

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.setupEventListeners();
    }

    // F15: Null-safe event binding helper
    _on(id, event, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
    }

    setupEventListeners() {
        // Zoom Controls
        this._on('zoom-in-btn', 'click', () => this.scene.zoomIn());
        this._on('zoom-out-btn', 'click', () => this.scene.zoomOut());
        this._on('reset-view-btn', 'click', () => this.scene.resetView());

        // Panels
        this._on('dept-collapse-btn', 'click', () => this.togglePanelCollapse('dept-content'));
        this._on('dept-title', 'click', () => this.togglePanelCollapse('dept-content'));
        this._on('agent-collapse-btn', 'click', () => this.togglePanelCollapse('agent-content'));
        this._on('agent-title', 'click', () => this.togglePanelCollapse('agent-content'));

        // Modals
        this._on('close-activity-modal', 'click', () => this.closeActivityModal());
        this._on('activity-modal', 'click', (e) => { if (e.target === e.currentTarget) this.closeActivityModal(); });
        this._on('close-mgmt-modal', 'click', () => this.closeMgmtModal());
        this._on('mgmt-modal', 'click', (e) => { if (e.target === e.currentTarget) this.closeMgmtModal(); });

        // Add Buttons
        this._on('add-dept-btn', 'click', (e) => e.stopPropagation());
        this._on('add-agent-btn', 'click', (e) => e.stopPropagation());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActivityModal();
                this.closeMgmtModal();
                this.scene.deselectAgent();
            }
        });
    }

    // --- Company Selector ---

    setupCompanySelector(onSelectCallback) {
        const selector = document.getElementById('company-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                const value = e.target.value;
                onSelectCallback(value || null);
            });
        }
    }

    updateCompanyList(companies) {
        const selector = document.getElementById('company-selector');
        if (!selector) return;

        const currentValue = selector.value;
        selector.innerHTML = '<option value="">Select Company...</option>';

        for (const company of companies) {
            const option = document.createElement('option');
            option.value = company.company_id;
            const activity = company.last_activity
                ? new Date(company.last_activity).toLocaleTimeString()
                : 'No activity';
            option.textContent = `${company.name} (${company.agent_count} agents) - ${activity}`;
            selector.appendChild(option);
        }

        // Restore selection if still valid
        if (currentValue) {
            selector.value = currentValue;
        }
    }

    showNoCompanyOverlay() {
        const overlay = document.getElementById('no-company-overlay');
        if (overlay) overlay.classList.remove('hidden');
    }

    hideNoCompanyOverlay() {
        const overlay = document.getElementById('no-company-overlay');
        if (overlay) overlay.classList.add('hidden');
    }

    updateConnectionStatus(status) {
        const el = document.getElementById('connection-status');
        if (!el) return;
        el.className = 'connection-status ' + status;
    }

    // --- Panel Controls ---

    togglePanelCollapse(contentId) {
        const content = document.getElementById(contentId);
        const btnId = contentId.replace('-content', '-collapse-btn');
        const btn = document.getElementById(btnId);
        if (!content) return;
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            if (btn) btn.textContent = '−';
        } else {
            content.classList.add('collapsed');
            if (btn) btn.textContent = '+';
        }
    }

    closeActivityModal() {
        const modal = document.getElementById('activity-modal');
        if (modal) modal.classList.remove('active');
    }

    closeMgmtModal() {
        const modal = document.getElementById('mgmt-modal');
        if (modal) modal.classList.remove('active');
    }

    // --- Department & Agent Lists ---

    updateDepartmentList(departments) {
        const list = document.getElementById('department-list');
        list.innerHTML = '';
        Object.values(departments).forEach(d => {
            const div = document.createElement('div');
            div.className = 'department-item';
            div.innerHTML = `
                <div class="dept-icon" style="background:${escapeHtml(d.role.colorHex)}30;">${escapeHtml(d.role.icon)}</div>
                <div class="dept-name">${escapeHtml(d.role.name)}</div>
                <div class="dept-count">${d.agents.length}</div>
            `;
            div.querySelector('.dept-name').addEventListener('click', () => this.scene.focusDepartment(d.role.id));
            div.querySelector('.dept-icon').addEventListener('click', () => this.scene.focusDepartment(d.role.id));
            list.appendChild(div);
        });
    }

    updateAgentList(agents) {
        const list = document.getElementById('agent-list');
        list.innerHTML = '';
        agents.forEach(a => {
            const div = document.createElement('div');
            div.className = `agent-list-item ${this.scene.selectedAgent === a ? 'selected' : ''}`;
            div.innerHTML = `
                <div class="agent-mini-avatar" style="background:${escapeHtml(a.role.colorHex)}40;">${escapeHtml(a.role.icon)}</div>
                <div class="agent-mini-name">${escapeHtml(a.name)} <span style="color:#667788;font-size:8px;">(${escapeHtml(a.role.name)})</span></div>
                <div class="agent-mini-status" style="background:${escapeHtml(a.state.color)};" title="${escapeHtml(a.state.text)}"></div>
            `;
            div.addEventListener('click', () => this.scene.selectAgentById(a.agentId || a.id));
            list.appendChild(div);
        });
    }

    updateAgentPanel(a) {
        const container = document.getElementById('agent-info-container');
        if (!a) {
            container.innerHTML = '<div class="no-selection"><div class="no-selection-icon">🔍</div><div>Click on an agent to view details</div></div>';
            return;
        }

        let taskHTML = '';
        if (a.currentTask) {
            taskHTML = `
                <div class="current-task-box">
                    <div class="current-task-label">Current Task</div>
                    <div class="current-task-text">${escapeHtml(a.currentTask)}</div>
                </div>`;
        }

        let errorHTML = '';
        if (a.hasError) {
            errorHTML = '<div style="color:#e74c3c;font-size:10px;margin-bottom:6px;">⚠️ Agent in error state</div>';
        }

        container.innerHTML = `
            <div class="agent-info active">
                <div class="agent-header">
                    <div class="agent-avatar" style="background:${escapeHtml(a.role.colorHex)}40;border-color:${escapeHtml(a.role.colorHex)};">${escapeHtml(a.role.icon)}</div>
                    <div class="agent-title"><div class="agent-name" style="color:${escapeHtml(a.role.colorHex)};">${escapeHtml(a.name)}</div><div class="agent-role">${escapeHtml(a.role.fullName)}</div></div>
                </div>
                ${errorHTML}
                <div class="agent-status-box"><div class="status-dot" style="background:${a.state.color};"></div><div class="status-text">${a.state.icon} ${a.state.text}</div></div>
                ${taskHTML}
                <div class="agent-stats">
                    <div class="stat-item"><div class="stat-value">${a.stats.tasksCompleted}</div><div class="stat-label">Tasks</div></div>
                    <div class="stat-item"><div class="stat-value">${a.stats.hoursWorked}h</div><div class="stat-label">Hours</div></div>
                    <div class="stat-item"><div class="stat-value">${a.stats.interactions}</div><div class="stat-label">Chats</div></div>
                </div>
            </div>`;
    }

    // --- Activity Log (Backend format) ---

    updateActivityLog(logs, agentMap) {
        const list = document.getElementById('activity-list');
        list.innerHTML = '';

        if (!logs || logs.length === 0) return;

        logs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            const fromName = (agentMap && agentMap.get(log.from_agent)?.name) || log.from_agent || 'System';
            const toName = (agentMap && agentMap.get(log.to_agent)?.name) || log.to_agent || '';

            // Derive icon from inferred_actions
            let icon = '📋';
            if (log.inferred_actions) {
                if (log.inferred_actions.some(a => a.includes('walk'))) icon = '🚶';
                else if (log.inferred_actions.some(a => a.includes('status:working'))) icon = '💼';
                else if (log.inferred_actions.some(a => a.includes('status:thinking'))) icon = '🤔';
            }

            const toText = toName ? ` → <span class="highlight">${escapeHtml(toName)}</span>` : '';

            const div = document.createElement('div');
            div.className = 'activity-item';
            div.innerHTML = `
                <div class="activity-summary">
                    <span class="activity-time">${escapeHtml(time)}</span>
                    <span class="activity-icon">${icon}</span>
                    <span class="activity-text"><span class="highlight">${escapeHtml(fromName)}</span> ${escapeHtml(log.event_type)}${toText}</span>
                </div>`;
            div.addEventListener('click', () => this.openActivityModal(log, agentMap));
            list.appendChild(div);
        });
    }

    openActivityModal(log, agentMap) {
        if (!log) return;
        const modalBody = document.getElementById('modal-body');

        const fromAgent = agentMap && agentMap.get(log.from_agent);
        const toAgent = agentMap && agentMap.get(log.to_agent);

        const fromName = escapeHtml(fromAgent?.name || log.from_agent || 'System');
        const fromRole = escapeHtml(fromAgent?.role?.fullName || '');
        const fromIcon = escapeHtml(fromAgent?.role?.icon || '👤');

        const toName = escapeHtml(toAgent?.name || log.to_agent || '');
        const toRole = escapeHtml(toAgent?.role?.fullName || '');
        const toIcon = escapeHtml(toAgent?.role?.icon || '👤');

        const time = escapeHtml(new Date(log.timestamp).toLocaleTimeString());
        const inferredStr = escapeHtml(log.inferred_actions ? log.inferred_actions.join(', ') : 'N/A');

        // Render payload content
        let contentHTML = '';
        if (log.payload) {
            if (log.payload.markdown || log.payload.content) {
                const md = log.payload.markdown || log.payload.content;
                contentHTML = `
                    <div class="modal-markdown">
                        <div class="modal-markdown-title"><span>📄</span><span>Content</span></div>
                        <div class="modal-markdown-content">${renderMarkdown(md)}</div>
                    </div>`;
            } else {
                contentHTML = `
                    <div class="modal-markdown">
                        <div class="modal-markdown-title"><span>📄</span><span>Payload</span></div>
                        <div class="modal-markdown-content"><pre><code>${escapeHtml(JSON.stringify(log.payload, null, 2))}</code></pre></div>
                    </div>`;
            }
        }

        // Participants section
        let participantsHTML = '';
        if (toName) {
            participantsHTML = `
                <div class="modal-participants">
                    <div class="modal-participant" id="modal-from-agent">
                        <div class="modal-participant-avatar">${fromIcon}</div>
                        <div class="modal-participant-name">${fromName}</div>
                        <div class="modal-participant-role">${fromRole}</div>
                    </div>
                    <div class="modal-arrow">➜</div>
                    <div class="modal-participant" id="modal-to-agent">
                        <div class="modal-participant-avatar">${toIcon}</div>
                        <div class="modal-participant-name">${toName}</div>
                        <div class="modal-participant-role">${toRole}</div>
                    </div>
                </div>`;
        } else {
            participantsHTML = `
                <div class="modal-participants">
                    <div class="modal-participant" id="modal-from-agent">
                        <div class="modal-participant-avatar">${fromIcon}</div>
                        <div class="modal-participant-name">${fromName}</div>
                        <div class="modal-participant-role">${fromRole}</div>
                    </div>
                </div>`;
        }

        modalBody.innerHTML = `
            ${participantsHTML}
            <div class="modal-info-grid">
                <div class="modal-info-item"><div class="modal-info-label">Event Type</div><div class="modal-info-value">${escapeHtml(log.event_type)}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">Timestamp</div><div class="modal-info-value">${time}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">Inferred Actions</div><div class="modal-info-value">${inferredStr}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">Log ID</div><div class="modal-info-value" style="font-size:9px;word-break:break-all;">${escapeHtml(log.id)}</div></div>
            </div>
            ${contentHTML}`;

        // Click-to-select agent on participants
        const fromEl = modalBody.querySelector('#modal-from-agent');
        if (fromEl && fromAgent) {
            fromEl.addEventListener('click', () => {
                this.closeActivityModal();
                this.scene.selectAgentById(fromAgent.agentId);
            });
        }
        const toEl = modalBody.querySelector('#modal-to-agent');
        if (toEl && toAgent) {
            toEl.addEventListener('click', () => {
                this.closeActivityModal();
                this.scene.selectAgentById(toAgent.agentId);
            });
        }

        document.getElementById('activity-modal').classList.add('active');
    }
}
