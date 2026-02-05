/**
 * OfficeRenderer - Procedural office element generation
 * Story 6.4: ChatDev-Style Office Layout
 *
 * Generates pixel art office elements:
 * - Wooden floor texture
 * - Department signs with wooden poles
 * - Company carpet/rug
 * - Pixel art desks with computers
 * - Decorative plants
 */

// === COLOR PALETTE ===
export const OFFICE_COLORS = {
  // Wooden floor
  floorBase: 0x8B7355,      // Warm brown
  floorGrain: 0x6B5344,     // Dark brown grain
  floorHighlight: 0x9B8365, // Lighter plank variation

  // Wooden pole/sign
  pole: 0x6B4423,           // Dark wood
  signBoard: 0xA0855C,      // Light wood
  signText: 0x3D2B1F,       // Very dark text

  // Desk
  deskSurface: 0x8B6914,    // Wood brown
  deskLegs: 0x5D4037,       // Dark brown
  monitorFrame: 0x607D8B,   // Gray
  monitorScreen: 0x1E90FF,  // Blue screen

  // Plant
  plantPot: 0xCD5C5C,       // Terracotta
  plantLeaves: 0x228B22,    // Forest green
  plantLight: 0x32CD32,     // Lime green highlight

  // Carpet
  carpetBorder: 0x8B0000,   // Dark red
  carpetInner: 0xB22222,    // Firebrick red
  carpetFringe: 0xDEB887,   // Burlywood
} as const;

// === TEXTURE KEYS ===
export const OFFICE_TEXTURE_KEYS = {
  woodenFloor: 'office-wooden-floor',
  desk: 'office-desk',
  plantSmall: 'office-plant-small',
  plantLarge: 'office-plant-large',
} as const;

// === DIMENSIONS ===
export const FLOOR_TILE_SIZE = 64;
export const DESK_WIDTH = 48;
export const DESK_HEIGHT = 32;
export const PLANT_SMALL_SIZE = 16;
export const PLANT_LARGE_SIZE = 24;

// === OFFICE LAYOUT DIMENSIONS (Story 6.4) ===
export const OFFICE_LAYOUT = {
  // Floor dimensions
  floorWidth: 900,
  floorHeight: 700,
  floorStartX: -50,
  floorStartY: -50,

  // Carpet position (center of 2x2 grid)
  carpetCenterX: 400,
  carpetCenterY: 350,
  carpetWidth: 200,
  carpetHeight: 80,

  // Zone dimensions
  zoneWidth: 320,
  zoneHeight: 260,

  // Desk offsets within zones
  deskOffsets: [
    { x: -60, y: 20 },
    { x: 60, y: 20 },
  ],
  deskScale: 1.5,

  // Plant positions
  cornerPlantPositions: [
    { x: 40, y: 40 },     // Top-left
    { x: 760, y: 40 },    // Top-right
    { x: 40, y: 620 },    // Bottom-left
    { x: 760, y: 620 },   // Bottom-right
  ],
  dividerPlantPositions: [
    { x: 400, y: 120 },   // Between top zones
    { x: 400, y: 580 },   // Between bottom zones
    { x: 80, y: 350 },    // Left side
    { x: 720, y: 350 },   // Right side
  ],
  plantScale: 2,

  // Shadow dimensions
  shadowOffsetX: -20,
  shadowOffsetY: -20,
  shadowWidth: 840,
  shadowHeight: 680,
} as const;

// === ZONE COLORS (for department backgrounds) ===
export const ZONE_BACKGROUND_COLORS: Record<string, number> = {
  designing: 0x3B82F6,    // Blue
  documenting: 0xF97316,  // Orange
  coding: 0x22C55E,       // Green
  testing: 0xEF4444,      // Red
} as const;

/**
 * Generate wooden floor texture with plank pattern
 * Creates a tiled texture for the entire office floor
 */
export function generateWoodenFloorTexture(scene: Phaser.Scene): void {
  const key = OFFICE_TEXTURE_KEYS.woodenFloor;
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();
  const tileSize = FLOOR_TILE_SIZE;
  const plankWidth = 12;
  const numPlanks = Math.ceil(tileSize / plankWidth);

  // Draw wooden planks
  for (let i = 0; i < numPlanks; i++) {
    // Alternate between base color and highlight for variation
    const shade = i % 3 === 0
      ? OFFICE_COLORS.floorHighlight
      : OFFICE_COLORS.floorBase;

    graphics.fillStyle(shade, 1);
    const plankX = i * plankWidth;
    graphics.fillRect(plankX, 0, plankWidth - 1, tileSize);

    // Grain lines (vertical dark lines on planks)
    graphics.lineStyle(1, OFFICE_COLORS.floorGrain, 0.4);
    graphics.lineBetween(plankX + 3, 0, plankX + 3, tileSize);
    graphics.lineBetween(plankX + 7, 0, plankX + 7, tileSize);

    // Horizontal grain variation
    graphics.lineStyle(1, OFFICE_COLORS.floorGrain, 0.2);
    for (let y = 10; y < tileSize; y += 20) {
      const grainOffset = (i % 2) * 10;
      graphics.lineBetween(plankX + 1, y + grainOffset, plankX + plankWidth - 2, y + grainOffset);
    }
  }

  // Add subtle border between tiles
  graphics.lineStyle(1, OFFICE_COLORS.floorGrain, 0.3);
  graphics.strokeRect(0, 0, tileSize, tileSize);

  graphics.generateTexture(key, tileSize, tileSize);
  graphics.destroy();
}

