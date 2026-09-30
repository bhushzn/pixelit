/**
 * Pixel Rush Player Progression & Economy Service
 */

import { PlayerProgression, RaceRewardResult } from './progressionTypes';
import {
  PROGRESSION_CONFIG,
  getLevelFromTotalXp,
} from './progressionConfig';
import {
  ALL_COSMETICS,
  getCosmeticById,
  getDefaultCosmetics,
} from '../../game/cosmetics/cosmeticRegistry';
import { CosmeticCategory, CosmeticItem } from '../../game/cosmetics/cosmeticTypes';
import { RaceStats } from '../../types/game';
import { authService } from '../auth/authService';

const PROGRESSION_STORAGE_KEY = 'pixel_rush_player_progression_v1';

export class ProgressionService {
  private progression: PlayerProgression;
  private listeners: Set<(progression: PlayerProgression) => void> = new Set();

  constructor() {
    this.progression = this.loadFromStorage();
    this.validateAndSyncLevelUnlocks();
  }

  private getDefaultProgression(): PlayerProgression {
    const authUser = authService.getCurrentUser();
    const defaults = getDefaultCosmetics();

    return {
      playerId: authUser?.uid || 'runner_' + Math.random().toString(36).substring(2, 8),
      displayName: authUser?.displayName || 'Pip',
      level: PROGRESSION_CONFIG.INITIAL_LEVEL,
      xp: PROGRESSION_CONFIG.INITIAL_XP,
      totalCoins: authUser?.coins ?? PROGRESSION_CONFIG.INITIAL_COINS,
      totalGems: authUser?.gems ?? PROGRESSION_CONFIG.INITIAL_GEMS,
      racesPlayed: 0,
      racesWon: 0,
      bestTimes: {},
      equippedSkinId: defaults.skinId,
      equippedHatId: defaults.hatId,
      equippedTrailId: defaults.trailId,
      unlockedCosmetics: [defaults.skinId, defaults.hatId, defaults.trailId],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  private loadFromStorage(): PlayerProgression {
    try {
      if (typeof localStorage === 'undefined') {
        return this.getDefaultProgression();
      }

      const raw = localStorage.getItem(PROGRESSION_STORAGE_KEY);
      if (!raw) {
        const defaults = this.getDefaultProgression();
        this.saveToStorage(defaults);
        return defaults;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.totalCoins !== 'number') {
        const defaults = this.getDefaultProgression();
        this.saveToStorage(defaults);
        return defaults;
      }

      // Ensure required arrays and defaults exist
      const defaults = getDefaultCosmetics();
      const unlocked = Array.isArray(parsed.unlockedCosmetics) ? parsed.unlockedCosmetics : [];
      if (!unlocked.includes(defaults.skinId)) unlocked.push(defaults.skinId);
      if (!unlocked.includes(defaults.hatId)) unlocked.push(defaults.hatId);
      if (!unlocked.includes(defaults.trailId)) unlocked.push(defaults.trailId);

      const sanitized: PlayerProgression = {
        playerId: String(parsed.playerId || 'runner_local'),
        displayName: String(parsed.displayName || 'Pip'),
        level: Math.max(1, Number(parsed.level) || 1),
        xp: Math.max(0, Number(parsed.xp) || 0),
        totalCoins: Math.max(0, Number(parsed.totalCoins) || 0),
        totalGems: Math.max(0, Number(parsed.totalGems) || 0),
        racesPlayed: Math.max(0, Number(parsed.racesPlayed) || 0),
        racesWon: Math.max(0, Number(parsed.racesWon) || 0),
        bestTimes: typeof parsed.bestTimes === 'object' && parsed.bestTimes ? parsed.bestTimes : {},
        equippedSkinId: String(parsed.equippedSkinId || defaults.skinId),
        equippedHatId: String(parsed.equippedHatId || defaults.hatId),
        equippedTrailId: String(parsed.equippedTrailId || defaults.trailId),
        unlockedCosmetics: unlocked,
        createdAt: Number(parsed.createdAt) || Date.now(),
        updatedAt: Date.now(),
      };

      return sanitized;
    } catch {
      return this.getDefaultProgression();
    }
  }

  private saveToStorage(prog: PlayerProgression): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(prog));
      }
    } catch {}
  }

  public getProgression(): PlayerProgression {
    return { ...this.progression };
  }

  public awardRaceRewards(stats: RaceStats, mapId: string): RaceRewardResult {
    const prevLevel = this.progression.level;

    // Calculate XP
    let xpGain = PROGRESSION_CONFIG.XP_RACE_PARTICIPATION;
    if (stats.finishPosition > 0) {
      xpGain += PROGRESSION_CONFIG.XP_RACE_FINISH;
      xpGain += PROGRESSION_CONFIG.XP_PLACEMENT_BONUS[stats.finishPosition] || 0;
    }
    if (stats.xpEarned > 0) {
      xpGain += stats.xpEarned;
    }

    // Calculate Coins
    let coinGain = Math.max(0, stats.coinsCollected || 0);
    if (stats.finishPosition > 0) {
      coinGain += PROGRESSION_CONFIG.COIN_PLACEMENT_BONUS[stats.finishPosition] || 0;
    }

    const newTotalXp = this.progression.xp + xpGain;
    const newLevel = getLevelFromTotalXp(newTotalXp);
    const didLevelUp = newLevel > prevLevel;

    this.progression.xp = newTotalXp;
    this.progression.level = newLevel;
    this.progression.totalCoins += coinGain;
    this.progression.racesPlayed += 1;
    if (stats.finishPosition === 1) {
      this.progression.racesWon += 1;
    }

    if (stats.finishTimeMs > 0) {
      const currentBest = this.progression.bestTimes[mapId];
      if (!currentBest || stats.finishTimeMs < currentBest) {
        this.progression.bestTimes[mapId] = stats.finishTimeMs;
      }
    }

    // Check newly unlocked level cosmetics
    const newlyUnlockedCosmetics: CosmeticItem[] = [];
    if (didLevelUp) {
      for (const cosmetic of ALL_COSMETICS) {
        if (
          cosmetic.unlockType === 'level' &&
          cosmetic.unlockValue <= newLevel &&
          !this.progression.unlockedCosmetics.includes(cosmetic.id)
        ) {
          this.progression.unlockedCosmetics.push(cosmetic.id);
          newlyUnlockedCosmetics.push(cosmetic);
        }
      }
    }

    this.progression.updatedAt = Date.now();
    this.saveToStorage(this.progression);
    this.notify();

    // Sync authService user profile coins and level if authenticated
    try {
      if (authService.getCurrentUser()) {
        authService.updateProfile({
          level: this.progression.level,
          xp: this.progression.xp,
          coins: this.progression.totalCoins,
        }).catch(() => {});
      }
    } catch {}

    return {
      xpEarned: xpGain,
      coinsEarned: coinGain,
      previousLevel: prevLevel,
      newLevel,
      didLevelUp,
      newlyUnlockedCosmetics,
      currentTotalCoins: this.progression.totalCoins,
      currentTotalXp: this.progression.xp,
    };
  }

  public validateAndSyncLevelUnlocks(): void {
    let changed = false;
    for (const cosmetic of ALL_COSMETICS) {
      if (
        cosmetic.unlockType === 'default' &&
        !this.progression.unlockedCosmetics.includes(cosmetic.id)
      ) {
        this.progression.unlockedCosmetics.push(cosmetic.id);
        changed = true;
      } else if (
        cosmetic.unlockType === 'level' &&
        cosmetic.unlockValue <= this.progression.level &&
        !this.progression.unlockedCosmetics.includes(cosmetic.id)
      ) {
        this.progression.unlockedCosmetics.push(cosmetic.id);
        changed = true;
      }
    }

    if (changed) {
      this.saveToStorage(this.progression);
      this.notify();
    }
  }

  public isOwned(cosmeticId: string): boolean {
    return this.progression.unlockedCosmetics.includes(cosmeticId);
  }

  public purchaseCosmetic(cosmeticId: string): { success: boolean; error?: string } {
    const item = getCosmeticById(cosmeticId);
    if (!item) {
      return { success: false, error: 'Unknown cosmetic item.' };
    }

    if (this.isOwned(cosmeticId)) {
      return { success: false, error: 'Item is already owned.' };
    }

    if (item.unlockType === 'level') {
      if (this.progression.level < item.unlockValue) {
        return { success: false, error: `Requires Level ${item.unlockValue} to unlock.` };
      }
      this.progression.unlockedCosmetics.push(cosmeticId);
      this.saveToStorage(this.progression);
      this.notify();
      return { success: true };
    }

    if (item.unlockType === 'coins') {
      if (this.progression.totalCoins < item.price) {
        return { success: false, error: 'Insufficient coins balance.' };
      }
      this.progression.totalCoins -= item.price;
      this.progression.unlockedCosmetics.push(cosmeticId);
      this.saveToStorage(this.progression);
      this.notify();

      try {
        if (authService.getCurrentUser()) {
          authService.updateProfile({ coins: this.progression.totalCoins }).catch(() => {});
        }
      } catch {}

      return { success: true };
    }

    if (item.unlockType === 'gems') {
      if (this.progression.totalGems < item.price) {
        return { success: false, error: 'Insufficient gems balance.' };
      }
      this.progression.totalGems -= item.price;
      this.progression.unlockedCosmetics.push(cosmeticId);
      this.saveToStorage(this.progression);
      this.notify();

      try {
        if (authService.getCurrentUser()) {
          authService.updateProfile({ gems: this.progression.totalGems }).catch(() => {});
        }
      } catch {}

      return { success: true };
    }

    if (item.unlockType === 'default') {
      if (!this.isOwned(cosmeticId)) {
        this.progression.unlockedCosmetics.push(cosmeticId);
        this.saveToStorage(this.progression);
        this.notify();
      }
      return { success: true };
    }

    return { success: false, error: 'Cannot purchase item.' };
  }

  public equipCosmetic(cosmeticId: string, category: CosmeticCategory): { success: boolean; error?: string } {
    if (!this.isOwned(cosmeticId)) {
      return { success: false, error: 'Item is locked. Unlock or purchase it first.' };
    }

    const item = getCosmeticById(cosmeticId);
    if (!item) {
      return { success: false, error: 'Unknown cosmetic item.' };
    }

    if (category === 'skin') {
      this.progression.equippedSkinId = cosmeticId;
    } else if (category === 'hat') {
      this.progression.equippedHatId = cosmeticId;
    } else if (category === 'trail') {
      this.progression.equippedTrailId = cosmeticId;
    }

    this.progression.updatedAt = Date.now();
    this.saveToStorage(this.progression);
    this.notify();
    return { success: true };
  }

  public unequipCosmetic(category: 'hat' | 'trail'): { success: boolean } {
    if (category === 'hat') {
      this.progression.equippedHatId = 'none_hat';
    } else if (category === 'trail') {
      this.progression.equippedTrailId = 'none_trail';
    }
    this.saveToStorage(this.progression);
    this.notify();
    return { success: true };
  }

  public subscribe(listener: (progression: PlayerProgression) => void): () => void {
    this.listeners.add(listener);
    listener(this.getProgression());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const current = this.getProgression();
    for (const listener of this.listeners) {
      listener(current);
    }
  }
}

export const progressionService = new ProgressionService();
