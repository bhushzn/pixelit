import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { CLOUD_CLIMB_MAP } from '../maps/cloudClimb';
import { getMapById } from '../maps/mapRegistry';
import { MapDefinition, CheckpointDef } from '../maps/types';
import { RaceManager } from '../systems/RaceManager';
import { PowerUpManager } from '../powerups/PowerUpManager';

interface MovingPlatformObject {
  sprite: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image;
  body: Phaser.Physics.Arcade.Body;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  speed: number;
  dirX: number;
  dirY: number;
}

export class RaceScene extends Phaser.Scene {
  public player!: Player;
  public raceManager!: RaceManager;
  public powerUpManager!: PowerUpManager;
  private keyE!: Phaser.Input.Keyboard.Key;

  public mapData!: MapDefinition;
  private mapId: string = 'cloud_climb';

  // Collision groups
  private solidPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private bouncePlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatformObjects: MovingPlatformObject[] = [];

  // Overlap groups
  private boostPadsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private hazardsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private coinsGroup!: Phaser.Physics.Arcade.StaticGroup;

  // Triggers & Flags
  private checkpointSprite!: Phaser.GameObjects.Sprite;
  private checkpointTriggerBox!: Phaser.GameObjects.Zone;
  private finishTriggerBox!: Phaser.GameObjects.Zone;
  private isCheckpointPassed = false;
  private isRaceFinished = false;

  // Keyboard Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;

  // External touch controls for mobile
  public externalInput = {
    left: false,
    right: false,
    jump: false,
    dash: false,
    usePowerUp: false,
  };

  constructor() {
    super({ key: 'RaceScene' });
  }

  create(): void {
    this.mapData = CLOUD_CLIMB_MAP;
    this.isCheckpointPassed = false;
    this.isRaceFinished = false;
    this.movingPlatformObjects = [];

    // 1. World Bounds & Ambient Sky
    this.physics.world.setBounds(0, 0, this.mapData.worldWidth, this.mapData.worldHeight);
    this.cameras.main.setBounds(0, 0, this.mapData.worldWidth, this.mapData.worldHeight);
    this.cameras.main.setBackgroundColor('#c9e6ff');

    // 2. Parallax Visual Backdrop (Lush Toy-Box Sky)
    this.createParallaxBackdrop();

    // 3. Static & Moving Platforms (Solid Colliders)
    this.createPlatforms();

    // 4. Boost Pads & Trampoline Bounce Pads
    this.createBoostPads();

    // 5. Cartoon Hazards
    this.createHazards();

    // 6. Collectible Gold Coins
    this.createCoins();

    // 7. Checkpoint & Separate Finish Trigger
    this.createCheckpointAndFinish();

    // 8. Player Entity
    this.player = new Player(
      this,
      this.mapData.startSpawn,
      this.mapData.checkpointSpawn
    );

    // 9. Camera Follow (Smooth, framed look-ahead, no gigantic voids)
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08, -120, 60);
    this.cameras.main.setDeadzone(100, 70);

    // 10. Setup Physics Colliders & Overlaps
    this.setupPhysics();

    // 11. Input Setup
    this.setupInputs();

    // 12. Setup Race Manager
    this.raceManager = new RaceManager(
      this.mapData.startSpawn.x,
      this.mapData.finishTrigger.x
    );
    this.raceManager.startRace();

