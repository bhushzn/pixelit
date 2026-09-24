import React, { useState } from 'react';
import { GameScreen } from '../../types/game';

interface PlayModesScreenProps {
  onStartRace: (mode?: string) => void;
  onNavigate: (screen: GameScreen) => void;
}

export const PlayModesScreen: React.FC<PlayModesScreenProps> = ({ onStartRace, onNavigate }) => {
  const [roomCode, setRoomCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code.length < 4) {
      setFeedback('Please enter at least 4 characters!');
      return;
    }
    setFeedback(`Connecting to room #${code}... Teleporting to Cloud Climb! 🚀`);
    setTimeout(() => {
      onStartRace('custom_room');
    }, 1000);
  };

  return (
    <div className="sky-gradient-bg min-h-screen pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col gap-4 select-none">
      {/* Top Strip */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <button
          onClick={() => onNavigate('lobby')}
          aria-label="Back to Lobby"
          className="w-10 h-10 rounded-full bg-white shadow-md border border-[#e2e7ff] flex items-center justify-center text-[#006591] active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Party Status Pill */}
          <div className="h-9 px-3 rounded-full bg-white shadow-sm border border-[#e2e7ff] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00b17b]"></span>
            <span className="font-rubik text-[10px] font-black text-[#131b2e] uppercase">
              Solo • 1 Player
            </span>
          </div>

          <button
            onClick={() => alert('Squad link copied! Send to friends to party up.')}
            className="h-9 px-3 rounded-full bg-[#c9e6ff] text-[#003751] shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span className="font-rubik text-[10px] font-black uppercase">Party</span>
          </button>
        </div>
      </div>

      {/* Header Banner Title */}
      <div className="flex flex-col items-center justify-center text-center py-1">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffddb8] text-[#855300] mb-1 shadow-xs">
          <span className="material-symbols-outlined text-xs">flare</span>
          <span className="font-rubik text-[10px] font-black uppercase tracking-wider">
            Season 3: Cloud Sprint
          </span>
        </div>
        <h1 className="font-rubik text-2xl font-black text-[#131b2e] tracking-tight">
          SELECT GAME MODE
        </h1>
        <p className="font-sans-body text-xs text-[#3e4850] max-w-xs mt-0.5">
          Pick your playground and dash towards the crown!
        </p>
      </div>

      {/* Main Modes List */}
      <div className="flex flex-col gap-4">
        {/* 1. QUICK RACE (Featured Main Mode) */}
        <div className="relative rounded-3xl bg-white shadow-[0_16px_32px_-4px_rgba(14,165,233,0.18)] border-2 border-[#0ea5e9] overflow-hidden">
          {/* Top Badges */}
          <div className="flex items-center justify-between p-3 pb-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fea619] text-[#684000] font-rubik text-[10px] font-black shadow-xs">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Most Popular
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f2f3ff] text-[#006591] font-rubik text-[10px] font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b17b] animate-pulse"></span>
              2,480 In Race
            </span>
          </div>

          <div className="p-4 pt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#c9e6ff] flex items-center justify-center text-[#006591] shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">sprint</span>
                </div>
                <div>
                  <h2 className="font-rubik text-base font-black text-[#131b2e]">QUICK RACE</h2>
                  <span className="font-rubik text-[10px] font-black text-[#0ea5e9] uppercase">
                    Ranked &amp; Casual
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#ffddb8]/70 px-2 py-1 rounded-xl">
                <span className="material-symbols-outlined text-[14px] text-[#855300]">emoji_events</span>
                <span className="font-rubik text-[10px] font-black text-[#855300]">+50 XP</span>
              </div>
            </div>

            <p className="font-sans-body text-xs text-[#3e4850]">
              Sprint through moving platforms and dodge traps in <strong>Cloud Climb</strong>!
            </p>

            {/* Spec Badges (Strict 4 players limit) */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#006591] font-rubik text-[10px] font-bold">
                👥 4 Players Max
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#006591] font-rubik text-[10px] font-bold">
                ⏱️ ~90s Round
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#006591] font-rubik text-[10px] font-bold">
                🏆 Global Cups
              </span>
            </div>

            {/* Play Button */}
            <button
              onClick={() => onStartRace('quick_race')}
              className="w-full mt-2 py-3 px-6 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_0_#855300,0_8px_16px_rgba(254,166,25,0.4)] active:translate-y-1 active:shadow-none transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              PLAY NOW
            </button>
          </div>
        </div>

        {/* 2. TEAM RUSH (2v2 Co-op Mode) */}
        <div className="relative rounded-3xl bg-white shadow-sm border border-[#e2e7ff] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#e2e7ff] flex items-center justify-center text-[#006591]">
                <span className="material-symbols-outlined text-[22px]">diversity_3</span>
              </div>
              <div>
                <h2 className="font-rubik text-sm font-black text-[#131b2e]">TEAM RUSH</h2>
                <span className="font-rubik text-[10px] font-black text-[#855300] uppercase">
                  2v2 Cooperative (4 Max)
                </span>
              </div>
            </div>
            <span className="font-rubik text-[10px] font-black text-[#00b17b] bg-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
              2x Coins
            </span>
          </div>

          <p className="font-sans-body text-xs text-[#3e4850]">
            Pair up with a teammate to flip switches and cross the finish line together!
          </p>

          <button
            onClick={() => onStartRace('team_rush')}
            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-[#0ea5e9] text-white font-rubik text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_3px_0_0_#006591] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">group_add</span>
            ENTER QUEUE
          </button>
        </div>

        {/* 3. TIME TRIAL (Solo Challenge) */}
        <div className="relative rounded-3xl bg-white shadow-sm border border-[#e2e7ff] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#6ffbbe]/40 flex items-center justify-center text-[#006c49]">
                <span className="material-symbols-outlined text-[22px]">timer_3</span>
              </div>
              <div>
                <h2 className="font-rubik text-sm font-black text-[#131b2e]">TIME TRIAL</h2>
                <span className="font-rubik text-[10px] font-black text-[#00b17b] uppercase">
                  Solo Practice
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-rubik text-[9px] font-black text-[#6e7881] block uppercase">Record</span>
              <span className="font-rubik text-xs font-black text-[#006591]">00:48.24</span>
            </div>
          </div>

          <p className="font-sans-body text-xs text-[#3e4850]">
            Master optimal jump lines, beat your personal record, and hunt time badges.
          </p>

          <button
            onClick={() => onStartRace('time_trial')}
            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-[#00b17b] text-white font-rubik text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_3px_0_0_#006c49] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            START RUN
          </button>
        </div>

        {/* 4. CUSTOM ROOM (Private Match - Max 6 Players) */}
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fea619] text-[20px]">vpn_key</span>
            <h3 className="font-rubik text-sm font-black text-[#131b2e]">Have a Room Code?</h3>
          </div>
          <p className="font-sans-body text-xs text-[#3e4850]">
            Enter a 6-letter room code (Max 6 dashers per custom room):
          </p>

          <form onSubmit={handleJoin} className="flex items-center gap-2 mt-1">
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. SKY420"
              className="flex-1 h-11 px-3 rounded-2xl bg-[#eaedff] text-[#131b2e] font-rubik text-sm font-black tracking-widest uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
            />
            <button
              type="submit"
              className="h-11 px-5 rounded-2xl bg-[#fea619] text-[#684000] font-rubik text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 shadow-[0_3px_0_0_#855300] active:translate-y-0.5 active:shadow-none transition-all shrink-0"
            >
              <span>JOIN</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>

          {feedback && (
            <p className="font-rubik text-xs font-black text-[#00b17b] text-center mt-1 animate-pulse">
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
