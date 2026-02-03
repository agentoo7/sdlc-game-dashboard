import { Scene } from 'phaser';
import { ROLE_COLORS, ZONE_POSITIONS } from '@/utils/constants';

export class MainScene extends Scene {
  private agents: Map<string, Phaser.GameObjects.Container> = new Map();
  private zones: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    console.log('MainScene: Creating game world');

    // Set world bounds for camera
    this.cameras.main.setBounds(-500, -500, 2000, 2000);

    // Enable camera controls
    this.setupCameraControls();

    // Create office layout
    this.createOfficeLayout();

    // Create placeholder agents for demo
    this.createPlaceholderAgents();

    // Center camera on office
    this.cameras.main.centerOn(400, 400);
  }

  private setupCameraControls(): void {
    // Zoom with scroll wheel
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown[], _deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(zoom - deltaY * 0.001, 0.5, 2);
      this.cameras.main.setZoom(newZoom);
    });

    // Pan with drag
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown() || pointer.rightButtonDown()) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
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
    // Create floor grid (simple rectangles for now)
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

      // Zone rectangle
      const zone = this.add.rectangle(pos.x, pos.y, 180, 120, color, 0.2);
      zone.setStrokeStyle(2, color);
      this.zones.set(role, zone);

      // Zone label
      this.add.text(pos.x, pos.y - 40, role.toUpperCase(), {
        fontSize: '14px',
        color: '#F8FAFC',
        fontFamily: 'Inter',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  private createPlaceholderAgents(): void {
    // Demo agents - will be replaced with API data
    const demoAgents = [
      { id: 'BA-001', role: 'ba', name: 'Alice' },
      { id: 'Dev-001', role: 'developer', name: 'Bob' },
      { id: 'Dev-002', role: 'developer', name: 'Charlie' },
      { id: 'QA-001', role: 'qa', name: 'Diana' },
      { id: 'PM-001', role: 'pm', name: 'Eve' },
      { id: 'Arch-001', role: 'architect', name: 'Frank' },
    ];

    demoAgents.forEach((agent, index) => {
      this.createAgent(agent.id, agent.role, index);
    });
  }

  private createAgent(agentId: string, role: string, index: number): void {
    const pos = ZONE_POSITIONS[role as keyof typeof ZONE_POSITIONS] || ZONE_POSITIONS.developer;
    const color = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 0x64748B;

    // Offset for multiple agents in same zone
    const offsetX = (index % 3) * 50 - 50;
    const offsetY = Math.floor(index / 3) * 40;

    // Agent container
    const container = this.add.container(pos.x + offsetX, pos.y + offsetY);

    // Agent body (circle placeholder - will be sprite later)
    const body = this.add.circle(0, 0, 20, color);
    body.setStrokeStyle(2, 0xFFFFFF);

    // Agent label
    const label = this.add.text(0, -35, agentId, {
      fontSize: '11px',
      color: '#F8FAFC',
      fontFamily: 'JetBrains Mono',
      backgroundColor: '#0F172A',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    // Role letter inside circle
    const letter = this.add.text(0, 0, role.charAt(0).toUpperCase(), {
      fontSize: '16px',
      color: '#FFFFFF',
      fontFamily: 'Inter',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([body, label, letter]);

    // Make interactive
    body.setInteractive({ useHandCursor: true });
    body.on('pointerdown', () => {
      console.log(`Clicked agent: ${agentId}`);
      this.highlightAgent(container);
    });

    this.agents.set(agentId, container);
  }

  private highlightAgent(agent: Phaser.GameObjects.Container): void {
    // Remove previous highlights
    this.agents.forEach((a) => {
      const body = a.list[0] as Phaser.GameObjects.Arc;
      body.setStrokeStyle(2, 0xFFFFFF);
    });

    // Highlight selected agent
    const body = agent.list[0] as Phaser.GameObjects.Arc;
    body.setStrokeStyle(3, 0xFBBF24); // Amber highlight
  }

  update(): void {
    // Will be used for animations and state updates
  }
}
