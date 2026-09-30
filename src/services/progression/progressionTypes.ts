/**
 * Pixel Rush Player Progression & Economy Types (Phase 11)
 */

import { CosmeticItem } from '../../game/cosmetics/cosmeticTypes';

export interface PlayerProgression {
  playerId: string;
  displayName: string;
  level: number;
  xp: number;
  totalCoins: number;
  totalGems: number;
  racesPlayed: number;
  racesWon: number;
  bestTimes: Record<string, number>;
  equippedSkinId: string;
  equippedHatId: string;
  equippedTrailId: string;
  unlockedCosmetics: string[];
  createdAt: number;
  updatedAt: number;
}

export interface LevelProgressInfo {
  currentLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  totalXp: number;
}

export interface RaceRewardResult {
  xpEarned: number;
  coinsEarned: number;
  previousLevel: number;
  newLevel: number;
  didLevelUp: boolean;
  newlyUnlockedCosmetics: CosmeticItem[];
  currentTotalCoins: number;
  currentTotalXp: number;
}
