/**
 * Future Power-Up Architecture (Prank weapons and boosts)
 * Cartoon gameplay power-ups designed for Level 3/4 and online matches.
 */

export type PowerUpType =
  | 'banana_bounce'
  | 'mini_tornado'
  | 'freeze_pop'
  | 'wind_blast'
  | 'boomerang_bonk'
  | 'coin_magnet';

export type PowerUpRarity = 'common' | 'rare' | 'epic';

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
}

export interface PowerUpEffect {
  applyToPlayer(targetPlayerId: string, durationMs: number): void;
  removeFromPlayer(targetPlayerId: string): void;
  tick(delta: number): void;
}

export interface PowerUpLootTableEntry {
  type: PowerUpType;
  weight: number;
  minPosition: number; // e.g. 2nd-4th players get stronger prank weapons to catch up
  maxPosition: number;
}

export interface PowerUpSpawner {
  id: string;
  x: number;
  y: number;
  respawnTimeMs: number;
  isAvailable: boolean;
  spawn(): void;
}

export interface PowerUpManager {
  registerPowerUp(def: PowerUpDefinition, effect: PowerUpEffect): void;
  rollLoot(playerPosition: number, totalPlayers: number): PowerUpType;
  activatePowerUp(playerId: string, type: PowerUpType): boolean;
  update(delta: number): void;
}

/**
 * Standard Loot Table definitions for planned prank power-ups
 */
export const PLANNED_POWERUPS: Record<PowerUpType, PowerUpDefinition> = {
  banana_bounce: {
    id: 'banana_bounce',
    name: 'Banana Bounce',
    description: 'Drops a cartoon banana peel that makes runners slip and bounce backwards!',
    rarity: 'common',
    icon: 'eco',
    durationMs: 0,
    cooldownMs: 3000,
    targetSelf: false,
    targetOpponents: true,
  },
  mini_tornado: {
    id: 'mini_tornado',
    name: 'Mini Tornado',
    description: 'Whirls forward, lifting competitors into a brief spin.',
    rarity: 'rare',
    icon: 'cyclone',
    durationMs: 2500,
    cooldownMs: 6000,
    targetSelf: false,
    targetOpponents: true,
  },
  freeze_pop: {
    id: 'freeze_pop',
    name: 'Freeze Pop',
    description: 'Flings an icy popsicle that covers an opponent in slippery ice.',
    rarity: 'rare',
    icon: 'ac_unit',
    durationMs: 1800,
    cooldownMs: 7000,
    targetSelf: false,
    targetOpponents: true,
  },
  wind_blast: {
    id: 'wind_blast',
    name: 'Wind Blast',
    description: 'Blows a gust of cloud wind behind you, boosting you and nudging rivals back.',
    rarity: 'common',
    icon: 'air',
    durationMs: 1200,
    cooldownMs: 4000,
    targetSelf: true,
    targetOpponents: true,
  },
  boomerang_bonk: {
    id: 'boomerang_bonk',
    name: 'Boomerang Bonk',
    description: 'Throws a soft foam boomerang that curves along the track and bonks the leader.',
    rarity: 'epic',
    icon: 'replay',
    durationMs: 1500,
    cooldownMs: 8000,
    targetSelf: false,
    targetOpponents: true,
  },
  coin_magnet: {
    id: 'coin_magnet',
    name: 'Coin Magnet',
    description: 'Pulls all floating stage coins directly toward your runner for 6 seconds.',
    rarity: 'common',
    icon: 'attractions',
    durationMs: 6000,
    cooldownMs: 10000,
    targetSelf: true,
    targetOpponents: false,
  },
};