/**
 * Generate pixel art desk with computer monitor
 */
export function generateDeskTexture(scene: Phaser.Scene): void {
  const key = OFFICE_TEXTURE_KEYS.desk;
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();

  // Desk surface (top-down isometric-ish view)
  graphics.fillStyle(OFFICE_COLORS.deskSurface, 1);
  graphics.fillRect(0, 12, DESK_WIDTH, 16);

  // Desk surface top edge (lighter)
  graphics.fillStyle(0x9B7918, 1);
  graphics.fillRect(0, 12, DESK_WIDTH, 3);

  // Desk legs
  graphics.fillStyle(OFFICE_COLORS.deskLegs, 1);
  graphics.fillRect(4, 28, 6, 4);
  graphics.fillRect(DESK_WIDTH - 10, 28, 6, 4);

  // Computer monitor
  // Monitor frame
  graphics.fillStyle(OFFICE_COLORS.monitorFrame, 1);
  graphics.fillRect(14, 0, 20, 14);

  // Monitor screen
  graphics.fillStyle(OFFICE_COLORS.monitorScreen, 1);
  graphics.fillRect(16, 2, 16, 10);

  // Screen highlight
  graphics.fillStyle(0x87CEEB, 0.5);
  graphics.fillRect(17, 3, 4, 3);

  // Monitor stand
  graphics.fillStyle(OFFICE_COLORS.monitorFrame, 1);
  graphics.fillRect(22, 14, 4, 3);
  graphics.fillRect(18, 17, 12, 2);

  // Keyboard
  graphics.fillStyle(0x404040, 1);
  graphics.fillRect(16, 22, 16, 4);

  // Keyboard keys
  graphics.fillStyle(0x606060, 1);
  for (let kx = 0; kx < 7; kx++) {
    graphics.fillRect(17 + kx * 2, 23, 1, 2);
  }

  graphics.generateTexture(key, DESK_WIDTH, DESK_HEIGHT);
  graphics.destroy();
}

/**
 * Generate small decorative plant (16x16)
 */
