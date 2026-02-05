import { Scene } from 'phaser';
import {
  ROLE_COLORS,
  ZONE_POSITIONS,
  ROLE_TO_ZONE,
  ZONE_LABELS,
  ROLE_ZONE_POSITIONS,
  CUSTOM_ROLE_COLORS,
  POLLING_INTERVAL,
} from '@/utils/constants';
import { apiService } from '@/services/ApiService';
import type { Agent, RoleConfig, CompanyState, PendingMovement } from '@/types';
import {
  SPRITE_SCALE,
  FRAME_IDLE,
  FRAME_WORKING,
  getSpriteKey,
  createWalkAnimation,
  createIdleAnimation,
  createWorkingAnimation,
} from '@/utils/SpriteGenerator';
import {
  OFFICE_TEXTURE_KEYS,
  FLOOR_TILE_SIZE,
  OFFICE_LAYOUT,
  ZONE_BACKGROUND_COLORS,
  drawDepartmentSign,
  drawCompanyCarpet,
} from '@/utils/OfficeRenderer';
import {
  createSpeechBubble,
  showBubble,
  hideBubble,
  updateBubblePosition,
  shouldShowBubble,
  addFloatAnimation,
  SPEECH_BUBBLE_CONFIG,
} from '@/utils/SpeechBubbleManager';

// Camera constants
const DEFAULT_ZOOM = 1.0;
const CENTER_X = 400;
const CENTER_Y = 400;

