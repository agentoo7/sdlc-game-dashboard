/**
 * SpriteGenerator - Procedural pixel art character sprite generation
 * Story 6.3: Pixel Art Character Sprites
 *
 * Generates cute chibi-style pixel art characters with:
 * - Colorful anime hair (6 color palette)
 * - Role-based outfit colors
 * - Multiple animation frames (idle, walk, working)
 */

import { ROLE_COLORS } from './constants';

// Hair color palette (AC2) - Vibrant anime-style colors
export const HAIR_COLORS = [
  0x60a5fa, // Blue
  0xa78bfa, // Purple
  0x4ade80, // Green
  0xf87171, // Red
  0xf472b6, // Pink
  0xa1887f, // Brown
] as const;

// Sprite dimensions (AC1)
export const SPRITE_WIDTH = 32;
export const SPRITE_HEIGHT = 48;
export const SPRITE_SCALE = 2; // Display at 64x96

// Skin tone
const SKIN_COLOR = 0xffdfc4;

// Pants/legs color
const PANTS_COLOR = 0x334155;

// Animation frame indices
export const FRAME_IDLE = 0;
export const FRAME_WALK_1 = 1;
export const FRAME_WALK_2 = 2;
export const FRAME_WALK_3 = 3;
export const FRAME_WALK_4 = 4;
export const FRAME_WORKING = 5;

// Total frames per sprite sheet
export const TOTAL_FRAMES = 6;

/**
 * Get hair color by agent index (cycles through palette)
 */
export function getHairColorByIndex(agentIndex: number): number {
  return HAIR_COLORS[agentIndex % HAIR_COLORS.length];
}

/**
 * Get outfit color by role
 */
export function getOutfitColorByRole(role: string): number {
  return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 0x64748b;
}

/**
 * Generate texture key for an agent sprite
 */
export function getSpriteKey(hairColorIndex: number, roleColor: number): string {
  return `agent-${hairColorIndex}-${roleColor.toString(16)}`;
}

/**
 * Draw pixel art chibi character on a Phaser Graphics object
 * Chibi proportions: Head ~42%, Body ~33%, Legs ~25%
 */
function drawCharacter(
  graphics: Phaser.GameObjects.Graphics,
  hairColor: number,
  outfitColor: number,
  offsetX: number = 0,
  isWalking: boolean = false,
  walkFrame: number = 0,
  isWorking: boolean = false
): void {
  const x = offsetX;

  // === LEGS (bottom, y: 36-48) ===
  graphics.fillStyle(PANTS_COLOR, 1);

  if (isWorking) {
    // Sitting pose - legs bent
    graphics.fillRect(x + 8, 38, 6, 10);
    graphics.fillRect(x + 18, 38, 6, 10);
  } else if (isWalking) {
    // Walking animation - alternating leg positions
    const legOffset = walkFrame % 2 === 0 ? 2 : -2;
    graphics.fillRect(x + 10 + legOffset, 36, 5, 12);
    graphics.fillRect(x + 17 - legOffset, 36, 5, 12);
  } else {
    // Idle pose - standing straight
    graphics.fillRect(x + 10, 36, 5, 12);
    graphics.fillRect(x + 17, 36, 5, 12);
  }

  // === BODY/OUTFIT (middle, y: 20-36) ===
  graphics.fillStyle(outfitColor, 1);

  if (isWorking) {
    // Sitting pose - body slightly shorter and hunched
    graphics.fillRect(x + 8, 22, 16, 16);
    // Arms forward (typing)
    graphics.fillRect(x + 4, 26, 6, 4);
    graphics.fillRect(x + 22, 26, 6, 4);
  } else {
    // Standing pose
    graphics.fillRect(x + 10, 20, 12, 16);
    // Arms at sides
    graphics.fillRect(x + 6, 22, 4, 10);
    graphics.fillRect(x + 22, 22, 4, 10);
  }

  // === HEAD (top, y: 0-22) ===
  // Face/skin
  graphics.fillStyle(SKIN_COLOR, 1);
  graphics.fillCircle(x + 16, 12, 10);

  // Hair (AC2, AC4 - colorful anime hair)
  graphics.fillStyle(hairColor, 1);
  // Hair top
  graphics.fillRect(x + 6, 2, 20, 8);
  // Hair sides (bangs)
  graphics.fillRect(x + 4, 6, 4, 8);
  graphics.fillRect(x + 24, 6, 4, 8);
  // Hair fringe
  graphics.fillRect(x + 8, 4, 4, 6);
  graphics.fillRect(x + 14, 3, 4, 5);
  graphics.fillRect(x + 20, 4, 4, 6);

  // === EYES (AC4 - Big expressive anime-style eyes) ===
  // Eye whites
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(x + 11, 12, 6, 7);
  graphics.fillEllipse(x + 21, 12, 6, 7);

  // Eye pupils (large)
  graphics.fillStyle(0x1e293b, 1);
  graphics.fillEllipse(x + 11, 13, 4, 5);
  graphics.fillEllipse(x + 21, 13, 4, 5);

  // Eye highlights (anime sparkle)
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(x + 12, 11, 1.5);
  graphics.fillCircle(x + 22, 11, 1.5);
  // Small secondary highlight
  graphics.fillCircle(x + 10, 14, 0.8);
  graphics.fillCircle(x + 20, 14, 0.8);

  // Small mouth
  graphics.fillStyle(0xf472b6, 1);
  if (isWorking) {
    // Focused expression - small line
    graphics.fillRect(x + 14, 18, 4, 1);
  } else {
    // Slight smile
    graphics.fillEllipse(x + 16, 18, 3, 1.5);
  }

  // Blush marks (cute anime style)
  graphics.fillStyle(0xfca5a5, 0.5);
  graphics.fillEllipse(x + 7, 15, 3, 2);
  graphics.fillEllipse(x + 25, 15, 3, 2);
}

