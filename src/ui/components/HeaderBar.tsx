import React from 'react';
import { GameScreen } from '../../types/game';
import { authService } from '../../services/auth/authService';

interface HeaderBarProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
  coins?: number;
  gems?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentScreen,
  onNavigate,
  coins = 4850,
  gems = 120,
}) => {
  const user = authService.getCurrentUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#faf8ff]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 md:h-20 max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <button
          onClick={() => onNavigate('lobby')}
          className="flex items-center gap-2.5 min-w-0 text-left active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#0ea5e9] flex items-center justify-center text-white shadow-[0_4px_0_0_#006591] shrink-0">
            <span className="material-symbols-outlined text-[24px]">sports_esports</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-rubik text-base md:text-lg font-black text-[#006591] tracking-tight leading-none truncate">
              Pixel Rush
            </span>
            <span className="font-rubik text-[10px] md:text-xs font-black text-[#3e4850] uppercase tracking-wider truncate mt-0.5">
              {currentScreen === 'modes' ? 'Play Modes' : currentScreen === 'race' ? 'Racing World' : 'Lobby'}
            </span>
          </div>
        </button>

        {/* Currency & Actions */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Coins Capsule */}
          <div className="h-9 px-3 rounded-full bg-white shadow-[0_12px_24px_-4px_rgba(14,165,233,0.15)] flex items-center gap-1.5 border border-[#e2e7ff]">
            <div className="w-6 h-6 rounded-full bg-[#fea619] flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[16px] text-[#684000]">monetization_on</span>
            </div>
            <span className="font-rubik text-xs md:text-sm font-extrabold text-[#131b2e]">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Diamonds Capsule */}
          <div className="h-9 px-3 rounded-full bg-white shadow-[0_12px_24px_-4px_rgba(14,165,233,0.15)] flex items-center gap-1.5 border border-[#e2e7ff]">
            <div className="w-6 h-6 rounded-full bg-[#0ea5e9] flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[16px] text-white">diamond</span>
            </div>
            <span className="font-rubik text-xs md:text-sm font-extrabold text-[#131b2e]">
              {gems}
            </span>
          </div>

          {/* Settings Button */}
          <button
            aria-label="Settings"
            onClick={() => alert('Pixel Rush Settings: SFX: ON, Music: ON, Graphics: High')}
            className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-white shadow-[0_12px_24px_-4px_rgba(14,165,233,0.15)] flex items-center justify-center text-[#3e4850] hover:text-[#006591] active:scale-95 transition-all border border-[#e2e7ff]"
          >
            <span className="material-symbols-outlined text-[20px] md:text-[22px]">settings</span>
          </button>

          {/* User Profile Avatar with Level Pill */}
          <div className="relative flex items-center">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#006591] flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[20px]">person</span>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#fea619] text-[#684000] font-rubik text-[9px] px-1.5 py-0.5 rounded-full font-black leading-none shadow-sm">
              LV.{user?.level ?? 12}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
