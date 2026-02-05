/**
 * Tests for SpriteGenerator - Pixel Art Character Sprites
 * Story 6.3: Pixel Art Character Sprites
 */

import { describe, it, expect } from 'vitest';
import {
  HAIR_COLORS,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  SPRITE_SCALE,
  TOTAL_FRAMES,
  FRAME_IDLE,
  FRAME_WALK_1,
  FRAME_WALK_2,
  FRAME_WALK_3,
  FRAME_WALK_4,
  FRAME_WORKING,
  getHairColorByIndex,
  getOutfitColorByRole,
  getSpriteKey,
} from './SpriteGenerator';
import { ROLE_COLORS } from './constants';

describe('SpriteGenerator', () => {
  describe('Constants (AC1, AC2)', () => {
    it('should define correct sprite dimensions (32x48 base)', () => {
      expect(SPRITE_WIDTH).toBe(32);
      expect(SPRITE_HEIGHT).toBe(48);
    });

    it('should define 2x scale for display (64x96)', () => {
      expect(SPRITE_SCALE).toBe(2);
      expect(SPRITE_WIDTH * SPRITE_SCALE).toBe(64);
      expect(SPRITE_HEIGHT * SPRITE_SCALE).toBe(96);
    });

    it('should have 6 hair colors in palette', () => {
      expect(HAIR_COLORS).toHaveLength(6);
    });

    it('should have correct hair colors (AC2)', () => {
      // Blue #60A5FA
      expect(HAIR_COLORS[0]).toBe(0x60a5fa);
      // Purple #A78BFA
      expect(HAIR_COLORS[1]).toBe(0xa78bfa);
      // Green #4ADE80
      expect(HAIR_COLORS[2]).toBe(0x4ade80);
      // Red #F87171
      expect(HAIR_COLORS[3]).toBe(0xf87171);
      // Pink #F472B6
      expect(HAIR_COLORS[4]).toBe(0xf472b6);
      // Brown #A1887F
      expect(HAIR_COLORS[5]).toBe(0xa1887f);
    });

    it('should have 6 frames total (idle, 4 walk, working)', () => {
      expect(TOTAL_FRAMES).toBe(6);
    });

    it('should define correct frame indices', () => {
      expect(FRAME_IDLE).toBe(0);
      expect(FRAME_WALK_1).toBe(1);
      expect(FRAME_WALK_2).toBe(2);
      expect(FRAME_WALK_3).toBe(3);
      expect(FRAME_WALK_4).toBe(4);
      expect(FRAME_WORKING).toBe(5);
    });
  });

  describe('getHairColorByIndex (AC2)', () => {
    it('should return correct color for index 0-5', () => {
      expect(getHairColorByIndex(0)).toBe(0x60a5fa); // Blue
      expect(getHairColorByIndex(1)).toBe(0xa78bfa); // Purple
      expect(getHairColorByIndex(2)).toBe(0x4ade80); // Green
      expect(getHairColorByIndex(3)).toBe(0xf87171); // Red
      expect(getHairColorByIndex(4)).toBe(0xf472b6); // Pink
      expect(getHairColorByIndex(5)).toBe(0xa1887f); // Brown
    });

    it('should cycle through colors for index >= 6', () => {
      expect(getHairColorByIndex(6)).toBe(0x60a5fa); // Wraps to Blue
      expect(getHairColorByIndex(7)).toBe(0xa78bfa); // Wraps to Purple
      expect(getHairColorByIndex(12)).toBe(0x60a5fa); // Wraps again
    });

    it('should handle large indices correctly', () => {
      expect(getHairColorByIndex(100)).toBe(HAIR_COLORS[100 % 6]);
    });
  });

  describe('getOutfitColorByRole (AC3)', () => {
    it('should return correct color for standard roles', () => {
      expect(getOutfitColorByRole('customer')).toBe(ROLE_COLORS.customer);
      expect(getOutfitColorByRole('ba')).toBe(ROLE_COLORS.ba);
      expect(getOutfitColorByRole('pm')).toBe(ROLE_COLORS.pm);
      expect(getOutfitColorByRole('architect')).toBe(ROLE_COLORS.architect);
      expect(getOutfitColorByRole('developer')).toBe(ROLE_COLORS.developer);
      expect(getOutfitColorByRole('qa')).toBe(ROLE_COLORS.qa);
    });

    it('should return default color for unknown roles', () => {
      expect(getOutfitColorByRole('unknown')).toBe(0x64748b);
      expect(getOutfitColorByRole('')).toBe(0x64748b);
    });
  });

  describe('getSpriteKey', () => {
    it('should generate unique key for hair color and role color combination', () => {
      const key = getSpriteKey(0, 0x22c55e);
      expect(key).toBe('agent-0-22c55e');
    });

    it('should generate different keys for different combinations', () => {
      const key1 = getSpriteKey(0, 0x22c55e);
      const key2 = getSpriteKey(1, 0x22c55e);
      const key3 = getSpriteKey(0, 0x3b82f6);

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should handle all hair color indices', () => {
      for (let i = 0; i < 6; i++) {
        const key = getSpriteKey(i, 0x22c55e);
        expect(key).toContain(`agent-${i}-`);
      }
    });
  });

  describe('Animation Frame Counts (AC5)', () => {
    it('should have 4 walk frames for 800ms cycle', () => {
      const walkFrames = [FRAME_WALK_1, FRAME_WALK_2, FRAME_WALK_3, FRAME_WALK_4];
      expect(walkFrames).toHaveLength(4);
    });

    it('walk frames should be sequential', () => {
      expect(FRAME_WALK_2 - FRAME_WALK_1).toBe(1);
      expect(FRAME_WALK_3 - FRAME_WALK_2).toBe(1);
      expect(FRAME_WALK_4 - FRAME_WALK_3).toBe(1);
    });
  });

  describe('Sprite Sheet Structure (AC5, AC6, AC7)', () => {
    it('should have frame 0 as idle', () => {
      expect(FRAME_IDLE).toBe(0);
    });

    it('should have frames 1-4 as walk cycle', () => {
      expect(FRAME_WALK_1).toBe(1);
      expect(FRAME_WALK_4).toBe(4);
    });

    it('should have frame 5 as working pose', () => {
      expect(FRAME_WORKING).toBe(5);
    });
  });
});
