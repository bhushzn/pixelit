/**
 * Pixel Rush Cosmetic & Customization System Types (Phase 11)
 */

export type CosmeticCategory = 'skin' | 'hat' | 'trail';

export type CosmeticRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type UnlockType = 'default' | 'level' | 'coins' | 'gems';

export interface CosmeticColors {
  primary: string;
  secondary: string;
  accent: string;
  cap?: string;
  skin?: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  description: string;
  unlockType: UnlockType;
  unlockValue: number; // Level required if unlockType === 'level', price if 'coins' or 'gems'
  price: number;
  isDefault: boolean;
  icon: string;
  colors: CosmeticColors;
}

export interface EquippedCosmetics {
  skinId: string;
  hatId?: string;
  trailId?: string;
}