/**
 * Generate a complete sprite sheet texture with all animation frames
 * Frame layout: [idle, walk1, walk2, walk3, walk4, working]
 */
export function generateSpriteSheet(
  scene: Phaser.Scene,
  hairColor: number,
  outfitColor: number,
  textureKey: string
): void {
  // Check if texture already exists
  if (scene.textures.exists(textureKey)) {
    return;
  }

  const graphics = scene.add.graphics();
  const totalWidth = SPRITE_WIDTH * TOTAL_FRAMES;

  // Frame 0: Idle pose
  drawCharacter(graphics, hairColor, outfitColor, 0, false, 0, false);

  // Frames 1-4: Walk cycle
  for (let i = 0; i < 4; i++) {
    drawCharacter(graphics, hairColor, outfitColor, SPRITE_WIDTH * (i + 1), true, i, false);
  }

  // Frame 5: Working/sitting pose
  drawCharacter(graphics, hairColor, outfitColor, SPRITE_WIDTH * 5, false, 0, true);

  // Generate texture from graphics
  graphics.generateTexture(textureKey, totalWidth, SPRITE_HEIGHT);
  graphics.destroy();

  // Add sprite sheet frames to texture
  const texture = scene.textures.get(textureKey);
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    texture.add(i, 0, i * SPRITE_WIDTH, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
  }
}

/**
 * Generate a single character sprite (idle pose only)
 * Simpler version for testing or static displays
 */
export function generateCharacterSprite(
  scene: Phaser.Scene,
  hairColor: number,
  outfitColor: number,
  textureKey: string
): void {
  // Check if texture already exists
  if (scene.textures.exists(textureKey)) {
    return;
  }

  const graphics = scene.add.graphics();
  drawCharacter(graphics, hairColor, outfitColor, 0, false, 0, false);
  graphics.generateTexture(textureKey, SPRITE_WIDTH, SPRITE_HEIGHT);
  graphics.destroy();
}

/**
 * Pre-generate all sprite variations for a set of agents
 * Call this in BootScene to cache all needed sprites
 */
export function preGenerateSprites(
  scene: Phaser.Scene,
  agentConfigs: Array<{ hairColorIndex: number; role: string }>
): void {
  const generatedKeys = new Set<string>();

  agentConfigs.forEach(({ hairColorIndex, role }) => {
    const hairColor = getHairColorByIndex(hairColorIndex);
    const outfitColor = getOutfitColorByRole(role);
    const key = getSpriteKey(hairColorIndex % HAIR_COLORS.length, outfitColor);

    if (!generatedKeys.has(key)) {
      generateSpriteSheet(scene, hairColor, outfitColor, key);
      generatedKeys.add(key);
    }
  });
}

/**
 * Create walk animation for a sprite
 */
export function createWalkAnimation(
  scene: Phaser.Scene,
  textureKey: string,
  animKey: string
): void {
  if (scene.anims.exists(animKey)) {
    return;
  }

  scene.anims.create({
    key: animKey,
    frames: [
      { key: textureKey, frame: FRAME_WALK_1 },
      { key: textureKey, frame: FRAME_WALK_2 },
      { key: textureKey, frame: FRAME_WALK_3 },
      { key: textureKey, frame: FRAME_WALK_4 },
    ],
    frameRate: 5, // 4 frames over 800ms = 5 fps (AC5)
    repeat: -1,
  });
}

/**
 * Create idle animation (single frame, breathing handled by tween)
 */
export function createIdleAnimation(
  scene: Phaser.Scene,
  textureKey: string,
  animKey: string
): void {
  if (scene.anims.exists(animKey)) {
    return;
  }

  scene.anims.create({
    key: animKey,
    frames: [{ key: textureKey, frame: FRAME_IDLE }],
    frameRate: 1,
    repeat: -1,
  });
}

/**
 * Create working animation (single frame)
 */
export function createWorkingAnimation(
  scene: Phaser.Scene,
  textureKey: string,
  animKey: string
): void {
  if (scene.anims.exists(animKey)) {
    return;
  }

  scene.anims.create({
    key: animKey,
    frames: [{ key: textureKey, frame: FRAME_WORKING }],
    frameRate: 1,
    repeat: -1,
  });
}
