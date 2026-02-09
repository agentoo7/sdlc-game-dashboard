import Phaser from 'phaser';
import { APIService } from '../services/APIService.js';
import { RoleRegistry } from '../services/RoleRegistry.js';
import { StateReconciler } from '../services/StateReconciler.js';
import { Department } from '../classes/Department.js';
import { Agent, AGENT_STATES } from '../classes/Agent.js';
import { UIManager } from '../classes/UIManager.js';
import { IsoUtils } from '../utils/IsoUtils.js';

export class BMadOfficeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BMadOffice' });
        this.api = new APIService();
        this.roleRegistry = new RoleRegistry();
        this.stateReconciler = new StateReconciler();
        this.departments = {};
        this.agents = [];
        this.selectedAgent = null;

        // API-driven state
        this.selectedCompanyId = null;
        this.pollingTimer = null;
        this.pollCount = 0;
        this.activeMovements = new Map();
        this.agentMap = new Map();
        this.knownLogIds = new Set();
        this._pollGeneration = 0;
    }

    async create() {
        this.uiManager = new UIManager(this);

        // World setup
        this.cameras.main.setBounds(-400, -100, 2900, 1700).setZoom(0.85);
        this.createBackground();
        this.setupInput();
        this.setupMinimap();

        // Selection Indicator
        this.selectionContainer = this.add.container(0, 0).setDepth(10000).setVisible(false);
        this.selectionContainer.add([
            this.add.graphics().lineStyle(3, 0x00ffff, 1).strokeCircle(0, 15, 35),
            this.add.graphics().fillStyle(0x00ffff, 1).fillTriangle(0, -50, -10, -65, 10, -65)
        ]);

        // Setup company selector
        this.uiManager.setupCompanySelector((companyId) => this.selectCompany(companyId));

        // Fetch and display company list
        const data = await this.api.getCompanies();
        if (data?.companies) {
            this.uiManager.updateCompanyList(data.companies);
        }

        // Show "select company" overlay
        this.uiManager.showNoCompanyOverlay();

        // Refresh company list every 30 seconds
        this._companyRefreshTimer = setInterval(async () => {
            const data = await this.api.getCompanies();
            if (data?.companies) {
                this.uiManager.updateCompanyList(data.companies);
            }
        }, 30000);

        // F10: Clean up timers on scene shutdown
        this.events.once('shutdown', () => {
            if (this._companyRefreshTimer) { clearInterval(this._companyRefreshTimer); this._companyRefreshTimer = null; }
            if (this.pollingTimer) { clearTimeout(this.pollingTimer); this.pollingTimer = null; }
        });

        // Hide loader
        const ls = document.getElementById('loading-screen');
        if (ls) { ls.classList.add('hidden'); setTimeout(() => ls.style.display = 'none', 600); }
    }

    // --- Company Selection ---

    async selectCompany(companyId) {
        // M2: Re-entry guard for rapid company switching
        if (this._selectingCompany) return;
        this._selectingCompany = true;

        try {
        if (!companyId) {
            this.clearScene();
            this.uiManager.showNoCompanyOverlay();
            return;
        }

        this.clearScene();
        this.selectedCompanyId = companyId;
        this.uiManager.hideNoCompanyOverlay();

        // Fetch initial state
        const state = await this.api.getCompanyState(companyId);
        if (!state) {
            this.uiManager.updateConnectionStatus('error');
            return;
        }

        // Merge role configs from backend
        this.roleRegistry.mergeBackendRoles(state.role_configs);

        // Create departments
        const deptConfigs = this.roleRegistry.getDepartments();
        deptConfigs.forEach(d => this.createDepartment(d));

        // Create agents from API state
        for (const apiAgent of state.agents) {
            this._createAgentFromApi(apiAgent);
        }

        // Process existing pending movements
        this.processMovements(state.pending_movements || []);

        // Fetch initial logs
        const logsData = await this.api.getCompanyLogs(companyId, { limit: 15 });
        if (logsData) {
            logsData.logs.forEach(l => this.knownLogIds.add(l.id));
            this.uiManager.updateActivityLog(logsData.logs, this.agentMap);
        }

        // Update UI
        this.updateLists();

        // H3: Start polling with setTimeout chaining (prevents concurrent polls)
        this._schedulePoll();
        this.uiManager.updateConnectionStatus('connected');
        } finally {
            this._selectingCompany = false;
        }
    }

    _schedulePoll() {
        this.pollingTimer = setTimeout(async () => {
            await this.pollState();
            if (this.selectedCompanyId) this._schedulePoll();
        }, 3000);
    }

    _createAgentFromApi(apiAgent) {
        const roleConfig = this.roleRegistry.getRole(apiAgent.role);
        // H2: Resolve alias (e.g., 'developer' → 'dev') before department lookup
        const roleId = apiAgent.role.toLowerCase();
        const aliasedId = this.roleRegistry.resolveAlias(roleId);
        const dept = this.departments[aliasedId] || this.departments[roleId] || this.departments[roleConfig.id];

        let position;
        if (dept) {
            const { gridBounds } = dept;
            const gridX = gridBounds.x + Phaser.Math.Between(1, Math.max(1, gridBounds.width - 2));
            const gridY = gridBounds.y + Phaser.Math.Between(1, Math.max(1, gridBounds.height - 2));
            const iso = IsoUtils.gridToIso(gridX, gridY);
            position = { x: iso.x, y: iso.y };
        } else {
            // Fallback: center of map
            const iso = IsoUtils.gridToIso(10, 8);
            position = { x: iso.x, y: iso.y };
        }

        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const agent = new Agent(this, {
            id: `${apiAgent.agent_id}_${Date.now()}`,
            agentId: apiAgent.agent_id,
            name: apiAgent.name,
            role: roleConfig,
            gender,
            position
        });

        agent.updateFromState(apiAgent, this.stateReconciler.mapBackendStatus.bind(this.stateReconciler));

        this.agents.push(agent);
        this.agentMap.set(apiAgent.agent_id, agent);

        if (dept) {
            dept.agents.push(agent);
        }

        return agent;
    }

    // --- Polling ---

    async pollState() {
        if (!this.selectedCompanyId) return;
        this.pollCount++;
        const gen = this._pollGeneration;

        const state = await this.api.getCompanyState(this.selectedCompanyId);
        if (gen !== this._pollGeneration) return; // Company changed during fetch
        if (!state) {
            this.uiManager.updateConnectionStatus('error');
            return;
        }
        this.uiManager.updateConnectionStatus('connected');

        // Merge role configs
        this.roleRegistry.mergeBackendRoles(state.role_configs);

        // Reconcile agents
        const diff = this.stateReconciler.reconcileAgents(this.agentMap, state.agents, this.roleRegistry);

        // Add new agents
        for (const apiAgent of diff.toAdd) {
            this._createAgentFromApi(apiAgent);
        }

        // Remove departed agents
        for (const agentId of diff.toRemove) {
            const agent = this.agentMap.get(agentId);
            if (agent) {
                // F11: Remove from department's agent list
                for (const dept of Object.values(this.departments)) {
                    dept.agents = dept.agents.filter(a => a.agentId !== agentId);
                }
                agent.destroy();
                this.agents = this.agents.filter(a => a.agentId !== agentId);
                this.agentMap.delete(agentId);
                if (this.selectedAgent?.agentId === agentId) this.deselectAgent();
            }
        }

        // Update changed agents (only if not busy)
        for (const apiAgent of diff.toUpdate) {
            const agent = this.agentMap.get(apiAgent.agent_id);
            if (agent) {
                agent.updateFromState(apiAgent, this.stateReconciler.mapBackendStatus.bind(this.stateReconciler));
            }
        }

        // Process movements
        this.processMovements(state.pending_movements || []);

        // Fetch logs
        const logsData = await this.api.getCompanyLogs(this.selectedCompanyId, { limit: 15 });
        if (gen !== this._pollGeneration) return; // Company changed during fetch
        if (logsData) {
            // Prune knownLogIds to only current batch (F5: prevent unbounded growth)
            const currentBatchIds = new Set(logsData.logs.map(l => l.id));
            const hasNewLogs = logsData.logs.some(l => !this.knownLogIds.has(l.id));
            this.knownLogIds = currentBatchIds;
            // Only rebuild DOM if there are new logs (F6: avoid unnecessary DOM thrashing)
            if (hasNewLogs) {
                this.uiManager.updateActivityLog(logsData.logs, this.agentMap);
            }
        }

        // Update UI
        this.uiManager.updateAgentList(this.agents);
        if (this.selectedAgent) this.uiManager.updateAgentPanel(this.selectedAgent);

        // Periodic cleanup (every 5th poll)
        if (this.pollCount % 5 === 0) {
            this.api.cleanupMovements(this.selectedCompanyId);
        }
    }

    // --- Movement Processing ---

    processMovements(pendingMovements) {
        const handoffs = pendingMovements.filter(m => m.purpose === 'handoff');
        const returns = pendingMovements.filter(m => m.purpose === 'return');

        // Start handoff movements not already active
        for (const movement of handoffs) {
            if (!this.activeMovements.has(movement.id)) {
                this.animateMovement(movement);
            }
        }

        // Start return movements ONLY if no active handoff for same agent
        for (const movement of returns) {
            if (!this.activeMovements.has(movement.id)) {
                const hasActiveHandoff = [...this.activeMovements.values()]
                    .some(m => m.agentId === movement.agent_id && m.purpose === 'handoff');
                if (!hasActiveHandoff) {
                    this.animateMovement(movement);
                }
            }
        }

        // Clean up completed: remove from activeMovements if no longer in API list
        const apiMovementIds = new Set(pendingMovements.map(m => m.id));
        for (const [movId] of this.activeMovements) {
            if (!apiMovementIds.has(movId)) {
                this.activeMovements.delete(movId);
            }
        }
    }

    animateMovement(movement) {
        const agent = this.agentMap.get(movement.agent_id);
        if (!agent || agent.isBusy) return;

        // H2: Resolve alias for department lookup
        const toZone = movement.to_zone.toLowerCase();
        const aliasedZone = this.roleRegistry.resolveAlias(toZone);
        const dept = this.departments[aliasedZone] || this.departments[toZone] || this.departments[this.roleRegistry.getRole(toZone)?.id];
        if (!dept) return;

        const targetX = dept.center.x;
        const targetY = dept.center.y;

        agent.isBusy = true;
        agent.setState(AGENT_STATES.WALKING);
        this.uiManager.refreshUI(this.agents, this.agentMap);

        this.activeMovements.set(movement.id, {
            agentId: movement.agent_id,
            purpose: movement.purpose,
            startTime: Date.now()
        });

        // Build interaction data for the agent panel
        const targetAgent = this.agentMap.get(movement.to_zone) ||
            this.agents.find(a => a.role.id === aliasedZone || a.role.id === toZone);
        if (movement.purpose === 'handoff' && targetAgent) {
            // Find matching log for markdown content
            const logs = this.uiManager._logs || [];
            const matchingLog = logs.find(l =>
                l.from_agent === movement.agent_id &&
                (l.to_agent === movement.to_zone || l.to_agent === targetAgent?.agentId)
            );
            const interaction = {
                fromAgent: agent,
                toAgent: targetAgent,
                action: movement.purpose || 'task handoff',
                topic: {
                    title: movement.artifact || matchingLog?.payload?.task || 'Task',
                    markdown: matchingLog?.payload?.description || matchingLog?.payload?.content || matchingLog?.payload?.markdown || ''
                }
            };
            agent.currentInteraction = interaction;
            agent.lastInteraction = interaction;
        }

        // H5: Progress reporting at 25/50/75% milestones
        const reportedMilestones = new Set();
        const companyId = this.selectedCompanyId;

        agent.moveTo(targetX, targetY, async () => {
            if (movement.purpose === 'handoff') {
                agent.setState(AGENT_STATES.DISCUSSING);
                this.uiManager.refreshUI(this.agents, this.agentMap);
                await new Promise(r => setTimeout(r, 3000));
                const result = await this.api.completeMovement(companyId, movement.id);
                if (result) this.activeMovements.delete(movement.id);
                agent.currentInteraction = null;
                agent.isBusy = false;
            } else if (movement.purpose === 'return') {
                const result = await this.api.completeMovement(companyId, movement.id);
                if (result) this.activeMovements.delete(movement.id);
                agent.isBusy = false;
                agent.setState(AGENT_STATES.IDLE);
            }
            this.uiManager.refreshUI(this.agents, this.agentMap);
        }, (progress) => {
            // H5: Report progress at 25/50/75% milestones (fire-and-forget)
            const milestone = Math.floor(progress * 4) * 25;
            if (milestone > 0 && milestone < 100 && !reportedMilestones.has(milestone)) {
                reportedMilestones.add(milestone);
                this.api.updateMovementProgress(companyId, movement.id, progress);
            }
        });
    }

    // --- Scene Cleanup ---

    clearScene() {
        // Increment generation to invalidate in-flight polls (F2)
        this._pollGeneration++;

        // H3: Stop polling (now using setTimeout)
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
            this.pollingTimer = null;
        }

        // Kill all active tweens first to prevent orphaned references
        this.tweens.killAll();

        // Destroy all agents
        this.agents.forEach(a => a.destroy());

        // H4: Clear dept agent refs before destroy to prevent double-destroy
        Object.values(this.departments).forEach(d => d.agents = []);
        // Destroy all departments
        Object.values(this.departments).forEach(d => d.destroy());

        // Clear state
        this.agentMap.clear();
        this.activeMovements.clear();
        this.knownLogIds.clear();
        this.agents = [];
        this.departments = {};
        this.selectedCompanyId = null;
        this.pollCount = 0;

        // Reset UI
        this.deselectAgent();
        const actList = document.getElementById('activity-list');
        if (actList) actList.innerHTML = '';
        this.updateLists();
    }

    // --- Department & Agent Creation ---

    createDepartment(config) {
        const dept = new Department(this, config);
        this.departments[config.role.id] = dept;
        return dept;
    }

    // --- Helpers & UI Hooks ---

    selectAgent(agent) {
        this.selectedAgent = agent;
        this.selectionContainer.setVisible(true).setPosition(agent.container.x, agent.container.y);
        this.cameras.main.startFollow(agent.container, true, 0.08, 0.08);
        this.uiManager.updateAgentPanel(agent);
        this.uiManager.updateAgentList(this.agents);
    }

    selectAgentById(agentId) {
        // Try agentId (backend ID) first
        const agent = this.agentMap.get(agentId) || this.agents.find(a => a.id === agentId || a.agentId === agentId);
        if (agent) this.selectAgent(agent);
    }

    deselectAgent() {
        this.selectedAgent = null;
        this.selectionContainer.setVisible(false);
        this.cameras.main.stopFollow();
        this.uiManager.updateAgentPanel(null);
        this.uiManager.updateAgentList(this.agents);
    }

    focusDepartment(id) {
        const d = this.departments[id];
        if (d) {
            this.cameras.main.stopFollow();
            this.cameras.main.pan(d.center.x, d.center.y, 500);
        }
    }

    updateLists() {
        this.uiManager.updateDepartmentList(this.departments);
        this.uiManager.updateAgentList(this.agents);
    }

    // --- Input & Camera ---

    setupInput() {
        this.input.on('pointerdown', (p) => {
            if (p.rightButtonDown() || p.leftButtonDown()) {
                this.isDragging = true;
                this.dragStart = { x: p.x, y: p.y };
                this.camStart = { x: this.cameras.main.scrollX, y: this.cameras.main.scrollY };
            }
        });
        this.input.on('pointermove', (p) => {
            if (this.isDragging && p.isDown) {
                this.cameras.main.scrollX = this.camStart.x + (this.dragStart.x - p.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY = this.camStart.y + (this.dragStart.y - p.y) / this.cameras.main.zoom;
            }
        });
        this.input.on('pointerup', () => this.isDragging = false);
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom - deltaY * 0.001, 0.3, 2.5));
        });
        this.input.keyboard.on('keydown-ESC', () => this.deselectAgent());
    }

    zoomIn() { this.cameras.main.setZoom(Math.min(2.5, this.cameras.main.zoom + 0.2)); }
    zoomOut() { this.cameras.main.setZoom(Math.max(0.3, this.cameras.main.zoom - 0.2)); }
    resetView() {
        this.cameras.main.setZoom(0.85);
        this.cameras.main.centerOn(1050, 720);
    }

    // --- Rendering Helpers ---

    createBackground() {
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a3a, 0x1a1a3a, 1);
        bg.fillRect(-400, -100, 3300, 2100).setDepth(-200);
    }

    setupMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = 160; canvas.height = 100;
        this.time.addEvent({
            delay: 100, callback: () => {
                ctx.fillStyle = 'rgba(10, 10, 30, 0.9)'; ctx.fillRect(0, 0, 160, 100);
                const s = 0.055, ox = 20, oy = 5;
                Object.values(this.departments).forEach(d => {
                    ctx.fillStyle = d.role.colorHex + '60';
                    ctx.beginPath(); ctx.arc(d.center.x * s + ox, d.center.y * s + oy, 6, 0, Math.PI * 2); ctx.fill();
                });
                this.agents.forEach(a => {
                    ctx.fillStyle = a === this.selectedAgent ? '#fff' : a.role.colorHex;
                    ctx.beginPath(); ctx.arc(a.container.x * s + ox, a.container.y * s + oy, 2, 0, Math.PI * 2); ctx.fill();
                });

                const cam = this.cameras.main;
                ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 1;
                ctx.strokeRect(cam.scrollX * s + ox, cam.scrollY * s + oy, (cam.width / cam.zoom) * s, (cam.height / cam.zoom) * s);
            }, loop: true
        });
    }

    update() {
        if (this.selectedAgent) this.selectionContainer.setPosition(this.selectedAgent.container.x, this.selectedAgent.container.y);
    }
}
