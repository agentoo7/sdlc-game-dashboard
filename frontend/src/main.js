import './style.css';
import Phaser from 'phaser';
import { BMadOfficeScene } from './scenes/BMadOfficeScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: window.innerWidth - 380,
    height: window.innerHeight - 55,
    backgroundColor: '#0a0a1a',
    scene: BMadOfficeScene,
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => game.scale.resize(window.innerWidth - 380, window.innerHeight - 55));

window.game = game;
