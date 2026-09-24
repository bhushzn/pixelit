import Phaser from 'phaser';
import { MovementConfig, DEFAULT_MOVEMENT_CONFIG } from '../physics/movementConfig';

export type PlayerState =
  | 'idle'
  | 'running'
  | 'jumping'
  | 'falling'
  | 'hit'
  | 'respawning'
  | 'finished';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public currentState: PlayerState = 'idle';
  public config: MovementConfig;

  // Jump & Ground Mechanics
  private canDoubleJump = true;
  private lastGroundedTime = 0;
  private lastJumpPressTime = 0;
  private isSpringBouncing = false;

  // Dash Mechanics
  private isDashing = false;
  private dashEndTime = 0;
  private lastDashTime = 0;
  private dashDirection: 'left' | 'right' = 'right';

  // Invulnerability & Hazards
  private isInvulnerable = false;
  private invulnerableUntil = 0;

  // Safe Respawn Points
  private startSpawnPoint: { x: number; y: number };
  private checkpointSpawnPoint: { x: number; y: number };
  public activeSpawnPoint: { x: number; y: number };

  // Particles & Visuals
  private dustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private dashEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene,
    startSpawn: { x: number; y: number },
    checkpointSpawn: { x: number; y: number },
    customConfig?: Partial<MovementConfig>
  ) {
    const initialTexture = scene.textures.exists('player_rush_sheet') ? 'player_rush_sheet' : 'player_pip_idle';
    super(scene, startSpawn.x, startSpawn.y, initialTexture);

    this.config = { ...DEFAULT_MOVEMENT_CONFIG, ...customConfig };
    this.startSpawnPoint = { ...startSpawn };
    this.checkpointSpawnPoint = { ...checkpointSpawn };
    this.activeSpawnPoint = { ...startSpawn };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics Body Setup
    this.setCollideWorldBounds(false);
    this.setBounce(0.05);
    this.setDepth(10);

    // Set tight bounding box for responsive platforming
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 38);
    body.setOffset(12, 10);
    body.setMaxVelocity(this.config.dashVelocity * 1.2, 1100);
    body.setDragX(this.config.drag);

    if (scene.anims.exists('player_anim_idle')) {
      this.play('player_anim_idle');
    }

    this.setupParticles();
  }

  private setupParticles(): void {
    if (this.scene.textures.exists('particle_star')) {
      this.dustEmitter = this.scene.add.particles(0, 0, 'particle_star', {
        speed: { min: 20, max: 60 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.8, end: 0 },
        lifespan: 300,
        emitting: false,
      });
    }

    if (this.scene.textures.exists('particle_dash')) {
      this.dashEmitter = this.scene.add.particles(0, 0, 'particle_dash', {
        speed: { min: 40, max: 120 },
        scale: { start: 0.9, end: 0 },
        alpha: { start: 0.85, end: 0 },
        lifespan: 180,
        emitting: false,
      });
    }
  }

  public update(time: number, delta: number, input: { left: boolean; right: boolean; jump: boolean; dash: boolean }): void {
    if (this.currentState === 'finished') {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      body.setAcceleration(0, 0);
      return;
    }

    if (this.currentState === 'respawning') {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const onFloor = body.blocked.down || body.touching.down;

    // Handle Coyote Time
    if (onFloor) {
      this.lastGroundedTime = time;
      this.canDoubleJump = true;
      this.isSpringBouncing = false;
    }

    // Handle Jump Buffer
    if (input.jump) {
      this.lastJumpPressTime = time;
    }

    // Handle Invulnerability Flash
    if (this.isInvulnerable && time > this.invulnerableUntil) {
      this.isInvulnerable = false;
      this.setAlpha(1);
    } else if (this.isInvulnerable) {
      this.setAlpha(Math.sin(time / 40) > 0 ? 0.4 : 1);
    }

    // Handle Dash State
    if (this.isDashing) {
      if (time >= this.dashEndTime) {
        this.isDashing = false;
      } else {
        const dir = this.dashDirection === 'right' ? 1 : -1;
        body.setVelocityX(this.config.dashVelocity * dir);
        body.setVelocityY(0);
        this.emitRunDust();
        this.emitDashDust();
        return;
      }
    }

    // Dash Trigger Check
    if (input.dash && time - this.lastDashTime > this.config.dashCooldownMs) {
      this.startDash(time);
      return;
    }

    // Horizontal Movement
    if (input.left) {
      body.setAccelerationX(-this.config.acceleration);
      this.setFlipX(true);
      this.dashDirection = 'left';
    } else if (input.right) {
      body.setAccelerationX(this.config.acceleration);
      this.setFlipX(false);
      this.dashDirection = 'right';
    } else {
      body.setAccelerationX(0);
    }

    // Clamp horizontal max run speed
    if (Math.abs(body.velocity.x) > this.config.maxSpeed && !this.isDashing) {
      body.setVelocityX(Phaser.Math.Clamp(body.velocity.x, -this.config.maxSpeed, this.config.maxSpeed));
    }

    // Jump Logic (Coyote Time + Jump Buffer)
    const canCoyoteJump = time - this.lastGroundedTime < this.config.coyoteTimeMs;
    const hasBufferedJump = time - this.lastJumpPressTime < this.config.jumpBufferMs;

    if (hasBufferedJump) {
      if (canCoyoteJump) {
        // First Jump
        body.setVelocityY(this.config.jumpVelocity);
        this.lastJumpPressTime = 0;
        this.lastGroundedTime = 0;
        this.isSpringBouncing = false;
        this.emitJumpDust();
      } else if (this.canDoubleJump) {
        // Double Jump
        body.setVelocityY(this.config.doubleJumpVelocity);
        this.canDoubleJump = false;
        this.lastJumpPressTime = 0;
        this.isSpringBouncing = false;
        this.emitJumpDust();
      }
    }

    // Variable Jump Cut (only apply to manual player jump, not spring bounce)
    if (!this.isSpringBouncing && !input.jump && body.velocity.y < -150) {
      body.setVelocityY(body.velocity.y * 0.75);
    }

    // Determine current visual state & textures
    this.updateState(onFloor);
  }

  private startDash(time: number): void {
    this.isDashing = true;
    this.lastDashTime = time;
    this.dashEndTime = time + this.config.dashDurationMs;

    const dir = this.dashDirection === 'right' ? 1 : -1;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(this.config.dashVelocity * dir);
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(0);

    this.scene.cameras.main.shake(100, 0.003);
    this.emitJumpDust();
  }

  private updateState(onFloor: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.currentState === 'hit') return;

    const hasAnim = (key: string) => this.scene.anims && this.scene.anims.exists(key);

    if (this.isDashing) {
      this.currentState = 'running';
      if (hasAnim('player_anim_dash')) {
        this.play('player_anim_dash', true);
      } else {
        this.setTexture('player_pip_run');
      }
      return;
    }

    if (!onFloor) {
      if (body.velocity.y < 0) {
        this.currentState = 'jumping';
        if (hasAnim('player_anim_jump')) {
          this.play('player_anim_jump', true);
        } else {
          this.setTexture('player_pip_jump');
        }
      } else {
        this.currentState = 'falling';
        if (hasAnim('player_anim_fall')) {
          this.play('player_anim_fall', true);
        } else {
          this.setTexture('player_pip_jump');
        }
      }
    } else {
      if (Math.abs(body.velocity.x) > 20) {
        this.currentState = 'running';
        if (hasAnim('player_anim_run')) {
          this.play('player_anim_run', true);
        } else {
          this.setTexture('player_pip_run');
        }
        if (Math.random() < 0.2) this.emitRunDust();
      } else {
        this.currentState = 'idle';
        if (hasAnim('player_anim_idle')) {
          this.play('player_anim_idle', true);
        } else {
          this.setTexture('player_pip_idle');
        }
      }
    }
  }

  public takeHazardHit(): void {
    if (this.isInvulnerable || this.currentState === 'respawning' || this.currentState === 'finished') {
      return;
    }

    this.currentState = 'hit';
    this.isInvulnerable = true;
    this.invulnerableUntil = this.scene.time.now + 1200;

    const body = this.body as Phaser.Physics.Arcade.Body;
    // Knock player backwards opposite to their travel direction
    const knockDir = this.dashDirection === 'right' ? -1 : 1;
    body.setVelocity(Math.abs(this.config.hazardKnockbackX) * knockDir, this.config.hazardKnockbackY);

    if (this.scene.anims && this.scene.anims.exists('player_anim_hit')) {
      this.play('player_anim_hit', true);
    } else {
      this.setTexture('player_pip_hit');
    }
    this.scene.cameras.main.shake(150, 0.008);

    // Return to normal control after short recoil
    this.scene.time.delayedCall(350, () => {
      if (this.currentState === 'hit') {
        this.currentState = 'idle';
        if (this.scene.anims && this.scene.anims.exists('player_anim_idle')) {
          this.play('player_anim_idle', true);
        }
      }
    });
  }

  /**
   * Safe, instant respawn at the latest checkpoint or start position
   */
  public respawnAtSafeSpawn(): void {
    if (this.currentState === 'finished') return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    // 1. Stop downward velocity immediately
    // 2. Reset player velocity & acceleration
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);

    // 3. Reset dash state
    this.isDashing = false;
    this.dashEndTime = 0;
    this.isSpringBouncing = false;

    // 4. Instantly teleport physics body and sprite to safe spawn with clearance
    body.reset(this.activeSpawnPoint.x, this.activeSpawnPoint.y);

    // 5. Restore normal state & invulnerability protection
    this.currentState = 'idle';
    this.setTexture('player_pip_idle');
    this.isInvulnerable = true;
    this.invulnerableUntil = this.scene.time.now + 1200;

    // Visual feedback
    this.scene.cameras.main.flash(180, 201, 230, 255);
    this.emitJumpDust();
  }

  public setCheckpointReached(): void {
    this.activeSpawnPoint = { ...this.checkpointSpawnPoint };
  }

  public resetToStart(): void {
    this.activeSpawnPoint = { ...this.startSpawnPoint };
    this.respawnAtSafeSpawn();
  }

  public markFinished(): void {
    this.currentState = 'finished';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);
    body.setAllowGravity(false);
    this.setTexture('player_pip_idle');
  }

  public springBounce(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isSpringBouncing = true;
    body.setVelocityY(this.config.bounceForce);
    this.canDoubleJump = true;
    this.emitJumpDust();
  }

  public applyBoostPad(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(640);
    this.scene.cameras.main.shake(80, 0.002);
    this.emitJumpDust();
  }

  private emitRunDust(): void {
    if (this.dustEmitter) {
      this.dustEmitter.emitParticleAt(this.x, this.y + 24, 1);
    }
  }

  private emitJumpDust(): void {
    if (this.dustEmitter) {
      this.dustEmitter.emitParticleAt(this.x, this.y + 20, 6);
    }
  }

  private emitDashDust(): void {
    if (this.dashEmitter) {
      const offsetX = this.dashDirection === 'right' ? -16 : 16;
      this.dashEmitter.emitParticleAt(this.x + offsetX, this.y + 10, 1);
    }
  }
}
