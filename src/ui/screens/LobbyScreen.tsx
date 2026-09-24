import React from 'react';
import { GameScreen } from '../../types/game';
import { socialService } from '../../services/social/socialService';

interface LobbyScreenProps {
  onStartRace: () => void;
  onNavigate: (screen: GameScreen) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ onStartRace, onNavigate }) => {
  const profile = socialService.getProfile();
  const party = socialService.getPartyState();

  const handleInvite = () => {
    onNavigate('friends');
  };

  return (
    <div className="flex-1 w-full max-w-lg mx-auto px-4 py-3 flex flex-col items-center justify-between gap-3 pb-24">
      {/* Active Party Indicator Pill */}
      {party && (
        <div
          onClick={() => onNavigate('party')}
          className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white p-2.5 rounded-2xl shadow-md border border-white/30 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] animate-bounce">diversity_3</span>
            <div>
              <div className="font-rubik text-xs font-black">PARTY READY ({party.members.length}/4)</div>
              <div className="font-rubik text-[9px] text-white/90">Map: {party.selectedMapId.replace('_', ' ').toUpperCase()}</div>
            </div>
          </div>
          <span className="font-rubik text-xs font-black bg-white/20 px-2 py-1 rounded-xl">Enter Lobby →</span>
        </div>
      )}

      {/* Hero Character Stage */}
      <section className="relative w-full aspect-4/3 rounded-3xl bg-gradient-to-b from-[#e0f2fe] via-[#faf8ff] to-[#f2f3ff] border border-[#c9e6ff] shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] flex flex-col items-center justify-between p-4 overflow-hidden group">
        {/* Soft Background Cloud Elements */}
        <div className="absolute top-4 left-6 w-20 h-6 bg-white/70 rounded-full blur-[1px] pointer-events-none"></div>
        <div className="absolute top-10 right-8 w-28 h-8 bg-white/60 rounded-full blur-[1px] pointer-events-none"></div>

        {/* Player Nameplate / Title Header */}
        <div className="z-10 flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-[#e2e7ff]">
            <span className="material-symbols-outlined text-[16px] text-[#fea619]">military_tech</span>
            <span className="font-rubik text-xs font-black text-[#131b2e] tracking-wide">
              {profile.displayName}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-[#0ea5e9]/10 text-[#006591] font-rubik text-[10px] font-black">
              LVL {profile.level}
            </span>
          </div>
          <span className="font-rubik text-[10px] font-bold text-[#8e909a] mt-1 tracking-wider uppercase">
            ⚡ Pixel Speedster
          </span>
        </div>

        {/* Character Visual / Mascot Stand */}
        <div className="relative flex flex-col items-center justify-center my-auto">
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
            onClick={() => onNavigate('friends')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-xs border border-[#e2e7ff] text-[#3e4850] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]">group</span>
            <span className="font-rubik text-[10px] font-bold">Friends</span>
          </button>
          <button
            onClick={() => onNavigate('friends')}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-xs border border-[#e2e7ff] text-[#3e4850] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#fea619]">face</span>
            <span className="font-rubik text-[10px] font-bold">Profile</span>
          </button>
          <button
            onClick={handleInvite}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white shadow-xs border border-[#e2e7ff] text-[#3e4850] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00b17b]">share</span>
            <span className="font-rubik text-[10px] font-bold">Invite</span>
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
            onClick={() => onNavigate('party')}
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
              <span className="material-symbols-outlined text-[20px]">sports_esports</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-rubik text-xs font-black truncate">Map Select</span>
              <span className="font-rubik text-[10px] opacity-90 truncate">4 Playable Maps</span>
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