export function generateSmallPlantTexture(scene: Phaser.Scene): void {
  const key = OFFICE_TEXTURE_KEYS.plantSmall;
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();
  const size = PLANT_SMALL_SIZE;

  // Pot
  graphics.fillStyle(OFFICE_COLORS.plantPot, 1);
  graphics.fillRect(4, 10, 8, 6);

  // Pot rim
  graphics.fillStyle(0xB5484A, 1);
  graphics.fillRect(3, 9, 10, 2);

  // Soil
  graphics.fillStyle(0x4A3728, 1);
  graphics.fillRect(5, 9, 6, 2);

  // Leaves (simple bush shape)
  graphics.fillStyle(OFFICE_COLORS.plantLeaves, 1);
  graphics.fillCircle(8, 6, 5);
  graphics.fillCircle(5, 5, 3);
  graphics.fillCircle(11, 5, 3);

  // Leaf highlights
  graphics.fillStyle(OFFICE_COLORS.plantLight, 1);
  graphics.fillCircle(7, 4, 2);
  graphics.fillCircle(10, 3, 1.5);

  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

/**
 * Generate large decorative plant (24x32)
 */
export function generateLargePlantTexture(scene: Phaser.Scene): void {
  const key = OFFICE_TEXTURE_KEYS.plantLarge;
  if (scene.textures.exists(key)) return;

  const graphics = scene.add.graphics();

  // Large pot
  graphics.fillStyle(OFFICE_COLORS.plantPot, 1);
  graphics.fillRect(6, 22, 12, 10);
  graphics.fillRect(4, 20, 16, 3);

  // Pot rim
  graphics.fillStyle(0xB5484A, 1);
  graphics.fillRect(3, 18, 18, 3);

  // Soil
  graphics.fillStyle(0x4A3728, 1);
  graphics.fillRect(6, 18, 12, 3);

  // Stem
  graphics.fillStyle(0x2E8B2E, 1);
  graphics.fillRect(11, 10, 2, 10);

  // Leaves (multiple layers)
  graphics.fillStyle(OFFICE_COLORS.plantLeaves, 1);
  // Main foliage
  graphics.fillCircle(12, 8, 8);
  graphics.fillCircle(6, 6, 5);
  graphics.fillCircle(18, 6, 5);
  graphics.fillCircle(12, 2, 4);

  // Highlights
  graphics.fillStyle(OFFICE_COLORS.plantLight, 1);
  graphics.fillCircle(10, 5, 3);
  graphics.fillCircle(15, 3, 2);
  graphics.fillCircle(7, 3, 2);

  graphics.generateTexture(key, 24, 32);
  graphics.destroy();
}

/**
 * Draw a department sign directly on scene at given position
 * @param scene - Phaser scene
 * @param x - X position
 * @param y - Y position
 * @param label - Zone name (e.g., "DESIGNING")
 * @param depth - Rendering depth (default 5)
 * @returns Container with sign elements
 */
export function drawDepartmentSign(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  depth: number = 5
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  container.setDepth(depth);

  // Wooden pole
  const poleGraphics = scene.add.graphics();
  poleGraphics.fillStyle(OFFICE_COLORS.pole, 1);
  poleGraphics.fillRect(-4, -60, 8, 70);

  // Pole highlight
  poleGraphics.fillStyle(0x7B5433, 1);
  poleGraphics.fillRect(-2, -60, 2, 70);

  // Sign board
  poleGraphics.fillStyle(OFFICE_COLORS.signBoard, 1);
  poleGraphics.fillRoundedRect(-50, -80, 100, 30, 4);

  // Sign board border
  poleGraphics.lineStyle(2, OFFICE_COLORS.pole, 1);
  poleGraphics.strokeRoundedRect(-50, -80, 100, 30, 4);

  container.add(poleGraphics);

  // Sign text
  const text = scene.add.text(0, -65, label, {
    fontSize: '14px',
    fontFamily: 'JetBrains Mono, monospace',
    color: '#3D2B1F',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  container.add(text);

  return container;
}

/**
 * Draw company carpet/rug in center of office
 * @param scene - Phaser scene
 * @param x - Center X position
 * @param y - Center Y position
 * @param companyName - Company name to display
 * @param width - Carpet width
 * @param height - Carpet height
 * @param depth - Rendering depth
 * @returns Container with carpet elements
 */
export function drawCompanyCarpet(
  scene: Phaser.Scene,
  x: number,
  y: number,
  companyName: string,
  width: number = 200,
  height: number = 100,
  depth: number = 1
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  container.setDepth(depth);

  const graphics = scene.add.graphics();

  // Carpet fringe (outer edge)
  graphics.fillStyle(OFFICE_COLORS.carpetFringe, 1);
  graphics.fillRoundedRect(-width/2 - 8, -height/2 - 8, width + 16, height + 16, 8);

  // Carpet border
  graphics.fillStyle(OFFICE_COLORS.carpetBorder, 1);
  graphics.fillRoundedRect(-width/2, -height/2, width, height, 6);

  // Inner carpet
  graphics.fillStyle(OFFICE_COLORS.carpetInner, 1);
  graphics.fillRoundedRect(-width/2 + 10, -height/2 + 10, width - 20, height - 20, 4);

  // Decorative pattern (diamond shapes)
  graphics.fillStyle(OFFICE_COLORS.carpetBorder, 0.6);
  const diamondSize = 15;
  for (let dx = -width/2 + 30; dx < width/2 - 20; dx += 40) {
    for (let dy = -height/2 + 25; dy < height/2 - 15; dy += 30) {
      // Skip center area for company name
      if (Math.abs(dx) < 60 && Math.abs(dy) < 15) continue;

      graphics.beginPath();
      graphics.moveTo(dx, dy - diamondSize/2);
      graphics.lineTo(dx + diamondSize/2, dy);
      graphics.lineTo(dx, dy + diamondSize/2);
      graphics.lineTo(dx - diamondSize/2, dy);
      graphics.closePath();
      graphics.fill();
    }
  }

  container.add(graphics);

  // Company name text
  const nameText = scene.add.text(0, 0, companyName, {
    fontSize: '16px',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#FFEFD5',
    fontStyle: 'bold',
  }).setOrigin(0.5);
  container.add(nameText);

  return container;
}

/**
 * Pre-generate all office textures
 * Call this in BootScene alongside character sprites
 */
export function preGenerateOfficeTextures(scene: Phaser.Scene): void {
  console.log('OfficeRenderer: Generating office textures');

  generateWoodenFloorTexture(scene);
  generateDeskTexture(scene);
  generateSmallPlantTexture(scene);
  generateLargePlantTexture(scene);

  console.log('OfficeRenderer: Office textures generated');
}
