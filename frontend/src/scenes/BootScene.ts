import { Scene } from 'phaser';
import {
  HAIR_COLORS,
  generateSpriteSheet,
  getSpriteKey,
} from '@/utils/SpriteGenerator';
import { ROLE_COLORS } from '@/utils/constants';
import { preGenerateOfficeTextures } from '@/utils/OfficeRenderer';
import { preGenerateSpeechBubbleTextures } from '@/utils/SpeechBubbleManager';

export class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Show loading progress
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'SDLC Game Dashboard - Loading...', {
      fontSize: '24px',
      color: '#F8FAFC',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x334155);
    progressBarBg.setOrigin(0.5);

    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x22C55E);
    progressBar.setOrigin(0, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.width = 396 * value;
    });
  }

  create(): void {
    console.log('BootScene: Assets loaded, generating textures');

    // Pre-generate office textures (Story 6.4)
    preGenerateOfficeTextures(this);

    // Pre-generate speech bubble textures (Story 6.5)
    preGenerateSpeechBubbleTextures(this);

    // Pre-generate all possible sprite combinations (Task 3)
    // Generate sprites for all hair colors × all role colors
    this.generateAllSpriteCombinations();

    console.log('BootScene: All textures generated, starting MainScene');

    // Start main scene and UI scene in parallel
    this.scene.start('MainScene');
    this.scene.start('UIScene');
  }

  /**
   * Pre-generate sprite textures for all possible combinations
   * This ensures sprites are ready when agents are created
   */
  private generateAllSpriteCombinations(): void {
    const roleColors = Object.values(ROLE_COLORS);

    // Generate sprite sheets for each hair color × role color combination
    HAIR_COLORS.forEach((hairColor, hairIndex) => {
      roleColors.forEach((roleColor) => {
        const key = getSpriteKey(hairIndex, roleColor);
        generateSpriteSheet(this, hairColor, roleColor, key);
      });
    });

    console.log(`BootScene: Generated ${HAIR_COLORS.length * roleColors.length} sprite combinations`);
  }
}
