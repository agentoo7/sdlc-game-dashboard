/**
 * Tests for OfficeRenderer - Story 6.4: ChatDev-Style Office Layout
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  OFFICE_COLORS,
  OFFICE_TEXTURE_KEYS,
  FLOOR_TILE_SIZE,
  DESK_WIDTH,
  DESK_HEIGHT,
  PLANT_SMALL_SIZE,
  PLANT_LARGE_SIZE,
  OFFICE_LAYOUT,
  ZONE_BACKGROUND_COLORS,
  generateWoodenFloorTexture,
  generateDeskTexture,
  generateSmallPlantTexture,
  generateLargePlantTexture,
  preGenerateOfficeTextures,
} from './OfficeRenderer';
import { ZONE_POSITIONS, ROLE_TO_ZONE, ZONE_LABELS, ROLE_ZONE_POSITIONS } from './constants';

// Mock Phaser Graphics object
const createMockGraphics = () => ({
  fillStyle: vi.fn().mockReturnThis(),
  fillRect: vi.fn().mockReturnThis(),
  fillCircle: vi.fn().mockReturnThis(),
  fillRoundedRect: vi.fn().mockReturnThis(),
  lineStyle: vi.fn().mockReturnThis(),
  lineBetween: vi.fn().mockReturnThis(),
  strokeRect: vi.fn().mockReturnThis(),
  strokeRoundedRect: vi.fn().mockReturnThis(),
  beginPath: vi.fn().mockReturnThis(),
  moveTo: vi.fn().mockReturnThis(),
  lineTo: vi.fn().mockReturnThis(),
  closePath: vi.fn().mockReturnThis(),
  fill: vi.fn().mockReturnThis(),
  generateTexture: vi.fn().mockReturnThis(),
  destroy: vi.fn(),
});

// Mock Phaser Scene
const createMockScene = () => {
  const mockGraphics = createMockGraphics();
  const existingTextures = new Set<string>();

  return {
    add: {
      graphics: vi.fn(() => mockGraphics),
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
      })),
      container: vi.fn(() => ({
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      })),
    },
    textures: {
      exists: vi.fn((key: string) => existingTextures.has(key)),
    },
    _mockGraphics: mockGraphics,
    _existingTextures: existingTextures,
  };
};

describe('OfficeRenderer', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('Color Palette', () => {
    it('should have correct floor colors defined', () => {
      expect(OFFICE_COLORS.floorBase).toBe(0x8B7355);
      expect(OFFICE_COLORS.floorGrain).toBe(0x6B5344);
      expect(OFFICE_COLORS.floorHighlight).toBe(0x9B8365);
    });

    it('should have correct sign colors defined', () => {
      expect(OFFICE_COLORS.pole).toBe(0x6B4423);
      expect(OFFICE_COLORS.signBoard).toBe(0xA0855C);
      expect(OFFICE_COLORS.signText).toBe(0x3D2B1F);
    });

    it('should have correct desk colors defined', () => {
      expect(OFFICE_COLORS.deskSurface).toBe(0x8B6914);
      expect(OFFICE_COLORS.deskLegs).toBe(0x5D4037);
      expect(OFFICE_COLORS.monitorFrame).toBe(0x607D8B);
      expect(OFFICE_COLORS.monitorScreen).toBe(0x1E90FF);
    });

    it('should have correct plant colors defined', () => {
      expect(OFFICE_COLORS.plantPot).toBe(0xCD5C5C);
      expect(OFFICE_COLORS.plantLeaves).toBe(0x228B22);
      expect(OFFICE_COLORS.plantLight).toBe(0x32CD32);
    });

    it('should have correct carpet colors defined', () => {
      expect(OFFICE_COLORS.carpetBorder).toBe(0x8B0000);
      expect(OFFICE_COLORS.carpetInner).toBe(0xB22222);
      expect(OFFICE_COLORS.carpetFringe).toBe(0xDEB887);
    });
  });

  describe('Texture Keys', () => {
    it('should have all texture keys defined', () => {
      expect(OFFICE_TEXTURE_KEYS.woodenFloor).toBe('office-wooden-floor');
      expect(OFFICE_TEXTURE_KEYS.desk).toBe('office-desk');
      expect(OFFICE_TEXTURE_KEYS.plantSmall).toBe('office-plant-small');
      expect(OFFICE_TEXTURE_KEYS.plantLarge).toBe('office-plant-large');
    });
  });

  describe('Dimensions', () => {
    it('should have correct floor tile size', () => {
      expect(FLOOR_TILE_SIZE).toBe(64);
    });

    it('should have correct desk dimensions', () => {
      expect(DESK_WIDTH).toBe(48);
      expect(DESK_HEIGHT).toBe(32);
    });

    it('should have correct plant dimensions', () => {
      expect(PLANT_SMALL_SIZE).toBe(16);
      expect(PLANT_LARGE_SIZE).toBe(24);
    });
  });

  describe('OFFICE_LAYOUT', () => {
    it('should have floor dimensions defined', () => {
      expect(OFFICE_LAYOUT.floorWidth).toBe(900);
      expect(OFFICE_LAYOUT.floorHeight).toBe(700);
      expect(OFFICE_LAYOUT.floorStartX).toBe(-50);
      expect(OFFICE_LAYOUT.floorStartY).toBe(-50);
    });

    it('should have carpet position defined', () => {
      expect(OFFICE_LAYOUT.carpetCenterX).toBe(400);
      expect(OFFICE_LAYOUT.carpetCenterY).toBe(350);
      expect(OFFICE_LAYOUT.carpetWidth).toBe(200);
      expect(OFFICE_LAYOUT.carpetHeight).toBe(80);
    });

    it('should have zone dimensions defined', () => {
      expect(OFFICE_LAYOUT.zoneWidth).toBe(320);
      expect(OFFICE_LAYOUT.zoneHeight).toBe(260);
    });

    it('should have desk offsets defined', () => {
      expect(OFFICE_LAYOUT.deskOffsets).toHaveLength(2);
      expect(OFFICE_LAYOUT.deskOffsets[0]).toEqual({ x: -60, y: 20 });
      expect(OFFICE_LAYOUT.deskOffsets[1]).toEqual({ x: 60, y: 20 });
      expect(OFFICE_LAYOUT.deskScale).toBe(1.5);
    });

    it('should have corner plant positions defined', () => {
      expect(OFFICE_LAYOUT.cornerPlantPositions).toHaveLength(4);
      expect(OFFICE_LAYOUT.cornerPlantPositions[0]).toEqual({ x: 40, y: 40 });
      expect(OFFICE_LAYOUT.cornerPlantPositions[3]).toEqual({ x: 760, y: 620 });
    });

    it('should have divider plant positions defined', () => {
      expect(OFFICE_LAYOUT.dividerPlantPositions).toHaveLength(4);
      expect(OFFICE_LAYOUT.plantScale).toBe(2);
    });

    it('should have shadow dimensions defined', () => {
      expect(OFFICE_LAYOUT.shadowOffsetX).toBe(-20);
      expect(OFFICE_LAYOUT.shadowOffsetY).toBe(-20);
      expect(OFFICE_LAYOUT.shadowWidth).toBe(840);
      expect(OFFICE_LAYOUT.shadowHeight).toBe(680);
    });
  });

  describe('ZONE_BACKGROUND_COLORS', () => {
    it('should have colors for all 4 zones', () => {
      expect(ZONE_BACKGROUND_COLORS.designing).toBe(0x3B82F6);
      expect(ZONE_BACKGROUND_COLORS.documenting).toBe(0xF97316);
      expect(ZONE_BACKGROUND_COLORS.coding).toBe(0x22C55E);
      expect(ZONE_BACKGROUND_COLORS.testing).toBe(0xEF4444);
    });
  });

  describe('generateWoodenFloorTexture', () => {
    it('should create graphics and generate texture', () => {
      generateWoodenFloorTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene._mockGraphics.fillStyle).toHaveBeenCalled();
      expect(mockScene._mockGraphics.fillRect).toHaveBeenCalled();
      expect(mockScene._mockGraphics.generateTexture).toHaveBeenCalledWith(
        OFFICE_TEXTURE_KEYS.woodenFloor,
        FLOOR_TILE_SIZE,
        FLOOR_TILE_SIZE
      );
      expect(mockScene._mockGraphics.destroy).toHaveBeenCalled();
    });

    it('should not regenerate if texture already exists', () => {
      mockScene._existingTextures.add(OFFICE_TEXTURE_KEYS.woodenFloor);

      generateWoodenFloorTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene.add.graphics).not.toHaveBeenCalled();
    });

    it('should draw grain lines on planks', () => {
      generateWoodenFloorTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene._mockGraphics.lineStyle).toHaveBeenCalled();
      expect(mockScene._mockGraphics.lineBetween).toHaveBeenCalled();
    });
  });

  describe('generateDeskTexture', () => {
    it('should create desk texture with correct dimensions', () => {
      generateDeskTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene._mockGraphics.generateTexture).toHaveBeenCalledWith(
        OFFICE_TEXTURE_KEYS.desk,
        DESK_WIDTH,
        DESK_HEIGHT
      );
    });

    it('should draw desk surface and legs', () => {
      generateDeskTexture(mockScene as unknown as Phaser.Scene);

      // Should call fillRect multiple times for desk parts
      expect(mockScene._mockGraphics.fillRect.mock.calls.length).toBeGreaterThan(5);
    });

    it('should not regenerate if texture already exists', () => {
      mockScene._existingTextures.add(OFFICE_TEXTURE_KEYS.desk);

      generateDeskTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene.add.graphics).not.toHaveBeenCalled();
    });
  });

  describe('generateSmallPlantTexture', () => {
    it('should create small plant texture', () => {
      generateSmallPlantTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene._mockGraphics.generateTexture).toHaveBeenCalledWith(
        OFFICE_TEXTURE_KEYS.plantSmall,
        PLANT_SMALL_SIZE,
        PLANT_SMALL_SIZE
      );
    });

    it('should draw pot and leaves', () => {
      generateSmallPlantTexture(mockScene as unknown as Phaser.Scene);

      // Should draw pot (fillRect) and leaves (fillCircle)
      expect(mockScene._mockGraphics.fillRect).toHaveBeenCalled();
      expect(mockScene._mockGraphics.fillCircle).toHaveBeenCalled();
    });

    it('should not regenerate if texture already exists', () => {
      mockScene._existingTextures.add(OFFICE_TEXTURE_KEYS.plantSmall);

      generateSmallPlantTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene.add.graphics).not.toHaveBeenCalled();
    });
  });

  describe('generateLargePlantTexture', () => {
    it('should create large plant texture', () => {
      generateLargePlantTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene._mockGraphics.generateTexture).toHaveBeenCalledWith(
        OFFICE_TEXTURE_KEYS.plantLarge,
        24,
        32
      );
    });

    it('should not regenerate if texture already exists', () => {
      mockScene._existingTextures.add(OFFICE_TEXTURE_KEYS.plantLarge);

      generateLargePlantTexture(mockScene as unknown as Phaser.Scene);

      expect(mockScene.add.graphics).not.toHaveBeenCalled();
    });
  });

  describe('preGenerateOfficeTextures', () => {
    it('should generate all office textures', () => {
      preGenerateOfficeTextures(mockScene as unknown as Phaser.Scene);

      // Should call graphics 4 times (floor, desk, small plant, large plant)
      expect(mockScene.add.graphics).toHaveBeenCalledTimes(4);
    });
  });
});

// Import drawing functions for testing
import { drawDepartmentSign, drawCompanyCarpet } from './OfficeRenderer';

describe('Office Drawing Functions', () => {
  let mockScene: ReturnType<typeof createMockScene>;

  beforeEach(() => {
    mockScene = createMockScene();
  });

  describe('drawDepartmentSign', () => {
    it('should create a container with sign elements', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      const result = drawDepartmentSign(mockScene as unknown as Phaser.Scene, 100, 200, 'DESIGNING', 5);

      expect(mockScene.add.container).toHaveBeenCalledWith(100, 200);
      expect(mockContainer.setDepth).toHaveBeenCalledWith(5);
      expect(result).toBe(mockContainer);
    });

    it('should add graphics and text to container', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawDepartmentSign(mockScene as unknown as Phaser.Scene, 100, 200, 'CODING');

      // Should add graphics (pole + sign) and text
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalledWith(0, -65, 'CODING', expect.any(Object));
      expect(mockContainer.add).toHaveBeenCalledTimes(2); // graphics + text
    });

    it('should use default depth of 5', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawDepartmentSign(mockScene as unknown as Phaser.Scene, 0, 0, 'TEST');

      expect(mockContainer.setDepth).toHaveBeenCalledWith(5);
    });

    it('should draw wooden pole with correct color', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawDepartmentSign(mockScene as unknown as Phaser.Scene, 0, 0, 'TEST');

      // Verify pole color (0x6B4423) was used
      expect(mockScene._mockGraphics.fillStyle).toHaveBeenCalledWith(0x6B4423, 1);
    });
  });

  describe('drawCompanyCarpet', () => {
    it('should create a container with carpet elements', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      const result = drawCompanyCarpet(mockScene as unknown as Phaser.Scene, 400, 350, 'MyCompany');

      expect(mockScene.add.container).toHaveBeenCalledWith(400, 350);
      expect(mockContainer.setDepth).toHaveBeenCalled();
      expect(result).toBe(mockContainer);
    });

    it('should add graphics and company name text', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawCompanyCarpet(mockScene as unknown as Phaser.Scene, 400, 350, 'TestCorp');

      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(mockScene.add.text).toHaveBeenCalledWith(0, 0, 'TestCorp', expect.any(Object));
      expect(mockContainer.add).toHaveBeenCalledTimes(2); // graphics + text
    });

    it('should use custom dimensions when provided', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawCompanyCarpet(mockScene as unknown as Phaser.Scene, 100, 100, 'Co', 300, 150, 3);

      expect(mockContainer.setDepth).toHaveBeenCalledWith(3);
      // Graphics should be called with carpet drawing operations
      expect(mockScene._mockGraphics.fillRoundedRect).toHaveBeenCalled();
    });

    it('should draw carpet with fringe, border, and inner colors', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawCompanyCarpet(mockScene as unknown as Phaser.Scene, 0, 0, 'Test');

      // Verify carpet colors were used
      expect(mockScene._mockGraphics.fillStyle).toHaveBeenCalledWith(0xDEB887, 1); // fringe
      expect(mockScene._mockGraphics.fillStyle).toHaveBeenCalledWith(0x8B0000, 1); // border
      expect(mockScene._mockGraphics.fillStyle).toHaveBeenCalledWith(0xB22222, 1); // inner
    });

    it('should draw decorative diamond pattern', () => {
      const mockContainer = {
        setDepth: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
      };
      mockScene.add.container = vi.fn(() => mockContainer);

      drawCompanyCarpet(mockScene as unknown as Phaser.Scene, 0, 0, 'Test');

      // Diamond pattern uses beginPath, moveTo, lineTo, closePath, fill
      expect(mockScene._mockGraphics.beginPath).toHaveBeenCalled();
      expect(mockScene._mockGraphics.moveTo).toHaveBeenCalled();
      expect(mockScene._mockGraphics.fill).toHaveBeenCalled();
    });
  });
});

// Test zone positions and role mapping (Task 2, Task 8)
describe('Zone Positions (Story 6.4)', () => {
  describe('ZONE_POSITIONS - 2x2 Layout', () => {
    it('should have 4 zones in 2x2 grid', () => {
      const zones = Object.keys(ZONE_POSITIONS);
      expect(zones).toHaveLength(4);
      expect(zones).toContain('designing');
      expect(zones).toContain('documenting');
      expect(zones).toContain('coding');
      expect(zones).toContain('testing');
    });

    it('should have designing zone in top-left', () => {
      expect(ZONE_POSITIONS.designing.x).toBeLessThan(400);
      expect(ZONE_POSITIONS.designing.y).toBeLessThan(350);
    });

    it('should have documenting zone in top-right', () => {
      expect(ZONE_POSITIONS.documenting.x).toBeGreaterThan(400);
      expect(ZONE_POSITIONS.documenting.y).toBeLessThan(350);
    });

    it('should have coding zone in bottom-left', () => {
      expect(ZONE_POSITIONS.coding.x).toBeLessThan(400);
      expect(ZONE_POSITIONS.coding.y).toBeGreaterThan(350);
    });

    it('should have testing zone in bottom-right', () => {
      expect(ZONE_POSITIONS.testing.x).toBeGreaterThan(400);
      expect(ZONE_POSITIONS.testing.y).toBeGreaterThan(350);
    });
  });

  describe('ROLE_TO_ZONE Mapping', () => {
    it('should map customer to designing zone', () => {
      expect(ROLE_TO_ZONE.customer).toBe('designing');
    });

    it('should map ba to designing zone', () => {
      expect(ROLE_TO_ZONE.ba).toBe('designing');
    });

    it('should map pm to designing zone', () => {
      expect(ROLE_TO_ZONE.pm).toBe('designing');
    });

    it('should map architect to documenting zone', () => {
      expect(ROLE_TO_ZONE.architect).toBe('documenting');
    });

    it('should map developer to coding zone', () => {
      expect(ROLE_TO_ZONE.developer).toBe('coding');
    });

    it('should map qa to testing zone', () => {
      expect(ROLE_TO_ZONE.qa).toBe('testing');
    });
  });

  describe('ZONE_LABELS', () => {
    it('should have correct labels for all zones', () => {
      expect(ZONE_LABELS.designing).toBe('DESIGNING');
      expect(ZONE_LABELS.documenting).toBe('DOCUMENTING');
      expect(ZONE_LABELS.coding).toBe('CODING');
      expect(ZONE_LABELS.testing).toBe('TESTING');
    });
  });

  describe('ROLE_ZONE_POSITIONS (Legacy compatibility)', () => {
    it('should map roles to correct zone positions', () => {
      expect(ROLE_ZONE_POSITIONS.customer).toEqual(ZONE_POSITIONS.designing);
      expect(ROLE_ZONE_POSITIONS.ba).toEqual(ZONE_POSITIONS.designing);
      expect(ROLE_ZONE_POSITIONS.pm).toEqual(ZONE_POSITIONS.designing);
      expect(ROLE_ZONE_POSITIONS.architect).toEqual(ZONE_POSITIONS.documenting);
      expect(ROLE_ZONE_POSITIONS.developer).toEqual(ZONE_POSITIONS.coding);
      expect(ROLE_ZONE_POSITIONS.qa).toEqual(ZONE_POSITIONS.testing);
    });

    it('should have all 6 standard roles mapped', () => {
      const roles = Object.keys(ROLE_ZONE_POSITIONS);
      expect(roles).toHaveLength(6);
      expect(roles).toContain('customer');
      expect(roles).toContain('ba');
      expect(roles).toContain('pm');
      expect(roles).toContain('architect');
      expect(roles).toContain('developer');
      expect(roles).toContain('qa');
    });
  });
});
