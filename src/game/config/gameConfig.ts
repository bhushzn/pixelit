import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { RaceScene } from '../scenes/RaceScene';

export interface GameInitialData {
  mapId?: string;
  isMultiplayer?: boolean;
  roomId?: string;
  displayName?: string;
}

export function createGameConfig(
  container: HTMLElement,
  initialData?: GameInitialData
): Phaser.Types.Core.GameConfig {
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
    callbacks: {
      preBoot: (game) => {
        if (initialData?.mapId) {
          game.registry.set('mapId', initialData.mapId);
        }
        if (initialData?.isMultiplayer !== undefined) {
          game.registry.set('isMultiplayer', initialData.isMultiplayer);
        }
        if (initialData?.roomId) {
          game.registry.set('roomId', initialData.roomId);
        }
        if (initialData?.displayName) {
          game.registry.set('displayName', initialData.displayName);
        }
      },
    },
    scene: [PreloadScene, RaceScene],
  };
}

