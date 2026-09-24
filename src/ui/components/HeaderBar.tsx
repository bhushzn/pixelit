import React from 'react';
import { GameScreen } from '../../types/game';
import { authService } from '../../services/auth/authService';

interface HeaderBarProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
  coins: number;
  gems: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ currentScreen, onNavigate, coins, gems }) => {
  const user = authService.getCurrentUser();
  const isOnline = authService.isOnlineMode();

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await authService.signOut();
      onNavigate('title');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#e2e7ff] shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left: Brand & Mode Badge */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => onNavigate('lobby')}
            className="flex items-center gap-1.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              PR
            </div>
            <span className="font-rubik font-black text-base tracking-tight text-[#131b2e]">
              PIXEL RUSH
            </span>
          </div>

          {/* Mode Pill */}
          <span
            className={`px-2 py-0.5 rounded-full font-rubik text-[9px] font-black uppercase ${
              isOnline
                ? 'bg-[#00b17b]/15 text-[#006c49]'
                : 'bg-[#fea619]/20 text-[#855300]'
            }`}
            title={isOnline ? 'Connected to Firebase Online Backend' : 'Running in Local Development Mode'}
          >
            {isOnline ? 'Online' : 'Local Dev'}
          </span>
        </div>

        {/* Right: Currencies & User Account */}
        <div className="flex items-center gap-2.5">
          {/* Coins Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fef3c7] border border-[#fde68a] shadow-2xs">
            <span className="material-symbols-outlined text-[15px] text-[#d97706]">monetization_on</span>
            <span className="font-rubik text-xs font-black text-[#92400e]">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Gems Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0f2fe] border border-[#bae6fd] shadow-2xs">
            <span className="material-symbols-outlined text-[15px] text-[#0284c7]">diamond</span>
            <span className="font-rubik text-xs font-black text-[#0369a1]">
              {gems.toLocaleString()}
            </span>
          </div>

          {/* User Profile Avatar / Sign Out */}
          {user && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onNavigate('friends')}
                className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-rubik font-black text-xs shadow-xs hover:scale-105 transition-transform"
                title={`Signed in as ${user.displayName} (${user.isGuest ? 'Guest' : 'Account'})`}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </button>
              <button
                onClick={handleSignOut}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
