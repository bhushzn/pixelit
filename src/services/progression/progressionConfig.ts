/**
 * Pixel Rush Progression Configuration & Formulae
 */

import { LevelProgressInfo } from './progressionTypes';

export const PROGRESSION_CONFIG = {
  INITIAL_LEVEL: 1,
  INITIAL_XP: 0,
  INITIAL_COINS: 4850,
  INITIAL_GEMS: 120,

  // XP Rewards per race event
  XP_RACE_PARTICIPATION: 50,
  XP_RACE_FINISH: 50,
  XP_PLACEMENT_BONUS: {
    1: 100,
    2: 60,
    3: 30,
    4: 10,
  } as Record<number, number>,

  // Coin Rewards per race
  COIN_PLACEMENT_BONUS: {
    1: 100,
    2: 60,
    3: 40,
    4: 20,
  } as Record<number, number>,
} as const;

/**
 * Returns the cumulative total XP required to reach a given level.
 * Level 1 = 0 XP
 * Level 2 = 100 XP
 * Level 3 = 250 XP
 * Level 4 = 450 XP
 * Level 5 = 700 XP
 */
export function getCumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const L = Math.floor(level);
  return 25 * (L - 1) * (L + 2);
}

/**
 * Calculates the player's level from their total accumulated XP.
 */
export function getLevelFromTotalXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  while (getCumulativeXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

/**
 * Calculates the detailed level progress, including XP in current level and percent.
 */
export function getLevelProgress(totalXp: number): LevelProgressInfo {
  const currentLevel = getLevelFromTotalXp(totalXp);
  const currentLevelFloorXp = getCumulativeXpForLevel(currentLevel);
  const nextLevelFloorXp = getCumulativeXpForLevel(currentLevel + 1);

  const neededForLevel = nextLevelFloorXp - currentLevelFloorXp;
  const currentLevelXp = Math.max(0, totalXp - currentLevelFloorXp);
  const progressPercent = Math.min(100, Math.max(0, Math.floor((currentLevelXp / neededForLevel) * 100)));

  return {
    currentLevel,
    currentLevelXp,
    nextLevelXp: neededForLevel,
    progressPercent,
    totalXp,
  };
}
