import { Scene } from 'phaser';

export class UIScene extends Scene {
  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    console.log('UIScene: Creating UI overlay');

    // UI Scene runs parallel to MainScene
    // For now, UI is handled by HTML/Tailwind outside Phaser
    // This scene can be used for in-game UI elements like:
    // - Agent tooltips
    // - Status indicators
    // - Floating labels
  }

  update(): void {
    // Update UI elements
  }
}
