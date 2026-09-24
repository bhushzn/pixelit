import React from 'react';
import { RaceStats } from '../../types/game';

interface ResultsModalProps {
  stats: RaceStats;
  mapTitle?: string;
  mapSubtitle?: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({ stats, mapTitle, mapSubtitle, onPlayAgain, onBackToLobby }) => {
  const formatTime = (ms: number): string => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-3xl p-6 shadow-[0_24px_48px_-12px_rgba(14,165,233,0.35)] border-4 border-[#e2e7ff] flex flex-col items-center text-center">
        {/* Top Trophy / Crown Badge Floating */}
        <div className="absolute -top-10 w-20 h-20 rounded-full bg-gradient-to-b from-[#fea619] to-[#855300] p-1 shadow-[0_12px_24px_rgba(254,166,25,0.4)] flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[42px] text-[#fea619]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="mt-8 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffddb8] text-[#855300] font-rubik text-xs font-black uppercase tracking-wider mb-1">
            <span>🏁 Race Complete!</span>
          </div>
          <h2 className="font-rubik text-3xl font-black text-[#131b2e] tracking-tight">
            {stats.finishPosition === 1 ? 'VICTORY DASH!' : `${stats.finishPosition}th Place`}
          </h2>
          <p className="font-sans-body text-xs text-[#3e4850] font-semibold">
            {mapTitle ? `${mapTitle}${mapSubtitle ? ` • ${mapSubtitle}` : ''}` : 'Cloud Climb • Single-Player Vertical Slice'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 my-2">
          {/* Finish Time */}
          <div className="p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd] flex flex-col items-center">
            <span className="font-rubik text-[10px] font-black uppercase text-[#006591] tracking-wider">
              Finish Time
            </span>
            <span className="font-rubik text-xl font-black text-[#131b2e] mt-0.5 tabular-nums">
              {formatTime(stats.finishTimeMs)}
            </span>
          </div>

          {/* Position */}
          <div className="p-3 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd] flex flex-col items-center">
            <span className="font-rubik text-[10px] font-black uppercase text-[#006591] tracking-wider">
              Rank
            </span>
            <span className="font-rubik text-xl font-black text-[#00b17b] mt-0.5">
              {stats.finishPosition}st / {stats.totalRacers}
            </span>
          </div>

          {/* Coins Collected */}
          <div className="p-3 rounded-2xl bg-[#ffddb8]/40 border border-[#ffddb8] flex flex-col items-center">
            <span className="font-rubik text-[10px] font-black uppercase text-[#855300] tracking-wider">
              Coins Collected
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-[#fea619]">monetization_on</span>
              <span className="font-rubik text-lg font-black text-[#131b2e]">
                +{stats.coinsCollected}
              </span>
            </div>
          </div>

          {/* XP Earned */}
          <div className="p-3 rounded-2xl bg-[#c9e6ff]/50 border border-[#c9e6ff] flex flex-col items-center">
            <span className="font-rubik text-[10px] font-black uppercase text-[#006591] tracking-wider">
              XP Earned
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">stars</span>
              <span className="font-rubik text-lg font-black text-[#131b2e]">
                +{stats.xpEarned} XP
              </span>
            </div>
          </div>
        </div>

        {/* Checkpoint Recap Pill */}
        <div className="w-full py-2 px-3 rounded-xl bg-[#faf8ff] text-xs font-semibold text-[#3e4850] flex items-center justify-between border border-[#e2e7ff] mb-5">
          <span>Midway Checkpoint:</span>
          <span className="font-rubik font-black text-[#00b17b]">
            {stats.checkpointsPassed > 0 ? '✓ Validated' : 'Skipped'}
          </span>
        </div>

        {/* Action Buttons (Play Again & Back to Lobby) */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#fea619] text-[#684000] font-rubik text-base font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_0_0_#855300,0_10px_16px_-4px_rgba(254,166,25,0.4)] active:translate-y-1 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">replay</span>
            PLAY AGAIN
          </button>

          <button
            onClick={onBackToLobby}
            className="w-full py-3 px-6 rounded-2xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] font-rubik text-sm font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">cottage</span>
            BACK TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};
