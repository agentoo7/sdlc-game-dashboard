import { Scene } from 'phaser';
import { ROLE_COLORS, ZONE_POSITIONS, CUSTOM_ROLE_COLORS, POLLING_INTERVAL } from '@/utils/constants';
import { apiService } from '@/services/ApiService';
import type { Agent, RoleConfig, CompanyState, PendingMovement } from '@/types';

// Status indicator icons
const STATUS_ICONS: Record<string, string> = {
  thinking: '💭',
  working: '📝',
  executing: '⚡',
  error: '❌',
  walking: '🚶',
  idle: '',
};

export class MainScene extends Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map();
  private statusIndicators: Map<string, Phaser.GameObjects.Text> = new Map();
  private zones: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private roleConfigs: Map<string, RoleConfig> = new Map();
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private currentCompanyId: string | null = null;
  private pollingTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    console.log('MainScene: Creating game world');

    // Disable browser context menu on canvas
    this.game.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Set world bounds for camera
    this.cameras.main.setBounds(-500, -500, 2000, 2000);

    // Enable camera controls
    this.setupCameraControls();

    // Create office layout
    this.createOfficeLayout();

    // Center camera on office
    this.cameras.main.centerOn(400, 400);

    // Listen for company selection events
    this.game.events.on('selectCompany', this.loadCompany, this);
  }

  private setupCameraControls(): void {
    // Zoom with scroll wheel
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.5, 2);
      this.cameras.main.setZoom(newZoom);
    });

    // Pan with left-click drag
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && pointer.isDown) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        this.cameras.main.scrollX -= dx / this.cameras.main.zoom;
        this.cameras.main.scrollY -= dy / this.cameras.main.zoom;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });
  }

  private createOfficeLayout(): void {
    const gridSize = 100;
    const gridColor = 0x334155;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const rect = this.add.rectangle(
          x * gridSize + 50,
          y * gridSize + 50,
          gridSize - 4,
          gridSize - 4,
          gridColor,
          0.3
        );
        rect.setStrokeStyle(1, 0x475569);
      }
    }

    // Create department zones
    Object.entries(ZONE_POSITIONS).forEach(([role, pos]) => {
      const color = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 0x64748B;

      const zone = this.add.rectangle(pos.x, pos.y, 180, 120, color, 0.2);
      zone.setStrokeStyle(2, color);
      this.zones.set(role, zone);

      this.add.text(pos.x, pos.y - 40, role.toUpperCase(), {
        fontSize: '14px',
        color: '#F8FAFC',
        fontFamily: 'Inter',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  async loadCompany(companyId: string): Promise<void> {
    if (companyId === this.currentCompanyId) return;

    console.log(`MainScene: Loading company ${companyId}`);
    this.currentCompanyId = companyId;

    // Stop previous polling
    if (this.pollingTimer) {
      this.pollingTimer.destroy();
    }

    // Clear existing agents
    this.clearAgents();

    try {
      const state = await apiService.getCompanyState(companyId);
      this.updateFromState(state);

      // Start polling for updates
      this.pollingTimer = this.time.addEvent({
        delay: POLLING_INTERVAL,
        callback: () => this.pollState(),
        loop: true,
      });

      console.log(`MainScene: Loaded ${state.agents.length} agents`);
    } catch (error) {
      console.error('Failed to load company state:', error);
    }
  }

  private async pollState(): Promise<void> {
    if (!this.currentCompanyId) return;

    try {
      const state = await apiService.getCompanyState(this.currentCompanyId);
      this.updateFromState(state);
    } catch (error) {
      console.error('Poll failed:', error);
    }
  }

  private updateFromState(state: CompanyState): void {
    // Update role configs
    this.roleConfigs.clear();
    Object.entries(state.role_configs).forEach(([roleId, config]) => {
      this.roleConfigs.set(roleId, config);
    });

    // Update or create agents
    const seenAgents = new Set<string>();

    state.agents.forEach((agent, index) => {
      seenAgents.add(agent.agent_id);
      const existing = this.agents.get(agent.agent_id);

      if (existing) {
        this.updateAgent(existing, agent);
      } else {
        this.createAgentFromData(agent, index);
      }
    });

    // Remove agents that no longer exist
    this.agents.forEach((container, agentId) => {
      if (!seenAgents.has(agentId)) {
        container.destroy();
        this.agents.delete(agentId);
        this.statusIndicators.get(agentId)?.destroy();
        this.statusIndicators.delete(agentId);
      }
    });

    // Process pending movements
    state.pending_movements.forEach((movement) => {
      this.processMovement(movement);
    });
  }

  private clearAgents(): void {
    this.agents.forEach((container) => container.destroy());
    this.agents.clear();
    this.statusIndicators.forEach((indicator) => indicator.destroy());
    this.statusIndicators.clear();
  }

  private createAgentFromData(agent: Agent, index: number): void {
    const roleConfig = agent.role_config || this.roleConfigs.get(agent.role);
    const color = roleConfig
      ? parseInt(roleConfig.color.replace('#', ''), 16)
      : this.getColorForRole(agent.role);

    const zonePos = ZONE_POSITIONS[agent.role as keyof typeof ZONE_POSITIONS] ||
      ZONE_POSITIONS.developer;

    // Offset for multiple agents in same zone
    const sameRoleAgents = Array.from(this.agents.values()).filter(
      (a) => a.getData('role') === agent.role
    );
    const offsetIndex = sameRoleAgents.length;
    const offsetX = (offsetIndex % 3) * 50 - 50;
    const offsetY = Math.floor(offsetIndex / 3) * 40;

    // Agent container
    const container = this.add.container(zonePos.x + offsetX, zonePos.y + offsetY);
    container.setData('role', agent.role);
    container.setData('agentId', agent.agent_id);
    container.setData('status', agent.status);
    container.setData('homeX', zonePos.x + offsetX);
    container.setData('homeY', zonePos.y + offsetY);

    // Agent body
    const body = this.add.circle(0, 0, 20, color);
    body.setStrokeStyle(2, 0xFFFFFF);

    // Agent label
    const label = this.add.text(0, -35, agent.agent_id, {
      fontSize: '11px',
      color: '#F8FAFC',
      fontFamily: 'JetBrains Mono',
      backgroundColor: '#0F172A',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    // Role letter
    const letter = this.add.text(0, 0, agent.role.charAt(0).toUpperCase(), {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Inter',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([body, label, letter]);

    // Make interactive
    body.setInteractive({ useHandCursor: true });
    body.on('pointerdown', () => {
      this.highlightAgent(container);
    });

    this.agents.set(agent.agent_id, container);

    // Add idle animation
    this.addIdleAnimation(container);

    // Add status indicator
    this.updateStatusIndicator(agent.agent_id, agent.status);
  }

  private updateAgent(container: Phaser.GameObjects.Container, agent: Agent): void {
    const prevStatus = container.getData('status');

    if (prevStatus !== agent.status) {
      container.setData('status', agent.status);
      this.updateStatusIndicator(agent.agent_id, agent.status);

      // Update animation based on status
      if (agent.status === 'idle') {
        this.addIdleAnimation(container);
      }
    }
  }

  private addIdleAnimation(container: Phaser.GameObjects.Container): void {
    // Breathing animation - subtle scale pulse
    this.tweens.add({
      targets: container,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private updateStatusIndicator(agentId: string, status: string): void {
    const container = this.agents.get(agentId);
    if (!container) return;

    // Remove existing indicator
    const existing = this.statusIndicators.get(agentId);
    if (existing) {
      existing.destroy();
      this.statusIndicators.delete(agentId);
    }

    const icon = STATUS_ICONS[status] || '';
    if (!icon) return;

    // Create status indicator
    const indicator = this.add.text(container.x, container.y - 50, icon, {
      fontSize: '24px',
    }).setOrigin(0.5);

    // Add floating animation
    this.tweens.add({
      targets: indicator,
      y: indicator.y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Scale-in animation
    indicator.setScale(0);
    this.tweens.add({
      targets: indicator,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.statusIndicators.set(agentId, indicator);
  }

  private processMovement(movement: PendingMovement): void {
    const container = this.agents.get(movement.agent_id);
    if (!container) return;

    // Skip if already moving
    if (container.getData('isMoving')) return;

    const toZonePos = ZONE_POSITIONS[movement.to_zone as keyof typeof ZONE_POSITIONS];
    if (!toZonePos) return;

    container.setData('isMoving', true);

    // Walk to destination
    this.tweens.add({
      targets: container,
      x: toZonePos.x,
      y: toZonePos.y,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => {
        container.setData('isMoving', false);

        // If purpose is handoff, show artifact animation
        if (movement.purpose === 'handoff' && movement.artifact) {
          this.showHandoffAnimation(container, movement.artifact);
        }
      },
    });

    // Update status indicator position
    const indicator = this.statusIndicators.get(movement.agent_id);
    if (indicator) {
      this.tweens.add({
        targets: indicator,
        x: toZonePos.x,
        y: toZonePos.y - 50,
        duration: 1500,
        ease: 'Linear',
      });
    }
  }

  private showHandoffAnimation(container: Phaser.GameObjects.Container, artifact: string): void {
    // Create artifact icon
    const artifactIcon = this.add.text(container.x, container.y - 30, '📄', {
      fontSize: '20px',
    }).setOrigin(0.5);

    // Arc motion animation
    this.tweens.add({
      targets: artifactIcon,
      x: container.x + 30,
      y: container.y - 50,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: artifactIcon,
          x: container.x + 50,
          y: container.y,
          duration: 250,
          ease: 'Quad.easeIn',
          onComplete: () => {
            artifactIcon.destroy();
          },
        });
      },
    });
  }

  private getColorForRole(role: string): number {
    if (role in ROLE_COLORS) {
      return ROLE_COLORS[role as keyof typeof ROLE_COLORS];
    }

    const customRoleIndex = Array.from(this.roleConfigs.keys())
      .filter((r) => !(r in ROLE_COLORS))
      .indexOf(role);

    if (customRoleIndex >= 0 && customRoleIndex < CUSTOM_ROLE_COLORS.length) {
      return CUSTOM_ROLE_COLORS[customRoleIndex];
    }

    return 0x64748B;
  }

  private highlightAgent(agent: Phaser.GameObjects.Container): void {
    this.agents.forEach((a) => {
      const body = a.list[0] as Phaser.GameObjects.Arc;
      body.setStrokeStyle(2, 0xFFFFFF);
    });

    const body = agent.list[0] as Phaser.GameObjects.Arc;
    body.setStrokeStyle(3, 0xFBBF24);
  }

  update(): void {
    // Update indicator positions to follow agents
    this.statusIndicators.forEach((indicator, agentId) => {
      const container = this.agents.get(agentId);
      if (container && !this.tweens.isTweening(indicator)) {
        indicator.x = container.x;
        indicator.y = container.y - 50;
      }
    });
  }
}
