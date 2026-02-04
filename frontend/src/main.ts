import './style.css';
import { Game } from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { UIScene } from './scenes/UIScene';
import { CompanySelector } from './ui/CompanySelector';
import { ActivityLog } from './ui/ActivityLog';

// Calculate game dimensions with minimum size
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 128;

const getGameWidth = () => Math.max(window.innerWidth, MIN_WIDTH);
const getGameHeight = () => Math.max(window.innerHeight - HEADER_HEIGHT - FOOTER_HEIGHT, MIN_HEIGHT);

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: getGameWidth(),
  height: getGameHeight(),
  backgroundColor: '#1E293B',
  scene: [BootScene, MainScene, UIScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: MIN_WIDTH,
      height: MIN_HEIGHT,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Initialize game
const game = new Game(config);

// Initialize UI components after game is ready
game.events.once('ready', async () => {
  console.log('Game ready, initializing UI components');

  // Initialize company selector
  const companySelector = new CompanySelector('company-selector');

  // Initialize activity log
  const activityLog = new ActivityLog('activity-log');

  companySelector.onSelect((companyId) => {
    console.log(`Company selected: ${companyId}`);
    game.events.emit('selectCompany', companyId);
    activityLog.setCompany(companyId);
  });

  await companySelector.init();

  // Load initial company if available
  const initialCompanyId = companySelector.getSelectedCompanyId();
  if (initialCompanyId) {
    game.events.emit('selectCompany', initialCompanyId);
    activityLog.setCompany(initialCompanyId);
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.resize(getGameWidth(), getGameHeight());
});

console.log('SDLC Game Dashboard initialized');
