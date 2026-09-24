import React, { useState } from 'react';
import { GameScreen } from '../../types/game';
import { authService } from '../../services/auth/authService';

interface LobbyScreenProps {
  onStartRace: () => void;
  onNavigate: (screen: GameScreen) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartRace, onNavigate }) => {
  const user = authService.getCurrentUser();
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState(false);

  const handleStreakClick = () => {
    if (!streakClaimed) {
      setStreakClaimed(true);
      alert('🌟 Daily Streak Day 4 Claimed! +200 Coins added to your pouch!');
    }
  };

  const handleInvite = () => {
    setInviteFeedback(true);
    navigator.clipboard?.writeText?.('Join my Pixel Rush party! Code: CLOUD4');
    setTimeout(() => setInviteFeedback(false), 2000);
  };

  return (
    <div className="sky-gradient-bg min-h-screen pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col gap-4 select-none">
      {/* Top Streak & Telemetry Bar */}
      <section className="w-full flex items-center justify-between gap-2 mt-1">
        {/* Streak Button */}
        <button
          onClick={handleStreakClick}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-[0_8px_16px_-4px_rgba(14,165,233,0.15)] border border-[#e2e7ff] active:scale-95 transition-all text-left"
        >
          <div className="w-6 h-6 rounded-full bg-[#fea619] flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-[#684000] text-[16px]">card_giftcard</span>
          </div>
          <div className="flex flex-col pr-1 min-w-0">
            <span className="font-rubik text-[9px] text-[#855300] leading-none uppercase tracking-wider font-black">
              Streak
            </span>
            <span className="font-rubik text-xs font-black text-[#131b2e] truncate">
              {streakClaimed ? 'Claimed! ⭐' : 'Day 4 Ready!'}
            </span>
          </div>
          {!streakClaimed && (
            <span className="w-2 h-2 rounded-full bg-[#00b17b] animate-ping ml-0.5"></span>
          )}
        </button>

        {/* Trophies & Spin */}
        <div className="flex items-center gap-2">
          {/* Trophies */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-[0_8px_16px_-4px_rgba(14,165,233,0.15)] border border-[#e2e7ff]">
            <span className="material-symbols-outlined text-[#fea619] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <span className="font-rubik text-xs font-black text-[#131b2e]">1,420</span>
          </div>

          {/* Daily Spin */}
          <button
            onClick={() => alert('🎰 Daily Lucky Spin: You won 50 Free Gems!')}
            aria-label="Daily Spin"
            className="relative w-9 h-9 rounded-full bg-white shadow-md border border-[#e2e7ff] flex items-center justify-center text-[#855300] active:rotate-45 active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-[#ffddb8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-[#855300]">casino</span>
            </div>
            <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-[#00b17b] text-white font-rubik text-[8px] font-black shadow-xs">
              SPIN
            </span>
          </button>
        </div>
      </section>

      {/* Online Friends Ticker */}
      <section className="w-full bg-white/90 backdrop-blur-md rounded-full shadow-sm px-3 py-1.5 border border-[#e2e7ff] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 shrink-0 bg-[#eaedff] px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#00b17b] animate-pulse"></span>
            <span className="font-rubik text-[10px] font-extrabold text-[#006591] uppercase">3 Online</span>
          </div>
          <span className="font-rubik text-[10px] font-bold text-[#131b2e] bg-[#f2f3ff] px-2 py-0.5 rounded-full">Nova</span>
          <span className="font-rubik text-[10px] font-bold text-[#131b2e] bg-[#f2f3ff] px-2 py-0.5 rounded-full">Blaze</span>
          <span className="font-rubik text-[10px] font-bold text-[#131b2e] bg-[#f2f3ff] px-2 py-0.5 rounded-full">Pixel</span>
        </div>
        <button
          onClick={handleInvite}
          className="shrink-0 flex items-center gap-1 bg-[#0ea5e9] text-white px-2.5 py-0.5 rounded-full shadow-xs active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">person_add</span>
          <span className="font-rubik text-[10px] font-black">{inviteFeedback ? 'Copied!' : 'Invite'}</span>
        </button>
      </section>

      {/* Central Hero Stage & 2D Avatar Podium */}
      <section className="relative w-full rounded-3xl bg-white/85 backdrop-blur-md shadow-[0_16px_32px_-8px_rgba(14,165,233,0.18)] p-4 flex flex-col items-center justify-between min-h-[330px] border-2 border-[#e2e7ff] overflow-hidden">
        {/* Sky Clouds Backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#c9e6ff]/40 to-transparent pointer-events-none"></div>

        {/* Top Status Inside Card */}
        <div className="z-10 w-full flex items-start justify-between">
          {/* Player Badge */}
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full py-1 px-3 shadow-xs border border-[#e2e7ff]">
            <div className="w-6 h-6 rounded-full bg-[#fea619] flex items-center justify-center text-[#684000] font-rubik text-[11px] font-black">
              {user?.level ?? 12}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-rubik text-xs font-black text-[#131b2e]">{user?.displayName ?? 'Pip'}</span>
                <span className="font-rubik text-[9px] text-[#006591] bg-[#c9e6ff] px-1 rounded-full font-black">YOU</span>
              </div>
              <span className="font-rubik text-[9px] text-[#3e4850] flex items-center gap-0.5 font-bold">
                ⭐ Speedster
              </span>
            </div>
          </div>

          {/* Party Status (Max 4 players) */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full py-0.5 px-2 shadow-xs border border-[#e2e7ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b17b]"></span>
              <span className="font-rubik text-[9px] font-black text-[#131b2e]">Party (1/4)</span>
            </div>
          </div>
        </div>

        {/* Character Visual Showcase */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center cursor-pointer group" onClick={onStartRace}>
          {/* Stylized Animated Runner Avatar */}
          <div className="relative flex flex-col items-center">
            {/* Pip Avatar Representation */}
            <div className="w-36 h-36 rounded-full bg-gradient-to-b from-[#c9e6ff] to-[#f2f3ff] border-4 border-white shadow-[0_12px_24px_rgba(14,165,233,0.25)] flex items-center justify-center transform group-hover:scale-105 active:scale-95 transition-transform">
              <div className="relative flex flex-col items-center">
                {/* Cap & Goggles */}
                <div className="w-16 h-7 bg-[#006591] rounded-t-full relative flex items-center justify-center">
                  <div className="w-10 h-3 bg-[#0ea5e9] rounded-full border border-white flex items-center justify-around px-1">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                  </div>
                </div>
                {/* Head */}
                <div className="w-14 h-12 bg-[#ffe0bd] rounded-b-2xl flex flex-col items-center justify-center -mt-1 shadow-inner">
                  <div className="flex gap-3 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#131b2e]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#131b2e]"></div>
                  </div>
                  <div className="w-4 h-1.5 bg-[#fea619] rounded-full"></div>
                </div>
                {/* Yellow Hoodie Body */}
                <div className="w-18 h-10 bg-[#fea619] rounded-xl -mt-1 flex items-center justify-center shadow-md">
                  <div className="w-1 h-8 bg-[#855300]"></div>
                </div>
                {/* Red Sneakers */}
                <div className="flex gap-4 -mt-1">
                  <div className="w-6 h-3 bg-[#f43f5e] rounded-md border-b-2 border-white"></div>
                  <div className="w-6 h-3 bg-[#f43f5e] rounded-md border-b-2 border-white"></div>
                </div>
              </div>

              {/* Ready Tag Pill */}
              <div className="absolute -top-1 -right-2 bg-[#fea619] text-[#684000] font-rubik text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-bounce">
                <span className="material-symbols-outlined text-[12px]">bolt</span> READY!
              </div>
            </div>

            {/* Podium Island Base */}
            <div className="w-44 h-8 bg-[#00b17b] rounded-full border-b-4 border-[#006c49] shadow-md flex items-center justify-center mt-2 px-3">
              <span className="font-rubik text-[10px] font-black text-white uppercase tracking-wider">
                🌱 Floating Island Turf
              </span>
            </div>
          </div>
        </div>

        {/* Customization Actions Strip */}
        <div className="z-10 w-full flex items-center justify-around pt-2">
          <button
            onClick={() => alert('Emote Wheel: 👋 Wave, 🎉 Cheer, 💃 Dance, ⚡ Flex')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-xs border border-[#e2e7ff] text-[#3e4850] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]">mood</span>
            <span className="font-rubik text-[10px] font-bold">Emotes</span>
          </button>
          <button
            onClick={() => alert('Hero Locker: Pip Speedster equipped! More runners coming soon.')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-xs border border-[#e2e7ff] text-[#3e4850] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#fea619]">checkroom</span>
            <span className="font-rubik text-[10px] font-bold">Outfit</span>
          </button>
          <button
            onClick={handleInvite}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-xs border border-[#e2e7ff] text-[#3e4850] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00b17b]">share</span>
            <span className="font-rubik text-[10px] font-bold">Share</span>
          </button>
        </div>
      </section>

      {/* Main Chunky Play CTA (Launches 2D Race) */}
      <section className="w-full flex flex-col gap-2">
        <button
          onClick={onStartRace}
          className="w-full py-4 px-6 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] shadow-[0_6px_0_0_#855300,0_16px_28px_-6px_rgba(254,166,25,0.45)] active:translate-y-1.5 active:shadow-[0_1px_0_0_#855300] transition-all flex items-center justify-between"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#855300] shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">play_arrow</span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-rubik text-xl md:text-2xl font-black tracking-tight uppercase">
              RUSH RACE
            </span>
            <span className="font-rubik text-[11px] font-bold opacity-85 mt-0.5">
              Cloud Climb • 4 Runners Max
            </span>
          </div>
          <span className="material-symbols-outlined text-[28px]">arrow_forward</span>
        </button>

        {/* Secondary Modes Grid (Party & Custom Room) */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <button
            onClick={() => onNavigate('modes')}
            className="p-3 rounded-2xl bg-[#0ea5e9] text-white shadow-[0_4px_0_0_#006591,0_10px_18px_-4px_rgba(14,165,233,0.35)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">diversity_3</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-rubik text-xs font-black truncate">Party Squad</span>
              <span className="font-rubik text-[10px] opacity-90 truncate">Max 4 Players</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('modes')}
            className="p-3 rounded-2xl bg-[#00b17b] text-white shadow-[0_4px_0_0_#006c49,0_10px_18px_-4px_rgba(0,177,123,0.35)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">vpn_key</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-rubik text-xs font-black truncate">Custom Room</span>
              <span className="font-rubik text-[10px] opacity-90 truncate">Max 6 Players</span>
            </div>
          </button>
        </div>
      </section>

      {/* Season Banner */}
      <section className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/80 border border-[#e2e7ff] text-[#131b2e] shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#fea619]"></span>
          <span className="font-rubik text-xs font-extrabold text-[#3e4850] truncate">
            Season 3: Cloud Sprint
          </span>
        </div>
        <div className="flex items-center gap-1 font-rubik text-xs font-black text-[#0ea5e9] shrink-0">
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span>14d left</span>
        </div>
      </section>
    </div>
  );
};
