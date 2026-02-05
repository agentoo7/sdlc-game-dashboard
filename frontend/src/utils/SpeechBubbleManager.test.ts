/**
 * SpeechBubbleManager Tests
 * Story 6.5: Agent Speech Bubbles
 */
import { describe, it, expect, vi } from 'vitest';
import {
  SPEECH_BUBBLE_CONFIG,
  STATE_TO_ICON,
  ANIMATION_CONFIG,
  SPEECH_BUBBLE_TEXTURE_PREFIX,
  generateSpeechBubbleTexture,
  preGenerateSpeechBubbleTextures,
  createSpeechBubble,
  showBubble,
  addFloatAnimation,
  hideBubble,
  updateBubblePosition,
  shouldShowBubble,
  getStateIcon,
} from './SpeechBubbleManager';

// Mock Phaser objects
const createMockGraphics = () => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  beginPath: vi.fn().mockReturnThis(),
  moveTo: vi.fn().mockReturnThis(),
  lineTo: vi.fn().mockReturnThis(),
  closePath: vi.fn().mockReturnThis(),
  fill: vi.fn().mockReturnThis(),
  stroke: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  generateTexture: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

const createMockImage = () => ({
  setOrigin: vi.fn().mockReturnThis(),
});

const createMockText = () => ({
  setOrigin: vi.fn().mockReturnThis(),
});

const createMockContainer = () => ({
  add: vi.fn(),
  setScale: vi.fn().mockReturnThis(),
  setData: vi.fn().mockReturnThis(),
  getData: vi.fn(),
  destroy: vi.fn(),
  x: 0,
  y: 0,
});

const createMockTween = () => ({
  on: vi.fn().mockReturnThis(),
});

const createMockScene = (textureExists = false) => ({
  add: {
    graphics: vi.fn(() => createMockGraphics()),
    image: vi.fn(() => createMockImage()),
    text: vi.fn(() => createMockText()),
    container: vi.fn(() => createMockContainer()),
  },
  textures: {
    exists: vi.fn(() => textureExists),
  },
  tweens: {
    add: vi.fn(() => createMockTween()),
    killTweensOf: vi.fn(),
  },
});

