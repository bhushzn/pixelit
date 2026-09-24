/**
 * Power-Up Architecture (Prank weapons and boosts)
 * Modular single-player and server-authoritative compatible power-up system.
 */

export type PowerUpType =
  | 'banana_bounce'
  | 'mini_tornado'
  | 'freeze_pop'
  | 'wind_blast'
  | 'boomerang_bonk'
  | 'coin_magnet';

export type PowerUpRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface PowerUpDefinition {
  id: PowerUpType;
  name: string;
  description: string;
  rarity: PowerUpRarity;
  icon: string;
  durationMs: number;
  cooldownMs: number;
  targetSelf: boolean;
  targetOpponents: boolean;
  effectType: 'trap' | 'projectile' | 'buff' | 'burst' | 'returning_projectile';
  minimumLevel?: number;
}

export interface PowerUpInventoryState {
  held: PowerUpDefinition | null;
  isActive: boolean;
  activeRemainingMs: number;
  cooldownRemainingMs: number;
}

export interface PowerUpPickupDef {
  x: number;
  y: number;
  id?: string;
  pool?: string;
}

export interface PowerUpLootTableEntry {
  id: PowerUpType;
  rarity: PowerUpRarity;
  weight: number;
}
