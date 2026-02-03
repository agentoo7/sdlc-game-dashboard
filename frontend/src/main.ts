import './style.css';
import { Game } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { UIScene } from './scenes/UIScene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight - 128 - 80, // Subtract header (80px) and footer (128px)
  backgroundColor: '#1E293B',
  scene: [BootScene, MainScene, UIScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Initialize game
const game = new Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.resize(
    window.innerWidth,
    window.innerHeight - 128 - 80
  );
});

console.log('SDLC Game Dashboard initialized');