describe('SpeechBubbleManager', () => {
  // === SPEECH_BUBBLE_CONFIG Tests ===
  describe('SPEECH_BUBBLE_CONFIG', () => {
    it('should have correct bubble dimensions (AC1: 24x24px)', () => {
      expect(SPEECH_BUBBLE_CONFIG.width).toBe(24);
      expect(SPEECH_BUBBLE_CONFIG.height).toBe(24);
      expect(SPEECH_BUBBLE_CONFIG.borderRadius).toBe(5);
    });

    it('should have correct tail dimensions', () => {
      expect(SPEECH_BUBBLE_CONFIG.tailWidth).toBe(6);
      expect(SPEECH_BUBBLE_CONFIG.tailHeight).toBe(5);
    });

    it('should have correct offset for positioning above agent', () => {
      expect(SPEECH_BUBBLE_CONFIG.offsetY).toBe(-80);
    });

    it('should have border configuration', () => {
      expect(SPEECH_BUBBLE_CONFIG.borderWidth).toBe(1);
      expect(SPEECH_BUBBLE_CONFIG.borderColor).toBe(0x374151);
    });

    it('should have icon configuration', () => {
      expect(SPEECH_BUBBLE_CONFIG.iconFontSize).toBe('14px');
      expect(SPEECH_BUBBLE_CONFIG.iconOffsetY).toBe(-14);
    });
  });

  // === STATE_TO_ICON Tests (AC2) ===
  describe('STATE_TO_ICON', () => {
    it('should have icon for THINKING state with yellow background', () => {
      expect(STATE_TO_ICON.thinking).toEqual({
        icon: '💡',
        bgColor: 0xFEF3C7,
      });
    });

    it('should have icon for WORKING state with blue background', () => {
      expect(STATE_TO_ICON.working).toEqual({
        icon: '📝',
        bgColor: 0xDBEAFE,
      });
    });

    it('should have icon for EXECUTING state with orange background', () => {
      expect(STATE_TO_ICON.executing).toEqual({
        icon: '⚡',
        bgColor: 0xFFEDD5,
      });
    });

    it('should have icon for TASK_COMPLETE state with green background', () => {
      expect(STATE_TO_ICON.task_complete).toEqual({
        icon: '✅',
        bgColor: 0xDCFCE7,
      });
    });

    it('should have icon for ERROR state with red background', () => {
      expect(STATE_TO_ICON.error).toEqual({
        icon: '⚠️',
        bgColor: 0xFEE2E2,
      });
    });

    it('should have icon for MESSAGE_SEND state with blue background', () => {
      expect(STATE_TO_ICON.message_send).toEqual({
        icon: '💬',
        bgColor: 0xDBEAFE,
      });
    });

    it('should have icon for MESSAGE_RECEIVE state with blue background', () => {
      expect(STATE_TO_ICON.message_receive).toEqual({
        icon: '💬',
        bgColor: 0xDBEAFE,
      });
    });

    it('should have icon for FEEDBACK state with green background', () => {
      expect(STATE_TO_ICON.feedback).toEqual({
        icon: '👍',
        bgColor: 0xDCFCE7,
      });
    });

    it('should NOT have bubble for IDLE state (AC6)', () => {
      expect(STATE_TO_ICON.idle).toBeNull();
    });

    it('should NOT have bubble for WALKING state', () => {
      expect(STATE_TO_ICON.walking).toBeNull();
    });

    it('should cover all required states from AC2', () => {
      const requiredStates = [
        'thinking',
        'working',
        'executing',
        'task_complete',
        'error',
        'message_send',
        'message_receive',
        'feedback',
        'idle',
      ];

      requiredStates.forEach((state) => {
        expect(STATE_TO_ICON).toHaveProperty(state);
      });
    });
  });

  // === ANIMATION_CONFIG Tests ===
  describe('ANIMATION_CONFIG', () => {
    it('should have pop-in animation config (AC3)', () => {
      expect(ANIMATION_CONFIG.popIn).toEqual({
        duration: 200,
        ease: 'Back.easeOut',
      });
    });

    it('should have float animation config (AC4)', () => {
      expect(ANIMATION_CONFIG.float).toEqual({
        duration: 1000,
        ease: 'Sine.easeInOut',
        yOffset: 3,
      });
    });

    it('should have pop-out animation config (AC5)', () => {
      expect(ANIMATION_CONFIG.popOut).toEqual({
        duration: 150,
        ease: 'Quad.easeIn',
      });
    });
  });

  // === generateSpeechBubbleTexture Tests ===
  describe('generateSpeechBubbleTexture', () => {
    it('should generate texture with correct key', () => {
      const mockScene = createMockScene(false);
      const config = STATE_TO_ICON.thinking!;

      const textureKey = generateSpeechBubbleTexture(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        config
      );

      expect(textureKey).toBe(`${SPEECH_BUBBLE_TEXTURE_PREFIX}thinking`);
    });

    it('should skip generation if texture already exists', () => {
      const mockScene = createMockScene(true);
      const config = STATE_TO_ICON.thinking!;

      generateSpeechBubbleTexture(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        config
      );

      expect(mockScene.add.graphics).not.toHaveBeenCalled();
    });

    it('should create graphics and generate texture', () => {
      const mockScene = createMockScene(false);
      const mockGraphics = createMockGraphics();
      mockScene.add.graphics = vi.fn(() => mockGraphics);
      const config = STATE_TO_ICON.thinking!;

      generateSpeechBubbleTexture(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        config
      );

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockGraphics.fillStyle).toHaveBeenCalledWith(config.bgColor, 1);
      expect(mockGraphics.fillRoundedRect).toHaveBeenCalled();
      expect(mockGraphics.generateTexture).toHaveBeenCalled();
      expect(mockGraphics.destroy).toHaveBeenCalled();
    });
  });

  // === preGenerateSpeechBubbleTextures Tests ===
  describe('preGenerateSpeechBubbleTextures', () => {
    it('should generate textures for all non-null states', () => {
      const mockScene = createMockScene(false);

      preGenerateSpeechBubbleTextures(mockScene as unknown as Phaser.Scene);

      // Count non-null states
      const nonNullStates = Object.values(STATE_TO_ICON).filter((v) => v !== null);
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(nonNullStates.length);
    });
  });

  // === createSpeechBubble Tests ===
  describe('createSpeechBubble', () => {
    it('should return null for idle state (AC6)', () => {
      const mockScene = createMockScene(true);

      const bubble = createSpeechBubble(
        mockScene as unknown as Phaser.Scene,
        'idle',
        100,
        200
      );

      expect(bubble).toBeNull();
    });

    it('should return null for walking state', () => {
      const mockScene = createMockScene(true);

      const bubble = createSpeechBubble(
        mockScene as unknown as Phaser.Scene,
        'walking',
        100,
        200
      );

      expect(bubble).toBeNull();
    });

    it('should create container for valid state', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();
      mockScene.add.container = vi.fn(() => mockContainer);

      const bubble = createSpeechBubble(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        100,
        200
      );

      expect(bubble).not.toBeNull();
      expect(mockScene.add.container).toHaveBeenCalledWith(
        100,
        200 + SPEECH_BUBBLE_CONFIG.offsetY
      );
    });

    it('should set initial scale to 0 for pop-in animation', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();
      mockScene.add.container = vi.fn(() => mockContainer);

      createSpeechBubble(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        100,
        200
      );

      expect(mockContainer.setScale).toHaveBeenCalledWith(0);
    });

    it('should add bubble image and icon text to container', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();
      mockScene.add.container = vi.fn(() => mockContainer);

      createSpeechBubble(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        100,
        200
      );

      expect(mockScene.add.image).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalled();
      expect(mockContainer.add).toHaveBeenCalledTimes(2); // image + text
    });

    it('should store bubble state as data', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();
      mockScene.add.container = vi.fn(() => mockContainer);

      createSpeechBubble(
        mockScene as unknown as Phaser.Scene,
        'thinking',
        100,
        200
      );

      expect(mockContainer.setData).toHaveBeenCalledWith('bubbleState', 'thinking');
    });
  });

  // === showBubble Tests (AC3) ===
  describe('showBubble', () => {
    it('should create tween with pop-in animation config', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();

      showBubble(mockScene as unknown as Phaser.Scene, mockContainer as unknown as Phaser.GameObjects.Container);

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockContainer,
          scaleX: 1,
          scaleY: 1,
          duration: ANIMATION_CONFIG.popIn.duration,
          ease: ANIMATION_CONFIG.popIn.ease,
        })
      );
    });

    it('should call onComplete callback when provided', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();
      const onComplete = vi.fn();

      // Capture the tween config
      let tweenConfig: Record<string, unknown> = {};
      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockImplementation((config: Record<string, unknown>) => {
        tweenConfig = config;
        return createMockTween();
      });

      showBubble(
        mockScene as unknown as Phaser.Scene,
        mockContainer as unknown as Phaser.GameObjects.Container,
        onComplete
      );

      // Simulate tween completion
      if (tweenConfig.onComplete) {
        (tweenConfig.onComplete as () => void)();
      }

      expect(onComplete).toHaveBeenCalled();
    });
  });

  // === addFloatAnimation Tests (AC4) ===
  describe('addFloatAnimation', () => {
    it('should create tween with float animation config', () => {
      const mockScene = createMockScene(true);
      const mockContainer = { ...createMockContainer(), y: 100 };

      addFloatAnimation(
        mockScene as unknown as Phaser.Scene,
        mockContainer as unknown as Phaser.GameObjects.Container
      );

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockContainer,
          y: 100 - ANIMATION_CONFIG.float.yOffset,
          duration: ANIMATION_CONFIG.float.duration,
          ease: ANIMATION_CONFIG.float.ease,
          yoyo: true,
          repeat: -1,
        })
      );
    });
  });

  // === hideBubble Tests (AC5) ===
  describe('hideBubble', () => {
    it('should kill existing tweens before hiding', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();

      hideBubble(
        mockScene as unknown as Phaser.Scene,
        mockContainer as unknown as Phaser.GameObjects.Container
      );

      expect(mockScene.tweens.killTweensOf).toHaveBeenCalledWith(mockContainer);
    });

    it('should create tween with pop-out animation config', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();

      hideBubble(
        mockScene as unknown as Phaser.Scene,
        mockContainer as unknown as Phaser.GameObjects.Container
      );

      expect(mockScene.tweens.add).toHaveBeenCalledWith(
        expect.objectContaining({
          targets: mockContainer,
          scaleX: 0,
          scaleY: 0,
          duration: ANIMATION_CONFIG.popOut.duration,
          ease: ANIMATION_CONFIG.popOut.ease,
        })
      );
    });

    it('should destroy container on completion', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();

      // Capture the tween config
      let tweenConfig: Record<string, unknown> = {};
      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockImplementation((config: Record<string, unknown>) => {
        tweenConfig = config;
        return createMockTween();
      });

      hideBubble(
        mockScene as unknown as Phaser.Scene,
        mockContainer as unknown as Phaser.GameObjects.Container
      );

      // Simulate tween completion
      if (tweenConfig.onComplete) {
        (tweenConfig.onComplete as () => void)();
      }

      expect(mockContainer.destroy).toHaveBeenCalled();
    });

    it('should call onComplete callback when provided', () => {
      const mockScene = createMockScene(true);
      const mockContainer = createMockContainer();
      const onComplete = vi.fn();

      // Capture the tween config
      let tweenConfig: Record<string, unknown> = {};
      (mockScene.tweens.add as ReturnType<typeof vi.fn>).mockImplementation((config: Record<string, unknown>) => {
        tweenConfig = config;
        return createMockTween();
      });

      hideBubble(
        mockScene as unknown as Phaser.Scene,
        mockContainer as unknown as Phaser.GameObjects.Container,
        onComplete
      );

      // Simulate tween completion
      if (tweenConfig.onComplete) {
        (tweenConfig.onComplete as () => void)();
      }

      expect(onComplete).toHaveBeenCalled();
    });
  });

  // === updateBubblePosition Tests ===
  describe('updateBubblePosition', () => {
    it('should update container position with offset', () => {
      const mockContainer = { x: 0, y: 0 } as Phaser.GameObjects.Container;

      updateBubblePosition(mockContainer, 100, 200);

      expect(mockContainer.x).toBe(100);
      expect(mockContainer.y).toBe(200 + SPEECH_BUBBLE_CONFIG.offsetY);
    });
  });

  // === shouldShowBubble Tests ===
  describe('shouldShowBubble', () => {
    it('should return true for states with icons', () => {
      expect(shouldShowBubble('thinking')).toBe(true);
      expect(shouldShowBubble('working')).toBe(true);
      expect(shouldShowBubble('executing')).toBe(true);
      expect(shouldShowBubble('error')).toBe(true);
      expect(shouldShowBubble('task_complete')).toBe(true);
      expect(shouldShowBubble('message_send')).toBe(true);
      expect(shouldShowBubble('feedback')).toBe(true);
    });

    it('should return false for idle state', () => {
      expect(shouldShowBubble('idle')).toBe(false);
    });

    it('should return false for walking state', () => {
      expect(shouldShowBubble('walking')).toBe(false);
    });

    it('should return false for unknown states', () => {
      expect(shouldShowBubble('unknown_state')).toBe(false);
    });
  });

  // === getStateIcon Tests ===
  describe('getStateIcon', () => {
    it('should return icon for valid states', () => {
      expect(getStateIcon('thinking')).toBe('💡');
      expect(getStateIcon('working')).toBe('📝');
      expect(getStateIcon('executing')).toBe('⚡');
      expect(getStateIcon('error')).toBe('⚠️');
    });

    it('should return null for idle state', () => {
      expect(getStateIcon('idle')).toBeNull();
    });

    it('should return null for unknown states', () => {
      expect(getStateIcon('unknown')).toBeNull();
    });
  });
});
