import { PowerUpDefinition, PowerUpLootTableEntry, PowerUpRarity, PowerUpType } from './types';

export const POWERUP_DEFINITIONS: Record<PowerUpType, PowerUpDefinition> = {
  banana_bounce: {
    id: 'banana_bounce',
    name: 'Banana Bounce',
    description: 'Drops a cartoon banana peel that makes runners slip and bounce into the sky!',
    rarity: 'common',
    icon: 'eco',
    durationMs: 0,
    cooldownMs: 2500,
    targetSelf: false,
    targetOpponents: true,
    effectType: 'trap',
    minimumLevel: 1,
  },
  mini_tornado: {
    id: 'mini_tornado',
    name: 'Mini Tornado',
    description: 'Launches a spinning whirlwind that lifts and pushes competitors away.',
    rarity: 'uncommon',
    icon: 'cyclone',
    durationMs: 2500,
    cooldownMs: 4000,
    targetSelf: false,
    targetOpponents: true,
    effectType: 'projectile',
    minimumLevel: 1,
  },
  coin_magnet: {
    id: 'coin_magnet',
    name: 'Coin Magnet',
    description: 'Pulls nearby floating gold coins straight to your runner for 6 seconds.',
    rarity: 'uncommon',
    icon: 'attractions',
    durationMs: 6000,
    cooldownMs: 8000,
    targetSelf: true,
    targetOpponents: false,
    effectType: 'buff',
    minimumLevel: 1,
  },
  freeze_pop: {
    id: 'freeze_pop',
    name: 'Freeze Pop',
    description: 'Fires an icy popsicle that encases targets in frosty slowing crystals.',
    rarity: 'rare',
    icon: 'ac_unit',
    durationMs: 1800,
    cooldownMs: 6000,
    targetSelf: false,
    targetOpponents: true,
    effectType: 'projectile',
    minimumLevel: 1,
  },
  wind_blast: {
    id: 'wind_blast',
    name: 'Wind Blast',
    description: 'Triggers a powerful forward air gust that blasts obstacles away.',
    rarity: 'rare',
    icon: 'air',
    durationMs: 1200,
    cooldownMs: 4000,
    targetSelf: true,
    targetOpponents: true,
    effectType: 'burst',
    minimumLevel: 1,
  },
  boomerang_bonk: {
    id: 'boomerang_bonk',
    name: 'Boomerang Bonk',
    description: 'Throws a returning foam boomerang that arcs forward and flies back.',
    rarity: 'epic',
    icon: 'replay',
    durationMs: 1600,
    cooldownMs: 7000,
    targetSelf: false,
    targetOpponents: true,
    effectType: 'returning_projectile',
    minimumLevel: 1,
  },
};

export const RARITY_WEIGHTS: Record<PowerUpRarity, number> = {
  common: 45,
  uncommon: 30,
  rare: 18,
  epic: 7,
};

// Weighted Loot Table matching exact percentages (Total: 45 + 15 + 15 + 9 + 9 + 7 = 100)
export const LOOT_TABLE: PowerUpLootTableEntry[] = [
  { id: 'banana_bounce', rarity: 'common', weight: 45 },
  { id: 'mini_tornado', rarity: 'uncommon', weight: 15 },
  { id: 'coin_magnet', rarity: 'uncommon', weight: 15 },
  { id: 'freeze_pop', rarity: 'rare', weight: 9 },
  { id: 'wind_blast', rarity: 'rare', weight: 9 },
  { id: 'boomerang_bonk', rarity: 'epic', weight: 7 },
];

/**
 * Centralized weighted power-up selection function.
 * Total weight = 100.
 * Supports passing a customRoll (0-100) for deterministic testing or server authoritative events.
 */
export function rollPowerUp(customRoll?: number): PowerUpDefinition {
  const totalWeight = LOOT_TABLE.reduce((sum, item) => sum + item.weight, 0); // 100
  const roll = customRoll !== undefined ? customRoll : Math.random() * totalWeight;

  let cumulative = 0;
  for (const entry of LOOT_TABLE) {
    cumulative += entry.weight;
    if (roll < cumulative) {
      return POWERUP_DEFINITIONS[entry.id];
    }
  }
  return POWERUP_DEFINITIONS['banana_bounce'];
}

export function getPowerUpById(id: PowerUpType): PowerUpDefinition {
  return POWERUP_DEFINITIONS[id] ?? POWERUP_DEFINITIONS.banana_bounce;
}
