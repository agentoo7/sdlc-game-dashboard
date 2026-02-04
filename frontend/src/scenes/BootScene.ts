import { Scene } from 'phaser';

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
    console.log('BootScene: Assets loaded, starting MainScene');

    // Start main scene and UI scene in parallel
    this.scene.start('MainScene');
    this.scene.start('UIScene');
  }
}
