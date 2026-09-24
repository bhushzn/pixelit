export interface MovementConfig {
  maxSpeed: number;
  acceleration: number;
  drag: number;
  jumpVelocity: number;
  doubleJumpVelocity: number;
  gravity: number;
  dashVelocity: number;
  dashDurationMs: number;
  dashCooldownMs: number;
  coyoteTimeMs: number;
  jumpBufferMs: number;
  bounceForce: number;
  hazardKnockbackX: number;
  hazardKnockbackY: number;
}

export const DEFAULT_MOVEMENT_CONFIG: MovementConfig = {
  maxSpeed: 340,
  acceleration: 1900,
  drag: 1400,
  jumpVelocity: -620,
  doubleJumpVelocity: -520,
  gravity: 1450,
  dashVelocity: 680,
  dashDurationMs: 180,
  dashCooldownMs: 800,
  coyoteTimeMs: 130,
  jumpBufferMs: 120,
  bounceForce: -880,
  hazardKnockbackX: -260,
  hazardKnockbackY: -380,
};