export class MainScene extends Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map();
  // Speech bubbles for agent status (Story 6.5)
  private speechBubbles: Map<string, Phaser.GameObjects.Container> = new Map();
  private zones: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private roleConfigs: Map<string, RoleConfig> = new Map();
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private currentCompanyId: string | null = null;
  private pollingTimer: Phaser.Time.TimerEvent | null = null;
  private isPanModeEnabled = true; // Default: pan mode enabled (existing behavior)

  // Office elements (Story 6.4)
  private carpetContainer: Phaser.GameObjects.Container | null = null;
  private signContainers: Phaser.GameObjects.Container[] = [];
  private desks: Phaser.GameObjects.Image[] = [];
  private plants: Phaser.GameObjects.Image[] = [];
  private floorTiles: Phaser.GameObjects.Image[] = [];
  private floorShadow: Phaser.GameObjects.Graphics | null = null;

  // Store event handlers for cleanup
  private cameraZoomHandler: ((event: Event) => void) | null = null;
  private cameraPanModeHandler: ((event: Event) => void) | null = null;
  private cameraCenterHandler: ((event: Event) => void) | null = null;
  private cameraResetHandler: ((event: Event) => void) | null = null;

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

    // Listen for camera toolbar events
    this.setupToolbarEventListeners();
  }

  private setupToolbarEventListeners(): void {
    // Store handlers for cleanup
    this.cameraZoomHandler = ((event: CustomEvent<{ zoom: number }>) => {
      this.setZoomSmooth(event.detail.zoom);
    }) as EventListener;

    this.cameraPanModeHandler = ((event: CustomEvent<{ enabled: boolean }>) => {
      this.isPanModeEnabled = event.detail.enabled;
      console.log(`Pan mode: ${this.isPanModeEnabled ? 'enabled' : 'disabled'}`);
    }) as EventListener;

    this.cameraCenterHandler = (() => {
      this.centerViewSmooth();
    }) as EventListener;

    this.cameraResetHandler = (() => {
      this.resetViewSmooth();
    }) as EventListener;

    // Zoom event from toolbar
    window.addEventListener('cameraZoom', this.cameraZoomHandler);

    // Pan mode toggle from toolbar
    window.addEventListener('cameraPanMode', this.cameraPanModeHandler);

    // Center view from toolbar
    window.addEventListener('cameraCenter', this.cameraCenterHandler);

    // Reset view from toolbar
    window.addEventListener('cameraReset', this.cameraResetHandler);
  }

  /** Cleanup event listeners when scene shuts down */
  shutdown(): void {
    // Remove toolbar event listeners
    if (this.cameraZoomHandler) {
      window.removeEventListener('cameraZoom', this.cameraZoomHandler);
    }
    if (this.cameraPanModeHandler) {
      window.removeEventListener('cameraPanMode', this.cameraPanModeHandler);
    }
    if (this.cameraCenterHandler) {
      window.removeEventListener('cameraCenter', this.cameraCenterHandler);
    }
    if (this.cameraResetHandler) {
      window.removeEventListener('cameraReset', this.cameraResetHandler);
    }

    // Stop polling
    if (this.pollingTimer) {
      this.pollingTimer.destroy();
      this.pollingTimer = null;
    }

    // Clear agents
    this.clearAgents();

    // Clear office elements (Story 6.4)
    this.carpetContainer?.destroy();
    this.signContainers.forEach(sign => sign.destroy());
    this.desks.forEach(desk => desk.destroy());
    this.plants.forEach(plant => plant.destroy());
    this.floorTiles.forEach(tile => tile.destroy());
    this.floorShadow?.destroy();
    this.signContainers = [];
    this.desks = [];
    this.plants = [];
    this.floorTiles = [];
    this.floorShadow = null;
  }

  /** Set zoom with smooth transition */
  private setZoomSmooth(targetZoom: number): void {
    this.tweens.add({
      targets: this.cameras.main,
      zoom: targetZoom,
      duration: 200,
      ease: 'Quad.Out',
      onComplete: () => {
        // Emit zoomChanged event back to toolbar
        window.dispatchEvent(new CustomEvent('zoomChanged', {
          detail: { zoom: this.cameras.main.zoom }
        }));
      }
    });
  }

  /** Center the camera with smooth transition */
  private centerViewSmooth(): void {
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: CENTER_X - this.cameras.main.width / 2,
      scrollY: CENTER_Y - this.cameras.main.height / 2,
      duration: 300,
      ease: 'Quad.Out'
    });
  }

  /** Reset camera to default zoom and center */
  private resetViewSmooth(): void {
    this.tweens.add({
      targets: this.cameras.main,
      zoom: DEFAULT_ZOOM,
      scrollX: CENTER_X - this.cameras.main.width / 2,
      scrollY: CENTER_Y - this.cameras.main.height / 2,
      duration: 300,
      ease: 'Quad.Out',
      onComplete: () => {
        // Emit zoomChanged event back to toolbar
        window.dispatchEvent(new CustomEvent('zoomChanged', {
          detail: { zoom: DEFAULT_ZOOM }
        }));
      }
    });
  }

  private setupCameraControls(): void {
    // Zoom with scroll wheel - fixed 0.1x increment per scroll (AC: Story 4.1)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      // Use fixed 0.1x increment regardless of wheel delta magnitude
      const zoomDelta = deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Phaser.Math.Clamp(zoom + zoomDelta, 0.5, 2);
      this.cameras.main.setZoom(newZoom);

      // Emit zoomChanged event to sync with toolbar
      window.dispatchEvent(new CustomEvent('zoomChanged', {
        detail: { zoom: newZoom }
      }));
    });

    // Pan with left-click drag (only when pan mode is enabled)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown() && this.isPanModeEnabled) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && pointer.isDown && this.isPanModeEnabled) {
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
    // === WOODEN FLOOR (AC1, Task 7) ===
    this.createWoodenFloor();

    // === DEPARTMENT ZONES (AC6, Task 2) ===
    this.createDepartmentZones();

    // === DEPARTMENT SIGNS (AC2, Task 3) ===
    this.createDepartmentSigns();

    // === COMPANY CARPET (AC3, Task 4) - initial empty ===
    this.createCompanyCarpet('Select Company');

    // === DESKS (AC4, Task 5) ===
    this.createDesks();

    // === PLANTS (AC5, Task 6) ===
    this.createPlants();
  }

  /**
   * Create wooden floor background (AC1)
   */
  private createWoodenFloor(): void {
    // Clear existing floor tiles
    this.floorTiles.forEach(tile => tile.destroy());
    this.floorTiles = [];
    this.floorShadow?.destroy();

    const { floorWidth, floorHeight, floorStartX, floorStartY } = OFFICE_LAYOUT;

    // Create tiled floor from pre-generated texture
    const numTilesX = Math.ceil(floorWidth / FLOOR_TILE_SIZE);
    const numTilesY = Math.ceil(floorHeight / FLOOR_TILE_SIZE);

    for (let tx = 0; tx < numTilesX; tx++) {
      for (let ty = 0; ty < numTilesY; ty++) {
        const tile = this.add.image(
          floorStartX + tx * FLOOR_TILE_SIZE + FLOOR_TILE_SIZE / 2,
          floorStartY + ty * FLOOR_TILE_SIZE + FLOOR_TILE_SIZE / 2,
          OFFICE_TEXTURE_KEYS.woodenFloor
        );
        tile.setDepth(0);
        this.floorTiles.push(tile);
      }
    }

    // Add subtle shadow around the office area
    const { shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight } = OFFICE_LAYOUT;
    this.floorShadow = this.add.graphics();
    this.floorShadow.fillStyle(0x000000, 0.2);
    this.floorShadow.fillRoundedRect(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight, 8);
    this.floorShadow.setDepth(0);
  }

  /**
   * Create department zones in 2x2 grid (AC6)
   */
  private createDepartmentZones(): void {
    const { zoneWidth, zoneHeight } = OFFICE_LAYOUT;

    Object.entries(ZONE_POSITIONS).forEach(([zoneName, pos]) => {
      // Zone background with subtle color based on department type
      const color = ZONE_BACKGROUND_COLORS[zoneName] || 0x64748B;

      // Zone rectangle with semi-transparent fill
      const zone = this.add.rectangle(pos.x, pos.y, zoneWidth, zoneHeight, color, 0.1);
      zone.setStrokeStyle(2, color, 0.4);
      zone.setDepth(1);
      this.zones.set(zoneName, zone);
    });
  }

  /**
   * Create wooden pole department signs (AC2)
   */
  private createDepartmentSigns(): void {
    Object.entries(ZONE_POSITIONS).forEach(([zoneName, pos]) => {
      const label = ZONE_LABELS[zoneName as keyof typeof ZONE_LABELS];
      const signContainer = drawDepartmentSign(this, pos.x, pos.y - 80, label, 10);
      this.signContainers.push(signContainer);
    });
  }

  /**
   * Create company carpet/rug in center (AC3)
   */
  private createCompanyCarpet(companyName: string): void {
    // Remove existing carpet
    if (this.carpetContainer) {
      this.carpetContainer.destroy();
    }

    const { carpetCenterX, carpetCenterY, carpetWidth, carpetHeight } = OFFICE_LAYOUT;
    this.carpetContainer = drawCompanyCarpet(
      this, carpetCenterX, carpetCenterY, companyName, carpetWidth, carpetHeight, 2
    );
  }

  /**
   * Update carpet with company name when company changes
   */
  private updateCompanyCarpet(companyName: string): void {
    this.createCompanyCarpet(companyName);
  }

  /**
   * Create pixel art desks in each zone (AC4)
   */
  private createDesks(): void {
    // Clear existing desks
    this.desks.forEach(desk => desk.destroy());
    this.desks = [];

    const { deskOffsets, deskScale } = OFFICE_LAYOUT;

    // Place desks in each zone
    Object.entries(ZONE_POSITIONS).forEach(([, pos]) => {
      deskOffsets.forEach(offset => {
        const desk = this.add.image(
          pos.x + offset.x,
          pos.y + offset.y,
          OFFICE_TEXTURE_KEYS.desk
        );
        desk.setDepth(3);
        desk.setScale(deskScale);
        this.desks.push(desk);
      });
    });
  }

  /**
   * Create decorative plants (AC5)
   */
  private createPlants(): void {
    // Clear existing plants
    this.plants.forEach(plant => plant.destroy());
    this.plants = [];

    const { cornerPlantPositions, dividerPlantPositions, plantScale } = OFFICE_LAYOUT;

    // Large plants in corners
    cornerPlantPositions.forEach(pos => {
      const plant = this.add.image(pos.x, pos.y, OFFICE_TEXTURE_KEYS.plantLarge);
      plant.setDepth(4);
      plant.setScale(plantScale);
      this.plants.push(plant);
    });

    // Small plants between zones (dividers)
    dividerPlantPositions.forEach(pos => {
      const plant = this.add.image(pos.x, pos.y, OFFICE_TEXTURE_KEYS.plantSmall);
      plant.setDepth(4);
      plant.setScale(plantScale);
      this.plants.push(plant);
    });
  }

  async loadCompany(companyId: string): Promise<void> {
    if (companyId === this.currentCompanyId) return;

    console.log(`MainScene: Loading company ${companyId}`);
    this.currentCompanyId = companyId;

    // Update carpet with company name (AC3)
    this.updateCompanyCarpet(companyId);

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
        // Clean up speech bubble (Story 6.5)
        const bubble = this.speechBubbles.get(agentId);
        if (bubble) {
          bubble.destroy();
          this.speechBubbles.delete(agentId);
        }
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
    // Clean up speech bubbles (Story 6.5)
    this.speechBubbles.forEach((bubble) => bubble.destroy());
    this.speechBubbles.clear();
  }

  private createAgentFromData(agent: Agent, index: number): void {
    const roleConfig = agent.role_config || this.roleConfigs.get(agent.role);
    const outfitColor = roleConfig
      ? parseInt(roleConfig.color.replace('#', ''), 16)
      : this.getColorForRole(agent.role);

    // Use role-to-zone mapping for ChatDev-style layout (Story 6.4)
    const zonePos = ROLE_ZONE_POSITIONS[agent.role as keyof typeof ROLE_ZONE_POSITIONS] ||
      ZONE_POSITIONS.coding;

    // Offset for multiple agents in same zone
    const sameRoleAgents = Array.from(this.agents.values()).filter(
      (a) => a.getData('role') === agent.role
    );
    const offsetIndex = sameRoleAgents.length;
    const offsetX = (offsetIndex % 3) * 70 - 70; // Wider spacing for sprites
    const offsetY = Math.floor(offsetIndex / 3) * 60;

    // Agent container
    const container = this.add.container(zonePos.x + offsetX, zonePos.y + offsetY);
    container.setData('role', agent.role);
    container.setData('agentId', agent.agent_id);
    container.setData('status', agent.status);
    container.setData('homeX', zonePos.x + offsetX);
    container.setData('homeY', zonePos.y + offsetY);
    container.setData('hairColorIndex', index);

    // Get sprite texture key (AC1, AC2, AC3)
    const hairColorIndex = index % 6; // Cycle through 6 hair colors
    const textureKey = getSpriteKey(hairColorIndex, outfitColor);
    container.setData('textureKey', textureKey);

    // Create animations for this texture if not exists
    const walkAnimKey = `${textureKey}-walk`;
    const idleAnimKey = `${textureKey}-idle`;
    const workAnimKey = `${textureKey}-work`;
    createWalkAnimation(this, textureKey, walkAnimKey);
    createIdleAnimation(this, textureKey, idleAnimKey);
    createWorkingAnimation(this, textureKey, workAnimKey);

    // Store animation keys
    container.setData('walkAnimKey', walkAnimKey);
    container.setData('idleAnimKey', idleAnimKey);
    container.setData('workAnimKey', workAnimKey);

    // Create sprite (AC1 - 32x48 at 2x scale = 64x96)
    const sprite = this.add.sprite(0, 20, textureKey, FRAME_IDLE);
    sprite.setScale(SPRITE_SCALE);
    sprite.setOrigin(0.5, 1); // Bottom center origin for better positioning

    // Agent label (AC8 - preserved floating above sprite)
    const label = this.add.text(0, -55, agent.agent_id, {
      fontSize: '11px',
      color: '#F8FAFC',
      fontFamily: 'JetBrains Mono',
      backgroundColor: '#0F172A',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    container.add([sprite, label]);

    // Make interactive (AC9 - preserved clickable behavior)
    sprite.setInteractive({ useHandCursor: true });
    sprite.on('pointerdown', () => {
      this.highlightAgent(container);
    });

    this.agents.set(agent.agent_id, container);

    // Set initial pose based on status (AC6, AC7)
    this.updateAgentPose(container, agent.status);

    // Add idle animation (AC6 - breathing)
    this.addIdleAnimation(container);

    // Add status indicator
    this.updateStatusIndicator(agent.agent_id, agent.status);
  }

  /**
   * Update agent sprite pose based on status (AC5, AC6, AC7)
   * Includes transition animation (Task 7.2)
   */
  private updateAgentPose(container: Phaser.GameObjects.Container, status: string): void {
    const sprite = container.list[0] as Phaser.GameObjects.Sprite;
    if (!sprite || !sprite.anims) return;

    // Stop any current animation
    sprite.anims.stop();

    const targetFrame = (status === 'working' || status === 'thinking') ? FRAME_WORKING : FRAME_IDLE;
    const currentFrame = sprite.frame?.name;

    // Only animate if frame is actually changing
    if (currentFrame !== targetFrame.toString()) {
      // Task 7.2 - Quick scale transition animation between poses
      this.tweens.add({
        targets: sprite,
        scaleX: SPRITE_SCALE * 0.9,
        scaleY: SPRITE_SCALE * 0.9,
        duration: 100,
        ease: 'Quad.Out',
        onComplete: () => {
          sprite.setFrame(targetFrame);
          this.tweens.add({
            targets: sprite,
            scaleX: SPRITE_SCALE,
            scaleY: SPRITE_SCALE,
            duration: 100,
            ease: 'Quad.Out',
          });
        },
      });
    } else {
      sprite.setFrame(targetFrame);
    }
  }

  /**
   * Start walk animation when agent is moving (AC5)
   */
  private startWalkAnimation(container: Phaser.GameObjects.Container): void {
    const sprite = container.list[0] as Phaser.GameObjects.Sprite;
    if (!sprite || !sprite.anims) return;

    const walkAnimKey = container.getData('walkAnimKey');
    if (walkAnimKey && this.anims.exists(walkAnimKey)) {
      sprite.play(walkAnimKey);
    }
  }

  /**
   * Stop walk animation and return to appropriate pose (AC5)
   */
  private stopWalkAnimation(container: Phaser.GameObjects.Container): void {
    const sprite = container.list[0] as Phaser.GameObjects.Sprite;
    if (!sprite || !sprite.anims) return;

    sprite.anims.stop();
    const status = container.getData('status') || 'idle';
    this.updateAgentPose(container, status);
  }

  private updateAgent(container: Phaser.GameObjects.Container, agent: Agent): void {
    const prevStatus = container.getData('status');

    if (prevStatus !== agent.status) {
      container.setData('status', agent.status);
      this.updateStatusIndicator(agent.agent_id, agent.status);

      // Update sprite pose based on new status (AC6, AC7)
      if (!container.getData('isMoving')) {
        this.updateAgentPose(container, agent.status);
      }

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

  /**
   * Update status indicator using speech bubbles (Story 6.5)
   * Replaces old text-based emoji indicators with styled bubbles
   */
  private updateStatusIndicator(agentId: string, status: string): void {
    const container = this.agents.get(agentId);
    if (!container) return;

    // Get existing bubble
    const existingBubble = this.speechBubbles.get(agentId);

    // Check if we should show a bubble for this status (AC1, AC6)
    if (!shouldShowBubble(status)) {
      // Hide bubble if exists (AC6 - IDLE state hides bubble)
      if (existingBubble) {
        hideBubble(this, existingBubble, () => {
          this.speechBubbles.delete(agentId);
        });
      }
      return;
    }

    // If bubble exists for same state, do nothing
    if (existingBubble && existingBubble.getData('bubbleState') === status) {
      return;
    }

    // Remove existing bubble before creating new one
    if (existingBubble) {
      // Quick hide without animation for state transitions
      this.tweens.killTweensOf(existingBubble);
      existingBubble.destroy();
      this.speechBubbles.delete(agentId);
    }

    // Create new speech bubble (AC1, AC2)
    const bubble = createSpeechBubble(this, status, container.x, container.y);
    if (bubble) {
      this.speechBubbles.set(agentId, bubble);
      // Show with pop-in animation (AC3) - float animation starts after pop-in (AC4)
      showBubble(this, bubble);
    }
  }

  private processMovement(movement: PendingMovement): void {
    const container = this.agents.get(movement.agent_id);
    if (!container) return;

    // Skip if already moving or if we've already processed this movement
    if (container.getData('isMoving')) return;
    if (container.getData('processedMovementId') === movement.id) return;

    // Use role-to-zone mapping for ChatDev-style layout (Story 6.4)
    // First try as a role (maps to zone), then try as a zone name directly
    const zoneName = ROLE_TO_ZONE[movement.to_zone as keyof typeof ROLE_TO_ZONE] || movement.to_zone;
    const toZonePos = ZONE_POSITIONS[zoneName as keyof typeof ZONE_POSITIONS];
    if (!toZonePos) return;

    container.setData('isMoving', true);
    container.setData('processedMovementId', movement.id);

    // Start walk animation (AC5)
    this.startWalkAnimation(container);

    // Flip sprite if walking left
    const sprite = container.list[0] as Phaser.GameObjects.Sprite;
    if (sprite && toZonePos.x < container.x) {
      sprite.setFlipX(true);
    } else if (sprite) {
      sprite.setFlipX(false);
    }

    // Walk to destination
    this.tweens.add({
      targets: container,
      x: toZonePos.x,
      y: toZonePos.y,
      duration: 1500,
      ease: 'Linear',
      onComplete: async () => {
        container.setData('isMoving', false);

        // Stop walk animation and return to appropriate pose (AC5)
        this.stopWalkAnimation(container);

        // Reset flip
        if (sprite) {
          sprite.setFlipX(false);
        }

        // If purpose is handoff, show artifact animation
        if (movement.purpose === 'handoff' && movement.artifact) {
          this.showHandoffAnimation(container, movement.artifact);
        }

        // Mark movement as complete in backend
        if (this.currentCompanyId && movement.id) {
          try {
            await apiService.completeMovement(this.currentCompanyId, movement.id);
          } catch (error) {
            console.error('Failed to complete movement:', error);
          }
        }

        // If this was a return movement, reset agent to idle animation
        if (movement.purpose === 'return') {
          this.updateStatusIndicator(movement.agent_id, 'idle');
          this.addIdleAnimation(container);
        }
      },
    });

    // Update speech bubble position (Story 6.5, Task 7.3)
    // Kill float animation to prevent y-position conflicts during movement
    const bubble = this.speechBubbles.get(movement.agent_id);
    if (bubble) {
      this.tweens.killTweensOf(bubble);
      this.tweens.add({
        targets: bubble,
        x: toZonePos.x,
        y: toZonePos.y + SPEECH_BUBBLE_CONFIG.offsetY,
        duration: 1500,
        ease: 'Linear',
        onComplete: () => {
          // Restart float animation after movement completes
          addFloatAnimation(this, bubble);
        },
      });
    }
  }

  private showHandoffAnimation(container: Phaser.GameObjects.Container, _artifact: string): void {
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
    // Remove highlight from all agents
    this.agents.forEach((a) => {
      const sprite = a.list[0] as Phaser.GameObjects.Sprite;
      if (sprite) {
        sprite.clearTint();
      }
    });

    // Add highlight tint to selected agent (AC9)
    const sprite = agent.list[0] as Phaser.GameObjects.Sprite;
    if (sprite) {
      sprite.setTint(0xfbbf24); // Golden highlight
    }

    // Emit event for activity log or other components
    const agentId = agent.getData('agentId');
    window.dispatchEvent(new CustomEvent('agentSelected', {
      detail: { agentId }
    }));
  }

  update(): void {
    // Update speech bubble X positions to follow agents (Story 6.5, Task 7.4)
    // Only update X to avoid conflicting with float animation's Y movement
    this.speechBubbles.forEach((bubble, agentId) => {
      const container = this.agents.get(agentId);
      if (container) {
        bubble.x = container.x;
      }
    });
  }
}
