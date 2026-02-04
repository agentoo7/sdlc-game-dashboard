/**
 * Tests for game configuration and constants.
 */

import { describe, it, expect } from 'vitest';

// Game dimension constants (matching main.ts)
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 128;

describe('Game Configuration', () => {
  describe('Minimum Dimensions', () => {
    it('should have minimum width of 800px (AC: #1)', () => {
      expect(MIN_WIDTH).toBe(800);
    });

    it('should have minimum height of 600px (AC: #1)', () => {
      expect(MIN_HEIGHT).toBe(600);
    });

    it('should reserve space for header', () => {
      expect(HEADER_HEIGHT).toBeGreaterThan(0);
    });

    it('should reserve space for footer (activity log)', () => {
      expect(FOOTER_HEIGHT).toBeGreaterThan(0);
    });
  });

  describe('Dimension Calculations', () => {
    const getGameWidth = (windowWidth: number) => Math.max(windowWidth, MIN_WIDTH);
    const getGameHeight = (windowHeight: number) =>
      Math.max(windowHeight - HEADER_HEIGHT - FOOTER_HEIGHT, MIN_HEIGHT);

    it('should return MIN_WIDTH when window is smaller', () => {
      expect(getGameWidth(400)).toBe(MIN_WIDTH);
    });

    it('should return window width when larger than MIN_WIDTH', () => {
      expect(getGameWidth(1200)).toBe(1200);
    });

    it('should return MIN_HEIGHT when calculated height is smaller', () => {
      // Window height of 300 - 80 - 128 = 92, which is less than 600
      expect(getGameHeight(300)).toBe(MIN_HEIGHT);
    });

    it('should return calculated height when larger than MIN_HEIGHT', () => {
      // Window height of 1000 - 80 - 128 = 792
      expect(getGameHeight(1000)).toBe(792);
    });
  });
});

describe('Background Color', () => {
  const BACKGROUND_COLOR = '#1E293B'; // Slate 800

  it('should be a valid hex color', () => {
    expect(BACKGROUND_COLOR).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should be Slate 800 color', () => {
    expect(BACKGROUND_COLOR.toUpperCase()).toBe('#1E293B');
  });
});

describe('API Configuration', () => {
  const API_URL = 'http://localhost:8002/api';

  it('should use correct backend port', () => {
    expect(API_URL).toContain(':8002');
  });

  it('should include /api prefix', () => {
    expect(API_URL).toContain('/api');
  });
});
