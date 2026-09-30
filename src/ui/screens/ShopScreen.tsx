/**
 * Pixel Rush Cosmetic Store Screen (Phase 11)
 */

import React, { useState, useEffect } from 'react';
import { GameScreen } from '../../types/game';
import { CosmeticCategory, CosmeticItem } from '../../game/cosmetics/cosmeticTypes';
import { ALL_COSMETICS, getCosmeticsByCategory } from '../../game/cosmetics/cosmeticRegistry';
import { progressionService } from '../../services/progression/progressionService';
import { PlayerProgression } from '../../services/progression/progressionTypes';

interface ShopScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ onNavigate }) => {
  const [progression, setProgression] = useState<PlayerProgression>(() => progressionService.getProgression());
  const [activeTab, setActiveTab] = useState<'all' | CosmeticCategory>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = progressionService.subscribe((p) => {
      setProgression(p);
    });
    return () => unsub();
  }, []);

  const items = activeTab === 'all' ? ALL_COSMETICS : getCosmeticsByCategory(activeTab);

  const handlePurchase = (item: CosmeticItem) => {
    const res = progressionService.purchaseCosmetic(item.id);
    if (res.success) {
      setFeedbackMessage(`🎉 Unlocked ${item.name}!`);
      setTimeout(() => setFeedbackMessage(null), 2500);
    } else {
      setFeedbackMessage(`⚠️ ${res.error || 'Failed to purchase item.'}`);
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  const handleEquip = (item: CosmeticItem) => {
    progressionService.equipCosmetic(item.id, item.category);
    setFeedbackMessage(`✓ Equipped ${item.name}`);
    setTimeout(() => setFeedbackMessage(null), 2000);
  };

  const isEquipped = (item: CosmeticItem): boolean => {
    if (item.category === 'skin') return progression.equippedSkinId === item.id;
    if (item.category === 'hat') return progression.equippedHatId === item.id;
    if (item.category === 'trail') return progression.equippedTrailId === item.id;
    return false;
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
              Cosmetics Store
            </h1>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              Spend Earned Coins on Handcrafted Customizations
            </p>
          </div>
        </div>

        {/* Currency Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffddb8]/60 border border-[#ffddb8] text-[#855300] font-rubik text-xs font-black shadow-xs">
            <span className="material-symbols-outlined text-[16px] text-[#fea619]">monetization_on</span>
            <span>{progression.totalCoins}</span>
          </div>
        </div>
      </div>

      {/* Floating Feedback Toast */}
      {feedbackMessage && (
        <div className="bg-[#131b2e] text-white px-4 py-2 rounded-2xl shadow-lg font-rubik text-xs font-bold text-center animate-bounce">
          {feedbackMessage}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex bg-[#e2e7ff]/60 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 rounded-xl font-rubik text-xs font-black transition-all cursor-pointer ${
            activeTab === 'all' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setActiveTab('skin')}
          className={`flex-1 py-1.5 rounded-xl font-rubik text-xs font-black transition-all cursor-pointer ${
            activeTab === 'skin' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          Skins
        </button>
        <button
          onClick={() => setActiveTab('hat')}
          className={`flex-1 py-1.5 rounded-xl font-rubik text-xs font-black transition-all cursor-pointer ${
            activeTab === 'hat' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          Hats
        </button>
        <button
          onClick={() => setActiveTab('trail')}
          className={`flex-1 py-1.5 rounded-xl font-rubik text-xs font-black transition-all cursor-pointer ${
            activeTab === 'trail' ? 'bg-white text-[#006591] shadow-xs' : 'text-[#3e4850]'
          }`}
        >
          Trails
        </button>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const owned = progression.unlockedCosmetics.includes(item.id);
          const equipped = isEquipped(item);
          const isLevelLocked = item.unlockType === 'level' && progression.level < item.unlockValue;
          const canAfford = item.unlockType === 'coins' && progression.totalCoins >= item.price;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl border-2 border-[#e2e7ff] bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
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

                  <span className="text-[10px] font-rubik font-bold text-[#8e909a] uppercase">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 my-1">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: item.colors.primary !== 'transparent' ? item.colors.primary : '#38bdf8' }}
                  >
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-rubik text-base font-black text-[#131b2e] leading-tight">{item.name}</h3>
                    <p className="font-sans-body text-xs text-[#3e4850] mt-0.5">{item.description}</p>
                  </div>
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="mt-4 pt-3 border-t border-[#f2f3ff] flex items-center justify-between">
                {owned ? (
                  equipped ? (
                    <span className="w-full py-2 text-center text-xs font-rubik font-black text-[#00b17b] bg-[#00b17b]/10 rounded-xl">
                      ✓ EQUIPPED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-2 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Equip Item
                    </button>
                  )
                ) : isLevelLocked ? (
                  <div className="w-full py-2 text-center rounded-xl bg-gray-100 text-[#8e909a] font-rubik text-xs font-bold flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>Unlock at Level {item.unlockValue}</span>
                  </div>
                ) : item.unlockType === 'coins' ? (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl font-rubik text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] shadow-sm active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">monetization_on</span>
                    <span>Buy for {item.price} Coins</span>
                  </button>
                ) : item.unlockType === 'level' ? (
                  <button
                    onClick={() => handlePurchase(item)}
                    className="w-full py-2 rounded-xl bg-[#00b17b] hover:bg-[#008f63] text-white font-rubik text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    Claim Level Reward
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
