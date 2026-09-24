import Phaser from 'phaser';
import { PixelAssets } from '../graphics/pixelAssets';

export class PreloadScene extends Phaser.Scene {
  private mapId = 'cloud_climb';

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data?: { mapId?: string }): void {
    const requestedId = data?.mapId || this.registry?.get('mapId') || this.mapId || 'cloud_climb';
    this.mapId = requestedId;
  }

  create(): void {
    this.generateTextures();
    this.createAnimations();
    this.scene.start('RaceScene', { mapId: this.mapId });
  }

  private safeAddCanvas(key: string, canvas: HTMLCanvasElement): void {
    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }
    this.textures.addCanvas(key, canvas);
  }

  private safeAddSpriteSheet(
    key: string,
    source: HTMLCanvasElement,
    config: Phaser.Types.Textures.SpriteSheetConfig
  ): void {
    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }
    this.textures.addSpriteSheet(key, source as unknown as HTMLImageElement, config);
  }

  private generateTextures(): void {
    // 1. Original Pixel-Art Rush Aviator Player Sprite Sheet (48x48)
    this.safeAddSpriteSheet(
      'player_rush_sheet',
      PixelAssets.generatePlayerSpriteSheet(),
      {
        frameWidth: 48,
        frameHeight: 48,
      }
    );

    // Legacy Fallback single-frame textures for player
    this.createPlayerTexture('player_pip_idle', 'idle');
    this.createPlayerTexture('player_pip_run', 'run');
    this.createPlayerTexture('player_pip_jump', 'jump');
    this.createPlayerTexture('player_pip_hit', 'hit');

    // 2. Pixel-Art High-Detail Terrain & Platforms
    this.safeAddCanvas('platform_grass', PixelAssets.generateGrassPlatformTexture());
    this.safeAddCanvas('platform_cloud', PixelAssets.generateCloudPlatformTexture());
    this.safeAddCanvas('platform_bounce', PixelAssets.generateBouncePlatformTexture());
    this.safeAddCanvas('platform_hover', PixelAssets.generateHoverPlatformTexture());
    this.safeAddCanvas('platform_boost', PixelAssets.generateBoostPadTexture());

    // 3. Pixel-Art Collectibles, Hazards, and Interactive Landmarks
    this.safeAddSpriteSheet(
      'coin_pixel_sheet',
      PixelAssets.generateCoinSpriteSheet(),
      {
        frameWidth: 32,
        frameHeight: 32,
      }
    );
    this.createCoinTexture(); // Legacy fallback

    this.safeAddCanvas('hazard_spike', PixelAssets.generateCrystalHazardTexture());
    this.safeAddSpriteSheet(
      'checkpoint_inactive_sheet',
      PixelAssets.generateCheckpointSpriteSheet(false),
      { frameWidth: 48, frameHeight: 80 }
    );
    this.safeAddSpriteSheet(
      'checkpoint_active_sheet',
      PixelAssets.generateCheckpointSpriteSheet(true),
      { frameWidth: 48, frameHeight: 80 }
    );
    this.createCheckpointTexture(false);
    this.createCheckpointTexture(true);

    this.createFinishGateTexture();
    this.safeAddCanvas('bg_large_finish_arch', PixelAssets.generateLargeFinishArchTexture());
    this.createSignTextures();
    this.createBackgroundDecorTextures();
    this.createScenicPropTextures();
    this.createSkyGradientTexture();

    // 4. Parallax Atmosphere, Landmarks, and Living World Elements
    this.safeAddSpriteSheet(
      'bird_pixel_sheet',
      PixelAssets.generateBirdSpriteSheet(),
      {
        frameWidth: 24,
        frameHeight: 24,
      }
    );
    this.safeAddCanvas('bg_floating_island', PixelAssets.generateDistantSkyIslandTexture());
    this.safeAddCanvas('prop_cloud_harbor', PixelAssets.generateCloudHarborPropTexture());
    this.safeAddCanvas('prop_ancient_ruins', PixelAssets.generateAncientRuinsPropTexture());
    this.safeAddCanvas('fx_god_ray', PixelAssets.generateGodRayTexture());

    // 5. Particles
    this.createParticleStarTexture();
    this.createParticleCloudTexture();
    this.createParticleDashTexture();
  }

  private createAnimations(): void {
    const addAnim = (config: Phaser.Types.Animations.Animation) => {
      if (config.key && this.anims.exists(config.key)) {
        this.anims.remove(config.key);
      }
      this.anims.create(config);
    };

    // Player Animations
    addAnim({
      key: 'player_anim_idle',
      frames: this.anims.generateFrameNumbers('player_rush_sheet', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    addAnim({
      key: 'player_anim_run',
      frames: this.anims.generateFrameNumbers('player_rush_sheet', { start: 4, end: 9 }),
      frameRate: 12,
      repeat: -1,
    });

    addAnim({
      key: 'player_anim_jump',
      frames: this.anims.generateFrameNumbers('player_rush_sheet', { start: 10, end: 11 }),
      frameRate: 8,
      repeat: 0,
    });

    addAnim({
      key: 'player_anim_fall',
      frames: this.anims.generateFrameNumbers('player_rush_sheet', { start: 12, end: 13 }),
      frameRate: 8,
      repeat: -1,
    });

    addAnim({
      key: 'player_anim_dash',
      frames: this.anims.generateFrameNumbers('player_rush_sheet', { start: 14, end: 15 }),
      frameRate: 14,
      repeat: -1,
    });

    addAnim({
      key: 'player_anim_hit',
      frames: this.anims.generateFrameNumbers('player_rush_sheet', { start: 16, end: 17 }),
      frameRate: 8,
      repeat: 0,
    });

    // Coin Spin Animation
    addAnim({
      key: 'coin_spin',
      frames: this.anims.generateFrameNumbers('coin_pixel_sheet', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    // Bird Flying Animation
    addAnim({
      key: 'bird_fly',
      frames: this.anims.generateFrameNumbers('bird_pixel_sheet', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    // Checkpoint Flag Animations
    addAnim({
      key: 'checkpoint_inactive_anim',
      frames: this.anims.generateFrameNumbers('checkpoint_inactive_sheet', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    addAnim({
      key: 'checkpoint_active_anim',
      frames: this.anims.generateFrameNumbers('checkpoint_active_sheet', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
  }

  private createPlayerTexture(key: string, pose: 'idle' | 'run' | 'jump' | 'hit'): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.save();
    ctx.translate(32, 32);

    // Drop shadow under feet
    ctx.fillStyle = 'rgba(0, 55, 81, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Shoes
    ctx.fillStyle = '#f43f5e'; // Bright Coral Red sneakers
    const legOffset = pose === 'run' ? 6 : pose === 'jump' ? -4 : 0;

    // Left shoe
    ctx.beginPath();
    ctx.roundRect(-12, 16 - legOffset, 10, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff'; // White sneaker soles
    ctx.fillRect(-12, 22 - legOffset, 10, 3);

    // Right shoe
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(2, 16 + legOffset, 10, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 22 + legOffset, 10, 3);

    // Body: Sunny Yellow Hoodie
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.roundRect(-14, -2, 28, 20, 8);
    ctx.fill();

    // Hoodie zipper/pocket
    ctx.fillStyle = '#855300';
    ctx.fillRect(-1.5, 0, 3, 14);

    // Head / Face
    ctx.fillStyle = '#ffe0bd'; // Peach skin tone
    ctx.beginPath();
    ctx.arc(0, -12, 13, 0, Math.PI * 2);
    ctx.fill();

    // Backwards Navy Cap
    ctx.fillStyle = '#006591';
    ctx.beginPath();
    ctx.arc(0, -16, 13, Math.PI, Math.PI * 2);
    ctx.fill();
    // Cap visor backwards
    ctx.fillRect(-14, -17, 8, 4);

    // Cap Goggles (cyan lenses)
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.roundRect(-10, -20, 8, 6, 2);
    ctx.roundRect(2, -20, 8, 6, 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes & Smile
    if (pose === 'hit') {
      // Dizzy X eyes
      ctx.strokeStyle = '#131b2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-7, -14); ctx.lineTo(-3, -10);
      ctx.moveTo(-3, -14); ctx.lineTo(-7, -10);
      ctx.moveTo(3, -14); ctx.lineTo(7, -10);
      ctx.moveTo(7, -14); ctx.lineTo(3, -10);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#131b2e';
      ctx.beginPath();
      ctx.arc(-5, -12, 2.5, 0, Math.PI * 2);
      ctx.arc(5, -12, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -13, 1, 0, Math.PI * 2);
      ctx.arc(6, -13, 1, 0, Math.PI * 2);
      ctx.fill();

      // Cheerful Smile
      ctx.strokeStyle = '#684000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -9, 5, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
    this.safeAddCanvas(key, canvas);
  }

  private createGrassPlatformTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Cookie-brown dirt body
    ctx.fillStyle = '#a16207';
    ctx.beginPath();
    ctx.roundRect(0, 16, 128, 48, [0, 0, 16, 16]);
    ctx.fill();

    // Stepped darker dirt bevel
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(0, 52, 128, 12, [0, 0, 16, 16]);
    ctx.fill();

    // Lush Emerald Voxel Grass Top
    ctx.fillStyle = '#00b17b';
    ctx.beginPath();
    ctx.roundRect(0, 0, 128, 22, [12, 12, 6, 6]);
    ctx.fill();

    // Grass blade scallops along bottom of grass
    ctx.fillStyle = '#006c49';
    for (let x = 8; x < 120; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 22);
      ctx.lineTo(x + 8, 28);
      ctx.lineTo(x + 16, 22);
      ctx.fill();
    }

    // Sunny grass highlight stripe
    ctx.fillStyle = '#6ffbbe';
    ctx.fillRect(4, 2, 120, 3);

    this.safeAddCanvas('platform_grass', canvas);
  }

  private createCloudPlatformTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d')!;

    // Soft sky drop shadow
    ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
    ctx.beginPath();
    ctx.roundRect(0, 12, 128, 36, 18);
    ctx.fill();

    // Cloud body: Crisp Cloud White
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(0, 4, 128, 38, 18);
    ctx.fill();

    // Cloud top puffs
    ctx.beginPath();
    ctx.arc(28, 12, 14, 0, Math.PI * 2);
    ctx.arc(64, 8, 18, 0, Math.PI * 2);
    ctx.arc(100, 12, 14, 0, Math.PI * 2);
    ctx.fill();

    // Soft cyan bottom tint
    ctx.fillStyle = '#c9e6ff';
    ctx.beginPath();
    ctx.roundRect(4, 34, 120, 6, 3);
    ctx.fill();

    this.safeAddCanvas('platform_cloud', canvas);
  }

  private createBouncePlatformTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 44;
    const ctx = canvas.getContext('2d')!;

    // Solid base
    ctx.fillStyle = '#006591';
    ctx.beginPath();
    ctx.roundRect(0, 20, 128, 24, [0, 0, 12, 12]);
    ctx.fill();

    // Striped Candy Frame
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.roundRect(4, 6, 120, 24, 12);
    ctx.fill();

    // Bouncy Trampoline Pad
    ctx.fillStyle = '#ffddb8';
    ctx.beginPath();
    ctx.roundRect(14, 10, 100, 16, 8);
    ctx.fill();

    // Bouncing Up Arrow Icon
    ctx.fillStyle = '#855300';
    ctx.beginPath();
    ctx.moveTo(64, 12);
    ctx.lineTo(56, 20);
    ctx.lineTo(61, 20);
    ctx.lineTo(61, 24);
    ctx.lineTo(67, 24);
    ctx.lineTo(67, 20);
    ctx.lineTo(72, 20);
    ctx.closePath();
    ctx.fill();

    this.safeAddCanvas('platform_bounce', canvas);
  }

  private createHoverPlatformTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 44;
    const ctx = canvas.getContext('2d')!;

    // Jet body
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.roundRect(0, 4, 128, 32, 12);
    ctx.fill();

    // Bottom thrusters
    ctx.fillStyle = '#003751';
    ctx.fillRect(20, 32, 24, 6);
    ctx.fillRect(84, 32, 24, 6);

    // Thruster glow
    ctx.fillStyle = '#4edea3';
    ctx.fillRect(24, 38, 16, 4);
    ctx.fillRect(88, 38, 16, 4);

    // Caution chevron stripes
    ctx.fillStyle = '#fea619';
    ctx.fillRect(48, 12, 32, 16);

    this.safeAddCanvas('platform_hover', canvas);
  }

  private createCoinTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Outer golden rim
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();

    // Shiny gold face
    ctx.fillStyle = '#ffddb8';
    ctx.beginPath();
    ctx.arc(16, 16, 11, 0, Math.PI * 2);
    ctx.fill();

    // Golden Star embossed in center
    ctx.fillStyle = '#855300';
    ctx.beginPath();
    ctx.arc(16, 16, 4, 0, Math.PI * 2);
    ctx.fill();

    // White glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(12, 10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    this.safeAddCanvas('coin', canvas);
  }

  private createHazardSpikeTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Spikes (Playful cartoon coral spikes)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(4, 32); ctx.lineTo(10, 4); ctx.lineTo(16, 32);
    ctx.moveTo(14, 32); ctx.lineTo(20, 2); ctx.lineTo(26, 32);
    ctx.moveTo(24, 32); ctx.lineTo(30, 4); ctx.lineTo(36, 32);
    ctx.fill();

    // Spike base
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(2, 28, 36, 4);

    this.safeAddCanvas('hazard_spike', canvas);
  }

  private createCheckpointTexture(active: boolean): void {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Candy pole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, 8, 70);

    // Red stripes
    ctx.fillStyle = '#f43f5e';
    for (let y = 14; y < 80; y += 14) {
      ctx.fillRect(10, y, 8, 7);
    }

    // Pole base
    ctx.fillStyle = '#006591';
    ctx.beginPath();
    ctx.roundRect(4, 72, 20, 8, 4);
    ctx.fill();

    // Flag pennant
    ctx.fillStyle = active ? '#00b17b' : '#fea619';
    ctx.beginPath();
    ctx.moveTo(18, 12);
    ctx.lineTo(44, 26);
    ctx.lineTo(18, 40);
    ctx.closePath();
    ctx.fill();

    // Star on active flag
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(26, 26, 4, 0, Math.PI * 2);
    ctx.fill();

    this.safeAddCanvas(active ? 'checkpoint_active' : 'checkpoint_inactive', canvas);
  }

  private createFinishGateTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;

    // Checkered vertical banner posts
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(8, 20, 8, 100);
    ctx.fillRect(48, 20, 8, 100);

    // Archway header
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.roundRect(0, 8, 64, 24, 6);
    ctx.fill();

    // Checkered banner
    const blockSize = 6;
    for (let x = 4; x < 60; x += blockSize) {
      ctx.fillStyle = (x / blockSize) % 2 === 0 ? '#131b2e' : '#ffffff';
      ctx.fillRect(x, 14, blockSize, 12);
    }

    // Golden Crown on top
    ctx.fillStyle = '#ffddb8';
    ctx.beginPath();
    ctx.moveTo(24, 8);
    ctx.lineTo(28, 2);
    ctx.lineTo(32, 6);
    ctx.lineTo(36, 2);
    ctx.lineTo(40, 8);
    ctx.closePath();
    ctx.fill();

    this.safeAddCanvas('finish_gate', canvas);
  }

  private createBoostPlatformTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Base chassis
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(0, 4, 128, 28, 8);
    ctx.fill();

    // Top neon conveyor surface
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(4, 2, 120, 8);

    // Glowing bright cyan chevrons pointing right
    ctx.fillStyle = '#ffffff';
    for (let x = 16; x < 120; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x + 10, 16);
      ctx.lineTo(x, 24);
      ctx.lineTo(x + 5, 24);
      ctx.lineTo(x + 15, 16);
      ctx.lineTo(x + 5, 8);
      ctx.closePath();
      ctx.fill();
    }

    this.safeAddCanvas('platform_boost', canvas);
  }

  private createLargeFinishArchTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;

    // Left & Right Checkered Towers
    const towerW = 28;
    for (let y = 30; y < 170; y += 14) {
      // Left tower blocks
      ctx.fillStyle = (y / 14) % 2 === 0 ? '#0284c7' : '#ffffff';
      ctx.fillRect(8, y, towerW, 14);
      // Right tower blocks
      ctx.fillStyle = (y / 14) % 2 === 0 ? '#ffffff' : '#0284c7';
      ctx.fillRect(160 - towerW - 8, y, towerW, 14);
    }

    // Heavy gold tower caps
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.roundRect(4, 160, 36, 16, 4);
    ctx.roundRect(160 - 40, 160, 36, 16, 4);
    ctx.fill();

    // Arch Banner Beam Across Top
    ctx.fillStyle = '#fea619';
    ctx.beginPath();
    ctx.roundRect(4, 14, 152, 40, 8);
    ctx.fill();

    // Inner banner plate
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(10, 20, 140, 28, 6);
    ctx.fill();

    // Bold "FINISH" text in cheerful pop style
    ctx.fillStyle = '#006591';
    ctx.font = '900 18px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH', 80, 34);

    // Golden Trophy Crown on Arch Peak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(70, 14);
    ctx.lineTo(74, 2);
    ctx.lineTo(80, 8);
    ctx.lineTo(86, 2);
    ctx.lineTo(90, 14);
    ctx.closePath();
    ctx.fill();

    // Festive bunting pennants hanging below arch
    for (let x = 20; x < 140; x += 24) {
      ctx.fillStyle = (x / 24) % 2 === 0 ? '#f43f5e' : '#10b981';
      ctx.beginPath();
      ctx.moveTo(x, 54);
      ctx.lineTo(x + 12, 68);
      ctx.lineTo(x + 24, 54);
      ctx.closePath();
      ctx.fill();
    }

    this.safeAddCanvas('finish_arch_decorative', canvas);
  }

  private createSignTextures(): void {
    // Arrow sign pointing right
    const canvasArrow = document.createElement('canvas');
    canvasArrow.width = 64;
    canvasArrow.height = 64;
    const ctxA = canvasArrow.getContext('2d')!;

    // Wood post
    ctxA.fillStyle = '#a16207';
    ctxA.fillRect(28, 30, 8, 34);

    // Chunky yellow signboard
    ctxA.fillStyle = '#fea619';
    ctxA.beginPath();
    ctxA.roundRect(4, 6, 56, 32, 6);
    ctxA.fill();

    // White bold arrow pointing right
    ctxA.fillStyle = '#ffffff';
    ctxA.beginPath();
    ctxA.moveTo(18, 16);
    ctxA.lineTo(34, 16);
    ctxA.lineTo(34, 10);
    ctxA.lineTo(48, 22);
    ctxA.lineTo(34, 34);
    ctxA.lineTo(34, 28);
    ctxA.lineTo(18, 28);
    ctxA.closePath();
    ctxA.fill();

    this.safeAddCanvas('sign_arrow', canvasArrow);

    // Start arch signboard
    const canvasStart = document.createElement('canvas');
    canvasStart.width = 120;
    canvasStart.height = 80;
    const ctxS = canvasStart.getContext('2d')!;

    // Posts
    ctxS.fillStyle = '#a16207';
    ctxS.fillRect(10, 20, 8, 60);
    ctxS.fillRect(102, 20, 8, 60);

    // Banner
    ctxS.fillStyle = '#00b17b';
    ctxS.beginPath();
    ctxS.roundRect(4, 8, 112, 32, 8);
    ctxS.fill();

    ctxS.fillStyle = '#ffffff';
    ctxS.font = '900 16px Rubik, sans-serif';
    ctxS.textAlign = 'center';
    ctxS.textBaseline = 'middle';
    ctxS.fillText('START', 60, 24);

    this.safeAddCanvas('sign_start', canvasStart);

    // Hazard warning sign
    const canvasHazard = document.createElement('canvas');
    canvasHazard.width = 64;
    canvasHazard.height = 64;
    const ctxH = canvasHazard.getContext('2d')!;

    // Post
    ctxH.fillStyle = '#a16207';
    ctxH.fillRect(28, 30, 8, 34);

    // Diamond warning board
    ctxH.save();
    ctxH.translate(32, 22);
    ctxH.rotate(Math.PI / 4);
    ctxH.fillStyle = '#fea619';
    ctxH.beginPath();
    ctxH.roundRect(-16, -16, 32, 32, 4);
    ctxH.fill();
    ctxH.strokeStyle = '#855300';
    ctxH.lineWidth = 2;
    ctxH.stroke();
    ctxH.restore();

    // Exclamation mark
    ctxH.fillStyle = '#855300';
    ctxH.fillRect(30, 12, 4, 12);
    ctxH.fillRect(30, 27, 4, 4);

    this.safeAddCanvas('sign_hazard', canvasHazard);

    // Boost sign (Cyan double arrow)
    const canvasBoost = document.createElement('canvas');
    canvasBoost.width = 64;
    canvasBoost.height = 64;
    const ctxBst = canvasBoost.getContext('2d')!;

    ctxBst.fillStyle = '#a16207';
    ctxBst.fillRect(28, 30, 8, 34);

    ctxBst.fillStyle = '#0284c7';
    ctxBst.beginPath();
    ctxBst.roundRect(4, 6, 56, 32, 6);
    ctxBst.fill();

    ctxBst.fillStyle = '#38bdf8';
    ctxBst.beginPath();
    // Chevron 1
    ctxBst.moveTo(14, 14); ctxBst.lineTo(24, 22); ctxBst.lineTo(14, 30);
    ctxBst.lineTo(20, 30); ctxBst.lineTo(30, 22); ctxBst.lineTo(20, 14);
    // Chevron 2
    ctxBst.moveTo(30, 14); ctxBst.lineTo(40, 22); ctxBst.lineTo(30, 30);
    ctxBst.lineTo(36, 30); ctxBst.lineTo(46, 22); ctxBst.lineTo(36, 14);
    ctxBst.closePath();
    ctxBst.fill();

    this.safeAddCanvas('sign_boost', canvasBoost);
  }

  private createScenicPropTextures(): void {
    // 1. Daisy flower tuft for grass platforms
    const canvasFlower = document.createElement('canvas');
    canvasFlower.width = 48;
    canvasFlower.height = 28;
    const ctxF = canvasFlower.getContext('2d')!;

    // Little grass blades
    ctxF.fillStyle = '#00b17b';
    ctxF.beginPath();
    ctxF.moveTo(8, 28); ctxF.quadraticCurveTo(4, 16, 2, 10); ctxF.quadraticCurveTo(8, 18, 12, 28);
    ctxF.moveTo(20, 28); ctxF.quadraticCurveTo(24, 14, 28, 8); ctxF.quadraticCurveTo(26, 20, 30, 28);
    ctxF.moveTo(36, 28); ctxF.quadraticCurveTo(42, 16, 46, 12); ctxF.quadraticCurveTo(40, 20, 38, 28);
    ctxF.fill();

    // White daisy
    ctxF.fillStyle = '#ffffff';
    ctxF.beginPath();
    ctxF.arc(14, 12, 4, 0, Math.PI * 2);
    ctxF.arc(34, 14, 4, 0, Math.PI * 2);
    ctxF.fill();

    // Yellow flower centers
    ctxF.fillStyle = '#fea619';
    ctxF.beginPath();
    ctxF.arc(14, 12, 2, 0, Math.PI * 2);
    ctxF.arc(34, 14, 2, 0, Math.PI * 2);
    ctxF.fill();

    this.safeAddCanvas('prop_flower_tuft', canvasFlower);

    // 2. Checkered race barrier fence
    const canvasFence = document.createElement('canvas');
    canvasFence.width = 64;
    canvasFence.height = 36;
    const ctxFence = canvasFence.getContext('2d')!;

    // Wooden rounded posts
    ctxFence.fillStyle = '#a16207';
    ctxFence.beginPath();
    ctxFence.roundRect(6, 4, 8, 32, 3);
    ctxFence.roundRect(50, 4, 8, 32, 3);
    ctxFence.fill();

    // Checkered crossbar
    ctxFence.fillStyle = '#ffffff';
    ctxFence.beginPath();
    ctxFence.roundRect(2, 10, 60, 14, 4);
    ctxFence.fill();

    // Checkered pattern
    for (let x = 6; x < 58; x += 10) {
      ctxFence.fillStyle = ((x - 6) / 10) % 2 === 0 ? '#0284c7' : '#ffffff';
      ctxFence.fillRect(x, 10, 10, 14);
    }

    this.safeAddCanvas('prop_fence_checkered', canvasFence);

    // 3. Cute Spectator Mascot Critter (Blue)
    const canvasCritterB = document.createElement('canvas');
    canvasCritterB.width = 36;
    canvasCritterB.height = 40;
    const ctxCB = canvasCritterB.getContext('2d')!;

    // Jelly body
    ctxCB.fillStyle = '#0ea5e9';
    ctxCB.beginPath();
    ctxCB.roundRect(4, 12, 28, 26, [14, 14, 6, 6]);
    ctxCB.fill();

    // Cheerful big eyes
    ctxCB.fillStyle = '#ffffff';
    ctxCB.beginPath();
    ctxCB.arc(12, 20, 4.5, 0, Math.PI * 2);
    ctxCB.arc(24, 20, 4.5, 0, Math.PI * 2);
    ctxCB.fill();

    ctxCB.fillStyle = '#131b2e';
    ctxCB.beginPath();
    ctxCB.arc(13, 20, 2.5, 0, Math.PI * 2);
    ctxCB.arc(25, 20, 2.5, 0, Math.PI * 2);
    ctxCB.fill();

    // Cheering smile
    ctxCB.strokeStyle = '#003751';
    ctxCB.lineWidth = 1.5;
    ctxCB.beginPath();
    ctxCB.arc(18, 25, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctxCB.stroke();

    // Checkered mini pennant held up
    ctxCB.fillStyle = '#fea619';
    ctxCB.fillRect(28, 6, 2, 20);
    ctxCB.beginPath();
    ctxCB.moveTo(30, 6); ctxCB.lineTo(36, 11); ctxCB.lineTo(30, 16);
    ctxCB.closePath();
    ctxCB.fill();

    this.safeAddCanvas('prop_critter_blue', canvasCritterB);

    // 4. Cute Spectator Mascot Critter (Pink)
    const canvasCritterP = document.createElement('canvas');
    canvasCritterP.width = 36;
    canvasCritterP.height = 40;
    const ctxCP = canvasCritterP.getContext('2d')!;

    ctxCP.fillStyle = '#f43f5e';
    ctxCP.beginPath();
    ctxCP.roundRect(4, 12, 28, 26, [14, 14, 6, 6]);
    ctxCP.fill();

    ctxCP.fillStyle = '#ffffff';
    ctxCP.beginPath();
    ctxCP.arc(12, 20, 4.5, 0, Math.PI * 2);
    ctxCP.arc(24, 20, 4.5, 0, Math.PI * 2);
    ctxCP.fill();

    ctxCP.fillStyle = '#131b2e';
    ctxCP.beginPath();
    ctxCP.arc(11, 20, 2.5, 0, Math.PI * 2);
    ctxCP.arc(23, 20, 2.5, 0, Math.PI * 2);
    ctxCP.fill();

    ctxCP.strokeStyle = '#881337';
    ctxCP.lineWidth = 1.5;
    ctxCP.beginPath();
    ctxCP.arc(18, 25, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctxCP.stroke();

    ctxCP.fillStyle = '#00b17b';
    ctxCP.fillRect(4, 6, 2, 20);
    ctxCP.beginPath();
    ctxCP.moveTo(4, 6); ctxCP.lineTo(-2, 11); ctxCP.lineTo(4, 16);
    ctxCP.closePath();
    ctxCP.fill();

    this.safeAddCanvas('prop_critter_pink', canvasCritterP);

    // 5. Swaying Party Balloon Cluster
    const canvasBalloons = document.createElement('canvas');
    canvasBalloons.width = 48;
    canvasBalloons.height = 68;
    const ctxBal = canvasBalloons.getContext('2d')!;

    // Strings
    ctxBal.strokeStyle = '#94a3b8';
    ctxBal.lineWidth = 1;
    ctxBal.beginPath();
    ctxBal.moveTo(16, 26); ctxBal.lineTo(24, 66);
    ctxBal.moveTo(32, 24); ctxBal.lineTo(24, 66);
    ctxBal.moveTo(24, 18); ctxBal.lineTo(24, 66);
    ctxBal.stroke();

    // Cyan balloon
    ctxBal.fillStyle = '#0ea5e9';
    ctxBal.beginPath();
    ctxBal.ellipse(16, 18, 10, 14, -0.1, 0, Math.PI * 2);
    ctxBal.fill();

    // Pink balloon
    ctxBal.fillStyle = '#f43f5e';
    ctxBal.beginPath();
    ctxBal.ellipse(32, 16, 10, 14, 0.1, 0, Math.PI * 2);
    ctxBal.fill();

    // Yellow top balloon
    ctxBal.fillStyle = '#fea619';
    ctxBal.beginPath();
    ctxBal.ellipse(24, 12, 11, 15, 0, 0, Math.PI * 2);
    ctxBal.fill();

    // Specular highlight
    ctxBal.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctxBal.beginPath();
    ctxBal.arc(21, 8, 3, 0, Math.PI * 2);
    ctxBal.fill();

    this.safeAddCanvas('prop_balloon_bundle', canvasBalloons);

    // 6. Toy Windmill Base & Blades
    const canvasWindmillBase = document.createElement('canvas');
    canvasWindmillBase.width = 48;
    canvasWindmillBase.height = 72;
    const ctxWB = canvasWindmillBase.getContext('2d')!;

    // Tapered tower
    ctxWB.fillStyle = '#e2e8f0';
    ctxWB.beginPath();
    ctxWB.moveTo(16, 16); ctxWB.lineTo(32, 16); ctxWB.lineTo(38, 70); ctxWB.lineTo(10, 70);
    ctxWB.closePath();
    ctxWB.fill();
    ctxWB.strokeStyle = '#cbd5e1';
    ctxWB.lineWidth = 2;
    ctxWB.stroke();

    // Conical roof
    ctxWB.fillStyle = '#f43f5e';
    ctxWB.beginPath();
    ctxWB.moveTo(24, 2); ctxWB.lineTo(12, 16); ctxWB.lineTo(36, 16);
    ctxWB.closePath();
    ctxWB.fill();

    this.safeAddCanvas('bg_windmill_base', canvasWindmillBase);

    const canvasWindmillBlades = document.createElement('canvas');
    canvasWindmillBlades.width = 64;
    canvasWindmillBlades.height = 64;
    const ctxWBl = canvasWindmillBlades.getContext('2d')!;

    // 4 colorful rotating blades
    const colors = ['#fea619', '#00b17b', '#0ea5e9', '#f43f5e'];
    for (let i = 0; i < 4; i++) {
      ctxWBl.save();
      ctxWBl.translate(32, 32);
      ctxWBl.rotate((i * Math.PI) / 2);
      ctxWBl.fillStyle = colors[i];
      ctxWBl.beginPath();
      ctxWBl.roundRect(2, -4, 26, 8, 3);
      ctxWBl.fill();
      ctxWBl.restore();
    }

    // Center pin
    ctxWBl.fillStyle = '#131b2e';
    ctxWBl.beginPath();
    ctxWBl.arc(32, 32, 4, 0, Math.PI * 2);
    ctxWBl.fill();

    this.safeAddCanvas('bg_windmill_blades', canvasWindmillBlades);
  }

  private createSkyGradientTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 850;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, 850);
    grad.addColorStop(0.0, '#38bdf8'); // High vibrant sky
    grad.addColorStop(0.35, '#7dd3fc');
    grad.addColorStop(0.65, '#bae6fd');
    grad.addColorStop(0.85, '#fef08a'); // Warm golden horizon
    grad.addColorStop(1.0, '#fed7aa'); // Soft sunset peach glow

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 850);

    this.safeAddCanvas('sky_gradient', canvas);
  }

  private createParticleDashTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(0, 1, 24, 6, 3);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(4, 2, 16, 4, 2);
    ctx.fill();

    this.safeAddCanvas('particle_dash', canvas);
  }

  private createBackgroundDecorTextures(): void {
    // Distant hot air balloon
    const canvasBalloon = document.createElement('canvas');
    canvasBalloon.width = 64;
    canvasBalloon.height = 80;
    const ctxB = canvasBalloon.getContext('2d')!;

    // Balloon envelope
    ctxB.fillStyle = '#f43f5e';
    ctxB.beginPath();
    ctxB.arc(32, 28, 24, 0, Math.PI * 2);
    ctxB.fill();

    // Yellow center stripe
    ctxB.fillStyle = '#fea619';
    ctxB.beginPath();
    ctxB.ellipse(32, 28, 12, 24, 0, 0, Math.PI * 2);
    ctxB.fill();

    // Cyan center stripe
    ctxB.fillStyle = '#38bdf8';
    ctxB.beginPath();
    ctxB.ellipse(32, 28, 5, 24, 0, 0, Math.PI * 2);
    ctxB.fill();

    // Ropes
    ctxB.strokeStyle = '#64748b';
    ctxB.lineWidth = 1;
    ctxB.beginPath();
    ctxB.moveTo(20, 50); ctxB.lineTo(26, 62);
    ctxB.moveTo(44, 50); ctxB.lineTo(38, 62);
    ctxB.stroke();

    // Basket
    ctxB.fillStyle = '#b45309';
    ctxB.beginPath();
    ctxB.roundRect(24, 62, 16, 12, 2);
    ctxB.fill();

    this.safeAddCanvas('bg_hot_air_balloon', canvasBalloon);
  }

  private createParticleStarTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(8, 0); ctx.lineTo(10, 6); ctx.lineTo(16, 8);
    ctx.lineTo(10, 10); ctx.lineTo(8, 16); ctx.lineTo(6, 10);
    ctx.lineTo(0, 8); ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();

    this.safeAddCanvas('particle_star', canvas);
  }

  private createParticleCloudTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();

    this.safeAddCanvas('particle_cloud', canvas);
  }
}
