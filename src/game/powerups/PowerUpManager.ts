import Phaser from 'phaser';
import { PowerUpDefinition, PowerUpInventoryState, PowerUpPickupDef, PowerUpType } from './types';
import { getPowerUpById, rollPowerUp } from './powerUpRegistry';

export class PowerUpManager {
  private scene: Phaser.Scene;
  public heldPowerUp: PowerUpDefinition | null = null;
  public isActive = false;
  public activeRemainingMs = 0;
  public cooldownRemainingMs = 0;

  // Track active scene entities spawned by power-ups
  private spawnedEntities: Phaser.GameObjects.GameObject[] = [];
  public pickupsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private pickupSprites: Phaser.Physics.Arcade.Sprite[] = [];

  // Active effect states
  public isMagnetActive = false;
  private magnetTimer = 0;
  private speedModifierTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.pickupsGroup = scene.physics.add.staticGroup();
  }

  public initPickups(pickupDefs?: PowerUpPickupDef[]): void {
    this.reset();
    if (!pickupDefs || pickupDefs.length === 0) return;

    for (const def of pickupDefs) {
      const textureKey = this.scene.textures.exists('pickup_gift_box') ? 'pickup_gift_box' : 'coin';
      const pickup = this.pickupsGroup.create(def.x, def.y, textureKey) as Phaser.Physics.Arcade.Sprite;
      pickup.setScale(1.1);
      pickup.setDepth(5);
      pickup.setData('pool', def.pool ?? 'default');
      pickup.setData('isAvailable', true);
      this.pickupSprites.push(pickup);

      // Cute idle floating tween
      this.scene.tweens.add({
        targets: pickup,
        y: def.y - 10,
        duration: 1200 + ((def.x * 7) % 400),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  public collectPickup(pickup: Phaser.Physics.Arcade.Sprite): PowerUpDefinition | null {
    if (!pickup.active || !pickup.getData('isAvailable')) {
      return null;
    }

    // Award rolled power-up
    const powerUp = rollPowerUp();
    this.heldPowerUp = powerUp;

    // Disable pickup
    pickup.setActive(false);
    pickup.setVisible(false);
    pickup.setData('isAvailable', false);

    // Particle burst
    if (this.scene.textures.exists('particle_star')) {
      const emitter = this.scene.add.particles(pickup.x, pickup.y, 'particle_star', {
        speed: { min: 40, max: 120 },
        scale: { start: 1, end: 0 },
        lifespan: 350,
        quantity: 10,
        emitting: false,
      });
      emitter.explode();
      this.scene.time.delayedCall(400, () => emitter.destroy());
    }

    return powerUp;
  }

  public activatePowerUp(player: any): boolean {
    if (!this.heldPowerUp || this.isActive || this.cooldownRemainingMs > 0) {
      return false;
    }

    const p = this.heldPowerUp;
    this.isActive = true;
    this.activeRemainingMs = p.durationMs;
    this.cooldownRemainingMs = p.cooldownMs;

    this.executeEffect(p.id, player);

    // If instant (duration 0), clear active immediately
    if (p.durationMs <= 0) {
      this.isActive = false;
      this.heldPowerUp = null;
    }

    return true;
  }

  private executeEffect(type: PowerUpType, player: any): void {
    const isFacingRight = !(player.flipX ?? false);
    const dir = isFacingRight ? 1 : -1;

    switch (type) {
      case 'banana_bounce': {
        // Drop a banana peel on the floor
        const bananaKey = this.scene.textures.exists('powerup_banana') ? 'powerup_banana' : 'hazard_spike';
        const banana = this.scene.physics.add.sprite(player.x - dir * 30, player.y + 12, bananaKey);
        banana.setDepth(6);
        (banana.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        (banana.body as Phaser.Physics.Arcade.Body).setImmovable(true);
        this.spawnedEntities.push(banana);

        // Trap collision with player
        const collider = this.scene.physics.add.overlap(player, banana, () => {
          player.springBounce();
          // Visual celebration flare
          if (this.scene.textures.exists('particle_star')) {
            const emitter = this.scene.add.particles(banana.x, banana.y, 'particle_star', {
              speed: { min: 30, max: 80 },
              scale: { start: 0.8, end: 0 },
              lifespan: 300,
              quantity: 8,
              emitting: false,
            });
            emitter.explode();
            this.scene.time.delayedCall(350, () => emitter.destroy());
          }
          collider.destroy();
          banana.destroy();
        });

        // Auto-cleanup after 12 seconds if not triggered
        this.scene.time.delayedCall(12000, () => {
          if (banana && banana.active) {
            collider.destroy();
            banana.destroy();
          }
        });
        break;
      }

      case 'mini_tornado': {
        // Spawn spinning whirlwind traveling forward
        const tornadoKey = this.scene.textures.exists('powerup_tornado') ? 'powerup_tornado' : 'particle_star';
        const tornado = this.scene.physics.add.sprite(player.x + dir * 40, player.y, tornadoKey);
        tornado.setDepth(7);
        tornado.setScale(1.2);
        const body = tornado.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setVelocityX(dir * 380);
        this.spawnedEntities.push(tornado);

        // Spin animation
        this.scene.tweens.add({
          targets: tornado,
          angle: 360,
          duration: 300,
          repeat: -1,
        });

        // Auto cleanup after duration
        this.scene.time.delayedCall(2500, () => {
          if (tornado && tornado.active) {
            tornado.destroy();
          }
        });
        break;
      }

      case 'freeze_pop': {
        // Flings icy popsicle projectile forward
        const iceKey = this.scene.textures.exists('powerup_ice') ? 'powerup_ice' : 'particle_star';
        const ice = this.scene.physics.add.sprite(player.x + dir * 35, player.y, iceKey);
        ice.setDepth(7);
        const body = ice.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setVelocityX(dir * 540);
        this.spawnedEntities.push(ice);

        this.scene.time.delayedCall(1800, () => {
          if (ice && ice.active) ice.destroy();
        });
        break;
      }

      case 'wind_blast': {
        // Forward gust speed boost on player & air blast
        const pBody = player.body as Phaser.Physics.Arcade.Body;
        pBody.setVelocityX(dir * 560);
        this.scene.cameras.main.shake(120, 0.004);

        if (this.scene.textures.exists('particle_star')) {
          const emitter = this.scene.add.particles(player.x - dir * 20, player.y, 'particle_star', {
            speed: { min: 50, max: 140 },
            scale: { start: 1.2, end: 0 },
            lifespan: 250,
            quantity: 12,
            emitting: false,
          });
          emitter.explode();
          this.scene.time.delayedCall(300, () => emitter.destroy());
        }
        break;
      }

      case 'boomerang_bonk': {
        // Returning foam boomerang
        const boomKey = this.scene.textures.exists('powerup_boomerang') ? 'powerup_boomerang' : 'particle_star';
        const startX = player.x;
        const boom = this.scene.physics.add.sprite(player.x + dir * 30, player.y, boomKey);
        boom.setDepth(7);
        const bBody = boom.body as Phaser.Physics.Arcade.Body;
        bBody.setAllowGravity(false);
        bBody.setVelocityX(dir * 460);
        this.spawnedEntities.push(boom);

        this.scene.tweens.add({
          targets: boom,
          angle: 360,
          duration: 250,
          repeat: -1,
        });

        // Return trip after 800ms
        this.scene.time.delayedCall(800, () => {
          if (boom && boom.active) {
            bBody.setVelocityX(-dir * 460);
          }
        });

        // Cleanup after 1600ms
        this.scene.time.delayedCall(1600, () => {
          if (boom && boom.active) {
            boom.destroy();
          }
        });
        break;
      }

      case 'coin_magnet': {
        this.isMagnetActive = true;
        this.magnetTimer = 6000;
        break;
      }
    }
  }

  public update(delta: number, player?: any, coinsGroup?: Phaser.Physics.Arcade.StaticGroup): void {
    // Update active timers
    if (this.isActive) {
      this.activeRemainingMs -= delta;
      if (this.activeRemainingMs <= 0) {
        this.isActive = false;
        this.heldPowerUp = null;
      }
    }

    if (this.cooldownRemainingMs > 0) {
      this.cooldownRemainingMs = Math.max(0, this.cooldownRemainingMs - delta);
    }

    // Coin magnet active update
    if (this.isMagnetActive && player && coinsGroup) {
      this.magnetTimer -= delta;
      if (this.magnetTimer <= 0) {
        this.isMagnetActive = false;
      } else {
        const magnetRadius = 360;
        const magnetSpeed = 440;
        coinsGroup.getChildren().forEach((coinObj: any) => {
          if (coinObj && coinObj.active) {
            const dist = Phaser.Math.Distance.Between(coinObj.x, coinObj.y, player.x, player.y);
            if (dist < magnetRadius) {
              const angle = Phaser.Math.Angle.Between(coinObj.x, coinObj.y, player.x, player.y);
              coinObj.x += Math.cos(angle) * (magnetSpeed * (delta / 1000));
              coinObj.y += Math.sin(angle) * (magnetSpeed * (delta / 1000));
            }
          }
          return null;
        });
      }
    }
  }

  public reset(): void {
    this.heldPowerUp = null;
    this.isActive = false;
    this.activeRemainingMs = 0;
    this.cooldownRemainingMs = 0;
    this.isMagnetActive = false;
    this.magnetTimer = 0;

    for (const entity of this.spawnedEntities) {
      if (entity && (entity as any).active) {
        entity.destroy();
      }
    }
    this.spawnedEntities = [];

    for (const p of this.pickupSprites) {
      if (p) p.destroy();
    }
    this.pickupSprites = [];
    if (this.pickupsGroup) {
      this.pickupsGroup.clear(true, true);
    }
  }

  public getInventoryState(): PowerUpInventoryState {
    return {
      held: this.heldPowerUp,
      isActive: this.isActive,
      activeRemainingMs: Math.max(0, this.activeRemainingMs),
      cooldownRemainingMs: Math.max(0, this.cooldownRemainingMs),
    };
  }
}
