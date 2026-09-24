import React from 'react';
import { GameScreen } from '../../types/game';
import { socialService } from '../../services/social/socialService';

interface BottomNavDockProps {
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({ currentScreen, onNavigate }) => {
  if (currentScreen === 'race' || currentScreen === 'title') {
    return null; // Do not show floating tab bar during active gameplay or title screen
  }

  const party = socialService.getPartyState();
  const partyBadge = party ? `${party.members.length}/4` : undefined;

  const navItems = [
    { id: 'lobby' as GameScreen, label: 'Lobby', icon: 'cottage' },
    { id: 'modes' as GameScreen, label: 'Play', icon: 'sports_esports' },
    { id: 'friends' as GameScreen, label: 'Friends', icon: 'group', badge: partyBadge || '3' },
    { id: 'heroes' as const, label: 'Heroes', icon: 'checkroom' },
    { id: 'shop' as const, label: 'Shop', icon: 'redeem' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-3 pt-1 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-full p-1.5 shadow-[0_16px_32px_-4px_rgba(14,165,233,0.18),0_6px_12px_-2px_rgba(15,23,42,0.08)] border border-[#e2e7ff] flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.id === 'lobby' || item.id === 'modes' || item.id === 'friends') {
                    onNavigate(item.id);
                  } else {
                    alert(`${item.label} is coming in the next update! Playable maps and Local Social/Party are ready in 'Play', 'Friends', or 'Lobby'.`);
                  }
                }}
                className={`relative flex flex-col items-center justify-center min-w-[54px] h-12 rounded-full transition-all duration-200 active:scale-90 ${
                  isActive
                    ? 'bg-[#0ea5e9] text-white shadow-md scale-105'
                    : 'text-[#3e4850] hover:text-[#006591]'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="font-rubik text-[10px] font-black leading-none mt-0.5">
                  {item.label}
                </span>

                {item.badge && !isActive && (
                  <span className="absolute top-1 right-2.5 px-1 min-w-4 h-4 rounded-full bg-[#00b17b] text-white flex items-center justify-center text-[9px] font-black shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
