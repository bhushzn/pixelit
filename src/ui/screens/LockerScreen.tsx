/**
 * Pixel Rush Heroes & Locker Customization Screen (Phase 11)
 */

import React, { useState, useEffect } from 'react';
import { GameScreen } from '../../types/game';
import { CosmeticCategory, CosmeticItem } from '../../game/cosmetics/cosmeticTypes';
import {
  COSMETIC_SKINS,
  COSMETIC_HATS,
  COSMETIC_TRAILS,
  getCosmeticsByCategory,
} from '../../game/cosmetics/cosmeticRegistry';
import { progressionService } from '../../services/progression/progressionService';
import { PlayerProgression } from '../../services/progression/progressionTypes';
import { getLevelProgress } from '../../services/progression/progressionConfig';
import { CosmeticPreview } from '../components/CosmeticPreview';

interface LockerScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

export const LockerScreen: React.FC<LockerScreenProps> = ({ onNavigate }) => {
  const [progression, setProgression] = useState<PlayerProgression>(() => progressionService.getProgression());
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>('skin');
  const [previewSkinId, setPreviewSkinId] = useState<string>(progression.equippedSkinId);
  const [previewHatId, setPreviewHatId] = useState<string>(progression.equippedHatId);
  const [previewTrailId, setPreviewTrailId] = useState<string>(progression.equippedTrailId);

  useEffect(() => {
    const unsub = progressionService.subscribe((p) => {
      setProgression(p);
      setPreviewSkinId(p.equippedSkinId);
      setPreviewHatId(p.equippedHatId);
      setPreviewTrailId(p.equippedTrailId);
    });
    return () => unsub();
  }, []);

  const levelProgress = getLevelProgress(progression.xp);
  const currentCategoryItems = getCosmeticsByCategory(activeCategory);

  const handleEquip = (item: CosmeticItem) => {
    const res = progressionService.equipCosmetic(item.id, item.category);
    if (res.success) {
      if (item.category === 'skin') setPreviewSkinId(item.id);
      if (item.category === 'hat') setPreviewHatId(item.id);
      if (item.category === 'trail') setPreviewTrailId(item.id);
    }
  };

  const handleUnequip = (category: 'hat' | 'trail') => {
    progressionService.unequipCosmetic(category);
  };

  const isItemEquipped = (item: CosmeticItem): boolean => {
    if (item.category === 'skin') return progression.equippedSkinId === item.id;
    if (item.category === 'hat') return progression.equippedHatId === item.id;
    if (item.category === 'trail') return progression.equippedTrailId === item.id;
    return false;
  };

  const isItemOwned = (item: CosmeticItem): boolean => {
    return progression.unlockedCosmetics.includes(item.id);
  };

  const rarityBadgeColors: Record<string, string> = {
    common: 'bg-gray-100 text-[#3e4850] border-gray-300',
    uncommon: 'bg-emerald-50 text-[#006c49] border-emerald-300',
    rare: 'bg-sky-50 text-[#006591] border-sky-300',
    epic: 'bg-purple-50 text-purple-700 border-purple-300',
    legendary: 'bg-amber-50 text-amber-800 border-amber-300',
  };

  return (
    <div className="flex-1 w-full max-w-xl mx-auto px-4 py-4 flex flex-col gap-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('lobby')}
            className="w-9 h-9 rounded-full bg-white border border-[#e2e7ff] text-[#3e4850] flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-rubik text-xl font-black text-[#131b2e] tracking-tight">
              Heroes & Locker
            </h1>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              Customize Runner, Hats & Dash Trails
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('shop')}
          className="px-3.5 py-1.5 rounded-full bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">storefront</span>
          <span>Store</span>
        </button>
      </div>

      {/* Hero Character Stage */}
      <section className="relative w-full rounded-3xl bg-gradient-to-b from-[#e0f2fe] via-[#faf8ff] to-[#f2f3ff] border-2 border-[#c9e6ff] shadow-md p-4 flex flex-col items-center justify-between gap-3">
        {/* Level Progression Banner */}
        <div className="w-full flex items-center justify-between bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#e2e7ff] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-rubik text-xs font-black">
              {progression.level}
            </span>
            <div>
              <div className="font-rubik text-xs font-black text-[#131b2e]">Level {progression.level} Runner</div>
              <div className="font-rubik text-[9px] text-[#006591] font-bold">
                {levelProgress.currentLevelXp} / {levelProgress.nextLevelXp} XP ({levelProgress.progressPercent}%)
              </div>
            </div>
          </div>

          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0ea5e9] to-[#00b17b] h-full transition-all duration-300"
              style={{ width: `${levelProgress.progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Live 3D-feel Avatar Preview */}
        <div className="py-2">
          <CosmeticPreview
            skinId={previewSkinId}
            hatId={previewHatId}
            trailId={previewTrailId}
            size="lg"
            showPodium={true}
          />
        </div>

        {/* Equipped Quick Tags */}
        <div className="flex items-center gap-2 text-[10px] font-rubik font-bold text-[#3e4850]">
          <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e7ff]">
            👕 {COSMETIC_SKINS.find((s) => s.id === previewSkinId)?.name}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e7ff]">
            🎩 {COSMETIC_HATS.find((h) => h.id === previewHatId)?.name}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white border border-[#e2e7ff]">
            ✨ {COSMETIC_TRAILS.find((t) => t.id === previewTrailId)?.name}
          </span>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="flex bg-[#e2e7ff]/60 p-1 rounded-2xl">
        <button
          onClick={() => setActiveCategory('skin')}
          className={`flex-1 py-2 rounded-xl font-rubik text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeCategory === 'skin' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">accessibility</span>
          <span>Skins</span>
        </button>

        <button
          onClick={() => setActiveCategory('hat')}
          className={`flex-1 py-2 rounded-xl font-rubik text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeCategory === 'hat' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">checkroom</span>
          <span>Hats</span>
        </button>

        <button
          onClick={() => setActiveCategory('trail')}
          className={`flex-1 py-2 rounded-xl font-rubik text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeCategory === 'trail' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>Trails</span>
        </button>
      </div>

      {/* Cosmetics Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentCategoryItems.map((item) => {
          const owned = isItemOwned(item);
          const equipped = isItemEquipped(item);
          const isSelectedPreview =
            (item.category === 'skin' && previewSkinId === item.id) ||
            (item.category === 'hat' && previewHatId === item.id) ||
            (item.category === 'trail' && previewTrailId === item.id);

          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.category === 'skin') setPreviewSkinId(item.id);
                if (item.category === 'hat') setPreviewHatId(item.id);
                if (item.category === 'trail') setPreviewTrailId(item.id);
              }}
              className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer ${
                isSelectedPreview
                  ? 'border-[#0ea5e9] bg-white shadow-md scale-101'
                  : 'border-[#e2e7ff] bg-[#faf8ff] hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-md border font-rubik text-[9px] font-black uppercase ${
                      rarityBadgeColors[item.rarity]
                    }`}
                  >
                    {item.rarity}
                  </span>

                  {equipped && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00b17b] text-white font-rubik text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      EQUIPPED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: item.colors.primary !== 'transparent' ? item.colors.primary : '#38bdf8' }}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-rubik text-sm font-black text-[#131b2e]">{item.name}</h3>
                    <p className="font-sans-body text-[10px] text-[#3e4850] line-clamp-1">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="mt-3 pt-2.5 border-t border-[#f2f3ff] flex items-center justify-between">
                {owned ? (
                  equipped ? (
                    item.category !== 'skin' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequip(item.category as any);
                        }}
                        className="w-full py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#3e4850] font-rubik text-xs font-bold transition-all cursor-pointer"
                      >
                        Unequip
                      </button>
                    ) : (
                      <span className="text-[10px] font-rubik font-bold text-[#00b17b]">In Use</span>
                    )
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquip(item);
                      }}
                      className="w-full py-1.5 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Equip
                    </button>
                  )
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-rubik font-bold text-[#8e909a] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      {item.unlockType === 'level'
                        ? `Unlocks at Lvl ${item.unlockValue}`
                        : `${item.price} Coins`}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('shop');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#fea619]/20 text-[#855300] font-rubik text-[10px] font-black hover:bg-[#fea619]/30 transition-all cursor-pointer"
                    >
                      Get in Store
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
