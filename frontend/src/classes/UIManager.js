import { marked } from 'marked';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: { primaryColor: '#1a1a3a', primaryTextColor: '#00ffff', lineColor: '#00ffff', secondaryColor: '#2a2a5a' },
});

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Configure marked — pass sanitized HTML through (XSS handled in renderMarkdown)
marked.use({
    renderer: {
        html(token) { return typeof token === 'string' ? token : token.text; },
        image() { return ''; },
    }
});

function renderMarkdown(md) {
    if (!md || typeof md !== 'string') return '';
    // Sanitize: strip script tags and event handlers before parsing
    const sanitized = md
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript\s*:/gi, '');
    return marked.parse(sanitized, { breaks: true });
}

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this._logs = [];
        this._agentMap = null;
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

        // Interaction detail (current or last)
        const interaction = a.currentInteraction || a.lastInteraction;
        let interactionHTML = '';
        if (interaction) {
            const i = interaction;
            const fromName = escapeHtml(i.fromAgent?.name || '');
            const toName = escapeHtml(i.toAgent?.name || '');
            const fromIcon = escapeHtml(i.fromAgent?.role?.icon || '👤');
            const toIcon = escapeHtml(i.toAgent?.role?.icon || '👤');
            const fromColor = escapeHtml(i.fromAgent?.role?.colorHex || '#888');
            const toColor = escapeHtml(i.toAgent?.role?.colorHex || '#888');
            const topicTitle = escapeHtml(i.topic?.title || 'Task');
            const topicMd = i.topic?.markdown || '';

            let mdSection = '';
            if (topicMd) {
                mdSection = `
                    <div class="markdown-container" id="agent-md">
                        <div class="markdown-header">
                            <span class="markdown-title">📄 Output / Nội dung</span>
                            <button class="markdown-expand-btn" data-target="agent-md">Mở rộng</button>
                        </div>
                        <div class="markdown-content">${renderMarkdown(topicMd)}</div>
                    </div>`;
            }

            interactionHTML = `
                <div class="interaction-detail-box">
                    <div class="interaction-detail-title">💬 Chi tiết trao đổi</div>
                    <div class="interaction-participants">
                        <div class="interaction-participant">
                            <div class="interaction-participant-avatar" style="background:${fromColor}40;border-color:${fromColor};">${fromIcon}</div>
                            <div class="interaction-participant-name">${fromName}</div>
                        </div>
                        <div class="interaction-arrow">→</div>
                        <div class="interaction-participant">
                            <div class="interaction-participant-avatar" style="background:${toColor}40;border-color:${toColor};">${toIcon}</div>
                            <div class="interaction-participant-name">${toName}</div>
                        </div>
                    </div>
                    <div class="interaction-action">${fromName} ${escapeHtml(i.action)} ${toName}</div>
                    <div style="text-align:center;font-size:10px;color:#f39c12;margin:6px 0;">📌 ${topicTitle}</div>
                    ${mdSection}
                </div>`;
        }

        // Current task
        let taskHTML = '';
        if (a.currentTask) {
            taskHTML = `
                <div class="current-task-box">
                    <div class="current-task-label">Current Task</div>
                    <div class="current-task-text">${escapeHtml(a.currentTask)}</div>
                </div>`;
        }

        // Error indicator
        let errorHTML = '';
        if (a.hasError) {
            errorHTML = '<div style="color:#e74c3c;font-size:10px;margin-bottom:6px;">⚠️ Agent in error state</div>';
        }

        // Skills tags
        const skills = a.role.skills || [];
        const skillsHTML = skills.length > 0 ? `
            <div class="skills-container">
                <div class="skills-title">Skills</div>
                <div class="skills-list">
                    ${skills.map(s => `<span class="skill-tag" style="background:${escapeHtml(a.role.colorHex)}20;color:${escapeHtml(a.role.colorHex)};border:1px solid ${escapeHtml(a.role.colorHex)}40;">${escapeHtml(s)}</span>`).join('')}
                </div>
            </div>` : '';

        // Per-agent activity history
        const agentId = a.agentId;
        const logs = this._logs || [];
        const agentMap = this._agentMap;
        const agentLogs = logs.filter(l => l.from_agent === agentId || l.to_agent === agentId);

        let activityHTML = '';
        if (agentLogs.length > 0) {
            const items = agentLogs.slice(0, 8).map(log => {
                const isInitiator = log.from_agent === agentId;
                const otherAgentId = isInitiator ? log.to_agent : log.from_agent;
                const otherAgent = agentMap && agentMap.get(otherAgentId);
                const otherName = escapeHtml(otherAgent?.name || otherAgentId || 'System');
                const roleClass = isInitiator ? 'as-initiator' : 'as-receiver';
                const roleText = isInitiator ? '→ Khởi tạo' : '← Nhận';
                const roleColor = isInitiator ? '#27ae60' : '#3498db';
                const time = escapeHtml(new Date(log.timestamp).toLocaleTimeString());

                let statusIcon = '📋';
                if (log.inferred_actions) {
                    if (log.inferred_actions.some(x => x.includes('walk'))) statusIcon = '🚶';
                    else if (log.inferred_actions.some(x => x.includes('status:working'))) statusIcon = '💼';
                    else if (log.inferred_actions.some(x => x.includes('status:thinking'))) statusIcon = '🤔';
                }

                const topicTitle = escapeHtml(log.payload?.task || log.event_type);

                return `
                    <div class="agent-activity-item ${roleClass}" data-log-id="${escapeHtml(log.id)}">
                        <div class="agent-activity-header">
                            <span class="agent-activity-time">${time}</span>
                            <span class="agent-activity-status">${statusIcon}</span>
                            <span class="agent-activity-role-tag" style="color:${roleColor};">${roleText}</span>
                        </div>
                        <div class="agent-activity-desc">
                            ${escapeHtml(log.event_type)} <span class="other-agent">${otherName}</span>
                        </div>
                        <div class="agent-activity-topic">📌 ${topicTitle}</div>
                    </div>`;
            }).join('');

            activityHTML = `
                <div class="agent-activity-section">
                    <div class="agent-activity-title">📝 Lịch sử hoạt động (${agentLogs.length})</div>
                    <div class="agent-activity-list">${items}</div>
                </div>`;
        } else {
            activityHTML = `
                <div class="agent-activity-section">
                    <div class="agent-activity-title">📝 Lịch sử hoạt động</div>
                    <div class="agent-no-activity">Chưa có hoạt động nào được ghi nhận</div>
                </div>`;
        }

        container.innerHTML = `
            <div class="agent-info active">
                <div class="agent-header">
                    <div class="agent-avatar" style="background:${escapeHtml(a.role.colorHex)}40;border-color:${escapeHtml(a.role.colorHex)};">${escapeHtml(a.role.icon)}</div>
                    <div class="agent-title"><div class="agent-name" style="color:${escapeHtml(a.role.colorHex)};">${escapeHtml(a.name)}</div><div class="agent-role">${escapeHtml(a.role.fullName)}</div></div>
                </div>
                ${errorHTML}
                <div class="agent-status-box"><div class="status-dot" style="background:${a.state.color};"></div><div class="status-text">${a.state.icon} ${a.state.text}</div></div>
                ${interactionHTML}
                ${taskHTML}
                <p style="font-size:10px;color:#99aacc;margin:8px 0;">${escapeHtml(a.role.description || '')}</p>
                ${skillsHTML}
                ${activityHTML}
            </div>`;

        // Bind click handlers for activity items
        container.querySelectorAll('.agent-activity-item').forEach(el => {
            el.addEventListener('click', () => {
                const logId = el.dataset.logId;
                const log = logs.find(l => l.id === logId);
                if (log) this.openActivityModal(log, agentMap);
            });
        });

        // Bind markdown expand button
        const expandBtn = container.querySelector('.markdown-expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                const target = expandBtn.dataset.target;
                const mdContainer = document.getElementById(target);
                if (mdContainer) {
                    mdContainer.classList.toggle('expanded');
                    expandBtn.textContent = mdContainer.classList.contains('expanded') ? 'Thu gọn' : 'Mở rộng';
                }
            });
        }
    }

    // --- Activity Log (Backend format) ---

    updateActivityLog(logs, agentMap) {
        this._logs = logs || [];
        this._agentMap = agentMap;

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

    openActivityModal(log, agentMap = this._agentMap) {
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

        // Parse payload to extract title and markdown separately
        let topicTitle = '';
        let topicMarkdown = '';
        let actionText = '';
        if (log.payload) {
            // Try direct fields first (new format: { task: "title", description: "## markdown" })
            if (log.payload.description && typeof log.payload.description === 'string' && log.payload.description.includes('#')) {
                topicTitle = log.payload.task || '';
                topicMarkdown = log.payload.description;
            } else if (log.payload.markdown && typeof log.payload.markdown === 'string') {
                topicTitle = log.payload.title || log.payload.task || '';
                topicMarkdown = log.payload.markdown;
            } else if (log.payload.content && typeof log.payload.content === 'string' && log.payload.content.includes('#')) {
                topicTitle = log.payload.subject || log.payload.task || '';
                topicMarkdown = log.payload.content;
            } else if (typeof log.payload.task === 'string' && log.payload.task.includes('markdown')) {
                // Legacy format: task contains stringified object "{ title: '...', markdown: '...' }"
                const titleMatch = log.payload.task.match(/title:\s*['"`]([^'"`]+)['"`]/);
                const mdMatch = log.payload.task.match(/markdown:\s*[`'"]([\s\S]*?)[`'"]\s*[,}]/);
                topicTitle = titleMatch ? titleMatch[1] : '';
                topicMarkdown = mdMatch ? mdMatch[1] : log.payload.task;
            } else {
                topicTitle = log.payload.task || log.payload.subject || '';
            }
            // Derive action text from inferred_actions
            if (log.inferred_actions) {
                if (log.inferred_actions.some(a => a.includes('handoff'))) actionText = 'bàn giao cho';
                else if (log.inferred_actions.some(a => a.includes('walk_to'))) actionText = 'gửi yêu cầu cho';
                else if (log.inferred_actions.some(a => a.includes('status:working'))) actionText = 'đang làm việc';
                else if (log.inferred_actions.some(a => a.includes('status:thinking'))) actionText = 'đang suy nghĩ';
                else if (log.inferred_actions.some(a => a.includes('status:coding'))) actionText = 'đang code';
                else if (log.inferred_actions.some(a => a.includes('status:reviewing'))) actionText = 'đang review';
                else actionText = log.event_type.toLowerCase().replace(/_/g, ' ');
            }
        }
        // Clean escaped newlines
        if (topicMarkdown) {
            topicMarkdown = topicMarkdown.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');
        }

        // Status text
        const statusText = log.inferred_actions?.some(a => a.includes('walk_to')) ? '✅ Hoàn thành' : '📋 Đã ghi nhận';

        // Render markdown content section
        let contentHTML = '';
        if (topicMarkdown) {
            contentHTML = `
                <div class="modal-markdown">
                    <div class="modal-markdown-title"><span>📄</span><span>Nội dung chi tiết / Output</span></div>
                    <div class="modal-markdown-content">${renderMarkdown(topicMarkdown)}</div>
                </div>`;
        } else if (log.payload) {
            contentHTML = `
                <div class="modal-markdown">
                    <div class="modal-markdown-title"><span>📄</span><span>Payload</span></div>
                    <div class="modal-markdown-content"><pre><code>${escapeHtml(JSON.stringify(log.payload, null, 2))}</code></pre></div>
                </div>`;
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
                <div class="modal-info-item"><div class="modal-info-label">Thời gian</div><div class="modal-info-value">🕐 ${time}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">Trạng thái</div><div class="modal-info-value">${statusText}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">Hành động</div><div class="modal-info-value">${escapeHtml(actionText)}</div></div>
                <div class="modal-info-item"><div class="modal-info-label">Chủ đề</div><div class="modal-info-value" style="color:#f39c12;">📌 ${escapeHtml(topicTitle || log.event_type)}</div></div>
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

        // Post-process: find mermaid code blocks and render as diagrams
        modalBody.querySelectorAll('pre code').forEach(codeEl => {
            if (codeEl.className && codeEl.className.includes('language-mermaid')) {
                const pre = codeEl.parentElement;
                const div = document.createElement('div');
                div.className = 'mermaid';
                div.textContent = codeEl.textContent;
                pre.replaceWith(div);
            }
        });
        const mermaidEls = modalBody.querySelectorAll('.mermaid');
        if (mermaidEls.length > 0) {
            mermaid.run({ nodes: mermaidEls }).catch(() => {});
        }
    }
}
