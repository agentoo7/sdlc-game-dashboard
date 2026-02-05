/**
 * SpeechBubbleManager - Agent speech bubble creation and animation
 * Story 6.5: Agent Speech Bubbles
 *
 * Creates speech bubbles with icons indicating agent state:
 * - Rounded rectangle with tail pointing down
 * - State-specific icon and background color
 * - Pop-in/out and float animations
 */

// === SPEECH BUBBLE CONFIGURATION ===
export const SPEECH_BUBBLE_CONFIG = {
  // Bubble dimensions (AC1: 24x24px)
  width: 24,
  height: 24,
  borderRadius: 5,

  // Tail dimensions
  tailWidth: 6,
  tailHeight: 5,

  // Position relative to agent
  offsetY: -80,

  // Border
  borderWidth: 1,
  borderColor: 0x374151, // Gray-700

  // Icon positioning
  iconFontSize: '14px',
  iconOffsetY: -14, // Centered in bubble (height/2 + tailHeight/2)
} as const;

// === STATE TO ICON MAPPING (AC2) ===
export interface StateIconConfig {
  icon: string;
  bgColor: number;
}

export const STATE_TO_ICON: Record<string, StateIconConfig | null> = {
  // Core states
  thinking: { icon: '💡', bgColor: 0xFEF3C7 },     // Yellow-100
  working: { icon: '📝', bgColor: 0xDBEAFE },      // Blue-100
  executing: { icon: '⚡', bgColor: 0xFFEDD5 },    // Orange-100
  error: { icon: '⚠️', bgColor: 0xFEE2E2 },       // Red-100

  // Task states
  task_complete: { icon: '✅', bgColor: 0xDCFCE7 }, // Green-100

  // Communication states
  message_send: { icon: '💬', bgColor: 0xDBEAFE },    // Blue-100
  message_receive: { icon: '💬', bgColor: 0xDBEAFE }, // Blue-100

  // Feedback state
  feedback: { icon: '👍', bgColor: 0xDCFCE7 },     // Green-100

  // Walking state (no bubble, but included for completeness)
  walking: null,

  // IDLE state - no bubble (AC6)
  idle: null,
} as const;

// === ANIMATION CONFIGURATION ===
export const ANIMATION_CONFIG = {
  // Pop-in animation (AC3)
  popIn: {
    duration: 200,
    ease: 'Back.easeOut',
  },

  // Float animation (AC4)
  float: {
    duration: 1000,
    ease: 'Sine.easeInOut',
    yOffset: 3, // ±3px movement
  },

  // Pop-out animation (AC5)
  popOut: {
    duration: 150,
    ease: 'Quad.easeIn',
  },
} as const;

// === TEXTURE KEY ===
export const SPEECH_BUBBLE_TEXTURE_PREFIX = 'speech-bubble-';

/**
 * Generate speech bubble texture for a specific state
 * Creates a rounded rectangle with tail pointing down
 */
export function generateSpeechBubbleTexture(
  scene: Phaser.Scene,
  state: string,
  config: StateIconConfig
): string {
  const textureKey = `${SPEECH_BUBBLE_TEXTURE_PREFIX}${state}`;

  // Skip if texture already exists
  if (scene.textures.exists(textureKey)) {
    return textureKey;
  }

  const { width, height, borderRadius, tailWidth, tailHeight, borderWidth, borderColor } =
    SPEECH_BUBBLE_CONFIG;
  const totalHeight = height + tailHeight;

  const graphics = scene.add.graphics();

  // Draw bubble background
  graphics.fillStyle(config.bgColor, 1);

  // Main rounded rectangle
  graphics.fillRoundedRect(0, 0, width, height, borderRadius);

  // Tail (triangle pointing down)
  const tailX = width / 2;
  graphics.beginPath();
  graphics.moveTo(tailX - tailWidth / 2, height - 1);
  graphics.lineTo(tailX, height + tailHeight);
  graphics.lineTo(tailX + tailWidth / 2, height - 1);
  graphics.closePath();
  graphics.fill();

  // Draw border
  graphics.lineStyle(borderWidth, borderColor, 1);
  graphics.strokeRoundedRect(0, 0, width, height, borderRadius);

  // Border for tail
  graphics.beginPath();
  graphics.moveTo(tailX - tailWidth / 2, height);
  graphics.lineTo(tailX, height + tailHeight);
  graphics.lineTo(tailX + tailWidth / 2, height);
  graphics.stroke();

  // Generate texture
  graphics.generateTexture(textureKey, width, totalHeight);
  graphics.destroy();

  return textureKey;
}