    // 13. Power-Up System Setup
    this.powerUpManager = new PowerUpManager(this);
    this.powerUpManager.initPickups(this.mapData.powerUps);
  }

  private createParallaxBackdrop(): void {
    const { worldWidth, worldHeight } = this.mapData;

    // 1. Layer -10: Sky Gradient Backdrop (Warm daylight to sunrise peach)
    if (this.textures.exists('sky_gradient')) {
      const sky = this.add.tileSprite(worldWidth / 2, worldHeight / 2, worldWidth + 2000, worldHeight, 'sky_gradient');
      sky.setScrollFactor(0.04, 0);
      sky.setDepth(-10);
    }

    // 1b. Layer -9: Volumetric Sunlight God Rays
    if (this.textures.exists('fx_god_ray')) {
      for (let x = 200; x < worldWidth; x += 1200) {
        const ray = this.add.image(x, 60, 'fx_god_ray');
        ray.setOrigin(0.2, 0);
        ray.setScrollFactor(0.08, 0.05);
        ray.setDepth(-9);
        ray.setAlpha(0.7);

        this.tweens.add({
          targets: ray,
          alpha: 0.35,
          duration: 3200 + (x % 1000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }

    // 2. Layer -7: Distant billowy cloud banks
    for (let x = 80; x < worldWidth; x += 550) {
      const cy = 110 + ((x * 19) % 210);
      const cloud = this.add.image(x, cy, 'platform_cloud');
      cloud.setScale(1.6, 1.3);
      cloud.setAlpha(0.4);
      cloud.setScrollFactor(0.1, 0.1);
      cloud.setDepth(-7);
    }

    // 3. Layer -6: Distant floating islands with spinning toy windmills
    for (let x = 320; x < worldWidth; x += 950) {
      const iy = 270 + ((x * 13) % 170);
      const island = this.add.image(x, iy, 'bg_floating_island');
      island.setScale(0.9);
      island.setAlpha(0.68);
      island.setScrollFactor(0.18, 0.18);
      island.setDepth(-6);

      // Add charming rotating toy windmill on select distant islands
      if (x % 1900 < 950 && this.textures.exists('bg_windmill_base') && this.textures.exists('bg_windmill_blades')) {
        const wb = this.add.image(x + 25, iy - 42, 'bg_windmill_base');
        wb.setScale(0.75);
        wb.setAlpha(0.75);
        wb.setScrollFactor(0.18, 0.18);
        wb.setDepth(-5);

        const wblades = this.add.image(x + 25, iy - 66, 'bg_windmill_blades');
        wblades.setScale(0.75);
        wblades.setAlpha(0.85);
        wblades.setScrollFactor(0.18, 0.18);
        wblades.setDepth(-5);

        this.tweens.add({
          targets: wblades,
          angle: 360,
          duration: 9000 + (x % 1500),
          repeat: -1,
          ease: 'Linear',
        });
      }
    }

    // 4. Layer -4: Whimsical hot air balloons bobbing in distance
    for (let x = 650; x < worldWidth; x += 1400) {
      const by = 150 + ((x * 7) % 150);
      const balloon = this.add.image(x, by, 'bg_hot_air_balloon');
      balloon.setScale(0.8);
      balloon.setAlpha(0.75);
      balloon.setScrollFactor(0.22, 0.22);
      balloon.setDepth(-4);

      this.tweens.add({
        targets: balloon,
        y: by - 26,
        duration: 2500 + (x % 600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // 5. Layer -3: Midground puffy clouds
    for (let x = 200; x < worldWidth; x += 750) {
      const cy = 200 + ((x * 23) % 190);
      const midCloud = this.add.image(x, cy, 'platform_cloud');
      midCloud.setScale(1.2, 1.0);
      midCloud.setAlpha(0.55);
      midCloud.setScrollFactor(0.35, 0.35);
      midCloud.setDepth(-3);
    }

    // 5b. Layer -2: Animated Flying Birds Flock across sky
    if (this.textures.exists('bird_pixel_sheet')) {
      for (let i = 0; i < 6; i++) {
        const bx = 350 + i * 1100;
        const by = 120 + ((i * 47) % 150);
        const bird = this.add.sprite(bx, by, 'bird_pixel_sheet');
        bird.setScale(1.2);
        bird.setScrollFactor(0.28, 0.28);
        bird.setDepth(-2);
        if (this.anims.exists('bird_fly')) {
          bird.play('bird_fly');
        }

        // Drifting horizontal flight path
        this.tweens.add({
          targets: bird,
          x: bx + 1800,
          y: by + ((i % 2 === 0 ? 35 : -35)),
          duration: 18000 + i * 2500,
          repeat: -1,
          ease: 'Linear',
        });
      }
    }

    // 6. Layer 2: Decorative Start Arch & Cloud Harbor Landmark
    if (this.textures.exists('prop_cloud_harbor')) {
      const harbor = this.add.image(130, 540, 'prop_cloud_harbor');
      harbor.setOrigin(0.5, 1);
      harbor.setDepth(2);
    }

    if (this.mapData.decorativeStartArch) {
      const arch = this.add.image(this.mapData.decorativeStartArch.x, this.mapData.decorativeStartArch.y, 'sign_start');
      arch.setOrigin(0.5, 1);
      arch.setDepth(2);
    }

    // 6b. Layer 2: Ancient Ruins Pillars Landmarks
    if (this.textures.exists('prop_ancient_ruins')) {
      const ruin1 = this.add.image(3040, 520, 'prop_ancient_ruins');
      ruin1.setOrigin(0.5, 1);
      ruin1.setDepth(2);

      const ruin2 = this.add.image(4440, 480, 'prop_ancient_ruins');
      ruin2.setOrigin(0.5, 1);
      ruin2.setDepth(2);
    }

    // 7. Layer 2: Directional & Warning Signs
    for (const sign of this.mapData.decorativeSigns) {
      let textureKey = 'sign_arrow';
      if (sign.type === 'hazard') textureKey = 'sign_hazard';
      else if (sign.type === 'boost') textureKey = 'sign_boost';

      const s = this.add.image(sign.x, sign.y, textureKey);
      s.setOrigin(0.5, 1);
      s.setDepth(2);
    }

    // 8. Layer 2: Trackside Scenic Props (Balloons, Flowers, Fences, Cheering Mascots)
    if (this.mapData.scenicProps) {
      for (const prop of this.mapData.scenicProps) {
        let key = '';
        let isCritter = false;
        let isBalloon = false;

        if (prop.type === 'flower_tuft') key = 'prop_flower_tuft';
        else if (prop.type === 'fence_checkered') key = 'prop_fence_checkered';
        else if (prop.type === 'balloon_bundle') { key = 'prop_balloon_bundle'; isBalloon = true; }
        else if (prop.type === 'critter_blue') { key = 'prop_critter_blue'; isCritter = true; }
        else if (prop.type === 'critter_pink') { key = 'prop_critter_pink'; isCritter = true; }

        if (key && this.textures.exists(key)) {
          const sprite = this.add.image(prop.x, prop.y, key);
          sprite.setOrigin(0.5, 1);
          sprite.setDepth(2);

          if (isCritter) {
            // Cheerful spectator jumping bounce
            this.tweens.add({
              targets: sprite,
              y: prop.y - 10,
              scaleY: 1.08,
              scaleX: 0.94,
              duration: 380 + (prop.x % 220),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          } else if (isBalloon) {
            // Gentle wind sway
            this.tweens.add({
              targets: sprite,
              angle: 6,
              duration: 1700 + (prop.x % 400),
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          }
        }
      }
    }

    // 9. Layer 25: Soft foreground clouds drifting past lower screen edge (3D parallax depth)
    for (let x = 150; x < worldWidth; x += 850) {
      const fgCloud = this.add.image(x, worldHeight - 30, 'platform_cloud');
      fgCloud.setScale(1.8, 1.3);
      fgCloud.setAlpha(0.24);
      fgCloud.setScrollFactor(1.15, 1.0);
      fgCloud.setDepth(25);
    }
  }

  private createPlatforms(): void {
    this.solidPlatforms = this.physics.add.staticGroup();
    this.bouncePlatforms = this.physics.add.staticGroup();

    // Static Platforms
    for (const p of this.mapData.platforms) {
      if (p.type === 'bounce') {
        const bounceSprite = this.add.tileSprite(
          p.x + p.width / 2,
          p.y + p.height / 2,
          p.width,
          p.height,
          'platform_bounce'
        );
        this.bouncePlatforms.add(bounceSprite);
      } else {
        const textureKey = p.type === 'cloud' ? 'platform_cloud' : 'platform_grass';
        const sprite = this.add.tileSprite(
          p.x + p.width / 2,
          p.y + p.height / 2,
          p.width,
          p.height,
          textureKey
        );
        this.solidPlatforms.add(sprite);
      }
    }

    // Moving Platforms
    for (const mov of this.mapData.movingPlatforms) {
      const textureKey = mov.type === 'hover' ? 'platform_hover' : 'platform_cloud';
      const startCenterX = mov.x + mov.width / 2;
      const startCenterY = mov.y + mov.height / 2;
      const targetCenterX = startCenterX + mov.distanceX;
      const targetCenterY = startCenterY + mov.distanceY;

      const sprite = this.add.tileSprite(
        startCenterX,
        startCenterY,
        mov.width,
        mov.height,
        textureKey
      );

      this.physics.add.existing(sprite, false);
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setAllowGravity(false);
      body.setFriction(1, 1);

      const minX = Math.min(startCenterX, targetCenterX);
      const maxX = Math.max(startCenterX, targetCenterX);
      const minY = Math.min(startCenterY, targetCenterY);
      const maxY = Math.max(startCenterY, targetCenterY);

      const dirX = mov.distanceX !== 0 ? (mov.distanceX > 0 ? 1 : -1) : 0;
      const dirY = mov.distanceY !== 0 ? (mov.distanceY > 0 ? 1 : -1) : 0;

      body.setVelocity(dirX * mov.speed, dirY * mov.speed);

      this.movingPlatformObjects.push({
        sprite,
        body,
        minX,
        maxX,
        minY,
        maxY,
        speed: mov.speed,
        dirX,
        dirY,
      });
    }
  }

  private createBoostPads(): void {
    this.boostPadsGroup = this.physics.add.staticGroup();

    for (const b of this.mapData.boostPads) {
      const pad = this.add.tileSprite(
        b.x + b.width / 2,
        b.y + b.height / 2,
        b.width,
        b.height,
        'platform_boost'
      );
      this.boostPadsGroup.add(pad);
    }
  }

  private createHazards(): void {
    this.hazardsGroup = this.physics.add.staticGroup();

    for (const h of this.mapData.hazards) {
      const hazardSprite = this.add.tileSprite(
        h.x + h.width / 2,
        h.y + h.height / 2,
        h.width,
        h.height,
        'hazard_spike'
      );
      this.hazardsGroup.add(hazardSprite);
    }
  }

  private createCoins(): void {
    this.coinsGroup = this.physics.add.staticGroup();

    for (const c of this.mapData.coins) {
      const textureKey = this.textures.exists('coin_pixel_sheet') ? 'coin_pixel_sheet' : 'coin';
      const coin = this.coinsGroup.create(c.x, c.y, textureKey) as Phaser.Physics.Arcade.Sprite;
      coin.setScale(1.1);

      if (this.anims && this.anims.exists('coin_spin')) {
        coin.play('coin_spin');
      }

      // Cute idle hover bob
      this.tweens.add({
        targets: coin,
        y: c.y - 7,
        duration: 1100 + ((c.x * 5) % 400),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createCheckpointAndFinish(): void {
    // 1. Checkpoint Pennant Flag (Animated pixel flag)
    const cpData = this.mapData.checkpoints[0];
    const initialCpKey = this.textures.exists('checkpoint_inactive_sheet') ? 'checkpoint_inactive_sheet' : 'checkpoint_inactive';
    this.checkpointSprite = this.add.sprite(cpData.x, cpData.y, initialCpKey);
    this.checkpointSprite.setOrigin(0.5, 1);
    this.checkpointSprite.setDepth(2);
    if (this.anims && this.anims.exists('checkpoint_inactive_anim')) {
      this.checkpointSprite.play('checkpoint_inactive_anim');
    }

    // Checkpoint Trigger Zone (No blocking physics, overlap only)
    this.checkpointTriggerBox = this.add.zone(
      cpData.x - 20,
      cpData.y - 45,
      cpData.width + 40,
      cpData.height + 20
    );
    this.physics.add.existing(this.checkpointTriggerBox, true);

    // 2. Grand Decorative Finish Arch (Pixel Sky Gate)
    const archKey = this.textures.exists('bg_large_finish_arch') ? 'bg_large_finish_arch' : 'finish_arch_decorative';
    const finishArch = this.add.image(
      this.mapData.decorativeFinishArch.x,
      this.mapData.decorativeFinishArch.y,
      archKey
    );
    finishArch.setOrigin(0.5, 1);
    finishArch.setDepth(3);

    // 3. Separate Invisible Finish Trigger Zone (Overlap only, activates once)
    const ft = this.mapData.finishTrigger;
    this.finishTriggerBox = this.add.zone(
      ft.x + ft.width / 2,
      ft.y + ft.height / 2,
      ft.width,
      ft.height
    );
    this.physics.add.existing(this.finishTriggerBox, true);
  }

  private setupPhysics(): void {
    // Solid platform collisions
    this.physics.add.collider(this.player, this.solidPlatforms);

    // Moving platform collisions (Arcade physics carries player)
    for (const mov of this.movingPlatformObjects) {
      this.physics.add.collider(this.player, mov.sprite);
    }

    // Bounce platform collisions
    this.physics.add.collider(this.player, this.bouncePlatforms, () => {
      this.player.springBounce();
    });

    // Boost pad overlaps
    this.physics.add.overlap(this.player, this.boostPadsGroup, () => {
      this.player.applyBoostPad();
    });

    // Hazard overlaps (Take hit recoil)
    this.physics.add.overlap(this.player, this.hazardsGroup, () => {
      this.player.takeHazardHit();
    });

    // Power-up pickup overlaps
    this.physics.add.overlap(this.player, this.powerUpManager.pickupsGroup, (_player, pickupObj) => {
      this.powerUpManager.collectPickup(pickupObj as any);
    });

    // Coin collection overlaps
    this.physics.add.overlap(this.player, this.coinsGroup, (_player, coinObj) => {
      const coin = coinObj as Phaser.Physics.Arcade.Sprite;
      this.collectCoin(coin);
    });

    // Checkpoint trigger overlap
    this.physics.add.overlap(this.player, this.checkpointTriggerBox, () => {
      this.triggerCheckpoint();
    });

    // Separate finish trigger overlap
    this.physics.add.overlap(this.player, this.finishTriggerBox, () => {
      this.triggerFinish();
    });
  }

  private collectCoin(coin: Phaser.Physics.Arcade.Sprite): void {
    if (!coin.active) return;
    coin.setActive(false);
    coin.setVisible(false);
    this.raceManager.addCoin(1);

    // Sparkle burst
    if (this.textures.exists('particle_star')) {
      const emitter = this.add.particles(coin.x, coin.y, 'particle_star', {
        speed: { min: 30, max: 90 },
        scale: { start: 0.8, end: 0 },
        lifespan: 250,
        quantity: 5,
        emitting: false,
      });
      emitter.explode();
      this.time.delayedCall(300, () => emitter.destroy());
    }
  }

  private triggerCheckpoint(): void {
    if (this.isCheckpointPassed) return;
    this.isCheckpointPassed = true;

    // 1. Update pennant visual
    if (this.anims && this.anims.exists('checkpoint_active_anim')) {
      this.checkpointSprite.play('checkpoint_active_anim');
    } else {
      this.checkpointSprite.setTexture('checkpoint_active');
    }

    // 2. Set safe checkpoint spawn on player
    this.player.setCheckpointReached();

    // 3. Notify race manager (updates HUD to '✓ Checkpoint' and triggers toast)
    this.raceManager.passCheckpoint();

    // 4. Sparkle celebratory flare
    if (this.textures.exists('particle_star')) {
      const emitter = this.add.particles(this.checkpointSprite.x, this.checkpointSprite.y - 50, 'particle_star', {
        speed: { min: 40, max: 120 },
        scale: { start: 1, end: 0 },
        lifespan: 400,
        quantity: 12,
        emitting: false,
      });
      emitter.explode();
      this.time.delayedCall(500, () => emitter.destroy());
    }
  }

  private triggerFinish(): void {
    if (this.isRaceFinished) return;
    this.isRaceFinished = true;

    // 1. Stop race manager & get stats
    const stats = this.raceManager.finishRace();
    if (!stats) return;

    // 2. Mark player finished and disable physics
    this.player.markFinished();

    // 3. Celebratory fireworks & confetti
    if (this.textures.exists('particle_star')) {
      const emitter = this.add.particles(this.player.x, this.player.y - 40, 'particle_star', {
        speed: { min: 80, max: 220 },
        scale: { start: 1.2, end: 0 },
        lifespan: 900,
        quantity: 35,
        emitting: false,
      });
      emitter.explode();
    }

    this.cameras.main.flash(300, 255, 255, 255);

    // 4. Emit event once to open Results Screen
    this.events.emit('race_finished', stats);
  }

  private setupInputs(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
  }

  public setExternalInput(input: typeof this.externalInput): void {
    this.externalInput = { ...input };
  }

  update(time: number, delta: number): void {
    // 1. Gather Inputs
    const left =
      (this.cursors?.left?.isDown ?? false) ||
      (this.keyA?.isDown ?? false) ||
      this.externalInput.left;

    const right =
      (this.cursors?.right?.isDown ?? false) ||
      (this.keyD?.isDown ?? false) ||
      this.externalInput.right;

    const jump =
      (this.cursors?.up?.isDown ?? false) ||
      (this.keyW?.isDown ?? false) ||
      (this.keySpace?.isDown ?? false) ||
      this.externalInput.jump;

    const dash =
      (this.keyShift?.isDown ?? false) ||
      this.externalInput.dash;

    // 2. Update Player
    this.player.update(time, delta, { left, right, jump, dash });

    // 3. Update Moving Platforms
    this.updateMovingPlatforms();

    // 3b. Check Power-Up Activation
    if ((this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE)) || this.externalInput.usePowerUp) {
      this.powerUpManager.activatePowerUp(this.player);
      this.externalInput.usePowerUp = false;
    }
    this.powerUpManager.update(delta, this.player, this.coinsGroup);
    this.raceManager.setPowerUpState(this.powerUpManager.heldPowerUp, this.powerUpManager.isActive);

    // 4. Update Race Progress
    this.raceManager.update(this.player.x);

    // 5. Check Kill Plane / Falling out of level
    if (this.player.y > this.mapData.killPlaneY) {
      this.player.respawnAtSafeSpawn();
    }
  }

  private updateMovingPlatforms(): void {
    for (const mov of this.movingPlatformObjects) {
      // Horizontal oscillation
      if (mov.minX !== mov.maxX) {
        if (mov.sprite.x >= mov.maxX && mov.dirX > 0) {
          mov.dirX = -1;
          mov.body.setVelocityX(-mov.speed);
        } else if (mov.sprite.x <= mov.minX && mov.dirX < 0) {
          mov.dirX = 1;
          mov.body.setVelocityX(mov.speed);
        }
      }

      // Vertical oscillation
      if (mov.minY !== mov.maxY) {
        if (mov.sprite.y >= mov.maxY && mov.dirY > 0) {
          mov.dirY = -1;
          mov.body.setVelocityY(-mov.speed);
        } else if (mov.sprite.y <= mov.minY && mov.dirY < 0) {
          mov.dirY = 1;
          mov.body.setVelocityY(mov.speed);
        }
      }
    }
  }
}
