import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { RaceScene } from '../scenes/RaceScene';

export function createGameConfig(container: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: container,
    width: 1280,
    height: 720,
    backgroundColor: '#c9e6ff',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1450, x: 0 },
        debug: false,
      },
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    scene: [PreloadScene, RaceScene],
  };
}