/**
 * Pre-generate all speech bubble textures
 * Call this in BootScene
 */
export function preGenerateSpeechBubbleTextures(scene: Phaser.Scene): void {
  Object.entries(STATE_TO_ICON).forEach(([state, config]) => {
    if (config !== null) {
      generateSpeechBubbleTexture(scene, state, config);
    }
  });
}

/**
 * Create a speech bubble container for a given state
 * Returns null if state should not show a bubble (idle, walking)
 */
export function createSpeechBubble(
  scene: Phaser.Scene,
  state: string,
  x: number,
  y: number
): Phaser.GameObjects.Container | null {
  const config = STATE_TO_ICON[state];

  // No bubble for null states (idle, walking)
  if (!config) {
    return null;
  }

  // Ensure texture exists
  const textureKey = generateSpeechBubbleTexture(scene, state, config);

  // Create container at position with offset
  const container = scene.add.container(x, y + SPEECH_BUBBLE_CONFIG.offsetY);

  // Add bubble background image
  const bubble = scene.add.image(0, 0, textureKey);
  bubble.setOrigin(0.5, 1); // Anchor at bottom center (tail points down)
  container.add(bubble);

  // Add icon text (centered in bubble)
  const iconText = scene.add.text(0, SPEECH_BUBBLE_CONFIG.iconOffsetY, config.icon, {
    fontSize: SPEECH_BUBBLE_CONFIG.iconFontSize,
  }).setOrigin(0.5);
  container.add(iconText);

  // Set initial scale to 0 for pop-in animation
  container.setScale(0);

  // Store state for reference
  container.setData('bubbleState', state);

  return container;
}

/**
 * Show bubble with pop-in animation (AC3)
 * Scales from 0 to 1 with bounce effect
 */
export function showBubble(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  onComplete?: () => void
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: container,
    scaleX: 1,
    scaleY: 1,
    duration: ANIMATION_CONFIG.popIn.duration,
    ease: ANIMATION_CONFIG.popIn.ease,
    onComplete: () => {
      // Start float animation after pop-in
      addFloatAnimation(scene, container);
      onComplete?.();
    },
  });
}

/**
 * Add floating animation to bubble (AC4)
 * Subtle up/down motion while visible
 */
export function addFloatAnimation(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): Phaser.Tweens.Tween {
  const startY = container.y;

  return scene.tweens.add({
    targets: container,
    y: startY - ANIMATION_CONFIG.float.yOffset,
    duration: ANIMATION_CONFIG.float.duration,
    ease: ANIMATION_CONFIG.float.ease,
    yoyo: true,
    repeat: -1,
  });
}

/**
 * Hide bubble with pop-out animation (AC5)
 * Scales from 1 to 0 and destroys container
 */
export function hideBubble(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  onComplete?: () => void
): Phaser.Tweens.Tween {
  // Stop any existing tweens on this container
  scene.tweens.killTweensOf(container);

  return scene.tweens.add({
    targets: container,
    scaleX: 0,
    scaleY: 0,
    duration: ANIMATION_CONFIG.popOut.duration,
    ease: ANIMATION_CONFIG.popOut.ease,
    onComplete: () => {
      container.destroy();
      onComplete?.();
    },
  });
}

/**
 * Update bubble position (for tracking agent movement)
 */
export function updateBubblePosition(
  container: Phaser.GameObjects.Container,
  x: number,
  y: number
): void {
  container.x = x;
  container.y = y + SPEECH_BUBBLE_CONFIG.offsetY;
}

/**
 * Check if a state should show a speech bubble
 */
export function shouldShowBubble(state: string): boolean {
  const config = STATE_TO_ICON[state];
  return config !== null && config !== undefined;
}

/**
 * Get icon for a state (for backwards compatibility)
 */
export function getStateIcon(state: string): string | null {
  const config = STATE_TO_ICON[state];
  return config?.icon ?? null;
}
