import React from 'react';
import { RaceUpdateEvent } from '../../game/systems/RaceManager';

interface GameHUDProps {
  hudData: RaceUpdateEvent;
  mapTitle: string;
  onExit: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ hudData, mapTitle, onExit, onRestart }) => {
  // Format elapsed milliseconds as MM:SS.cc
  const formatTime = (ms: number): string => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 md:p-6 landscape:p-2">
      {/* Top HUD Cluster */}
      <div className="flex items-start justify-between gap-2 md:gap-4 landscape:gap-2">
        {/* Left: Position (1st / 1) & Back Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Position Pill */}
          <div className="px-3.5 py-1.5 landscape:py-1 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_8px_20px_-4px_rgba(14,165,233,0.2)] border border-[#e2e7ff] flex items-center gap-2">
            <div className="w-8 h-8 landscape:w-7 landscape:h-7 rounded-xl bg-[#fea619] flex items-center justify-center text-[#684000] font-rubik font-black text-sm landscape:text-xs shadow-inner">
              {hudData.position}st
            </div>
            <div className="flex flex-col">
              <span className="font-rubik text-[10px] landscape:text-[9px] font-black text-[#006591] uppercase tracking-wider leading-tight">
                Position
              </span>
              <span className="font-rubik text-xs landscape:text-[11px] font-black text-[#131b2e] leading-none">
                {hudData.position}st / {hudData.totalRacers}
              </span>
            </div>
          </div>

          {/* Quick Exit / Back Button */}
          <button
            onClick={onExit}
            aria-label="Exit Race"
            className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-md border border-[#e2e7ff] flex items-center justify-center text-[#3e4850] hover:text-[#ba1a1a] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px] landscape:text-[18px]">arrow_back</span>
          </button>
        </div>

        {/* Center: Race Timer & Map Name */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="px-5 py-1.5 landscape:py-0.5 landscape:px-3 rounded-full bg-white/95 backdrop-blur-md shadow-[0_8px_24px_-4px_rgba(14,165,233,0.25)] border-2 border-[#0ea5e9] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] landscape:text-[15px] text-[#0ea5e9] animate-pulse">timer</span>
            <span className="font-rubik text-base md:text-xl landscape:text-sm font-black text-[#131b2e] tracking-tight tabular-nums">
              {formatTime(hudData.timeMs)}
            </span>
          </div>
          <span className="font-rubik text-[10px] landscape:text-[8px] font-black text-[#006591] uppercase tracking-widest mt-1 landscape:mt-0.5 bg-white/80 px-2 py-0.5 rounded-full shadow-xs">
            {mapTitle}
          </span>
        </div>

        {/* Right: Coins, Checkpoint & Restart Button */}
        <div className="flex items-center gap-2 landscape:gap-1.5 pointer-events-auto">
          {/* Coins Pill */}
          <div className="h-9 landscape:h-8 px-3 landscape:px-2 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#e2e7ff] flex items-center gap-1.5">
            <div className="w-5 h-5 landscape:w-4 landscape:h-4 rounded-full bg-[#fea619] flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[14px] landscape:text-[12px] text-[#684000]">monetization_on</span>
            </div>
            <span className="font-rubik text-xs md:text-sm landscape:text-xs font-black text-[#131b2e]">
              {hudData.coins}
            </span>
          </div>

          {/* Simple, Clear Checkpoint Indicator: ○ Checkpoint -> ✓ Checkpoint */}
          <div className={`h-9 landscape:h-8 px-3 landscape:px-2 rounded-full backdrop-blur-md shadow-md border transition-all flex items-center gap-1.5 ${
            hudData.checkpointReached
              ? 'bg-[#dcfce7] border-[#00b17b] text-[#006c49]'
              : 'bg-white/95 border-[#e2e7ff] text-[#64748b]'
          }`}>
            <span className="font-rubik text-xs landscape:text-[11px] font-black">
              {hudData.checkpointReached ? '✓ Checkpoint' : '○ Checkpoint'}
            </span>
          </div>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            aria-label="Restart Race"
            className="w-9 h-9 landscape:w-8 landscape:h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-[#e2e7ff] flex items-center justify-center text-[#3e4850] hover:text-[#0ea5e9] active:rotate-180 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] landscape:text-[16px]">replay</span>
          </button>
        </div>
      </div>

      {/* Checkpoint Toast Notification (Displays briefly upon activation) */}
      {hudData.showCheckpointToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-bounce">
          <div className="px-5 py-2 rounded-2xl bg-[#00b17b] text-white font-rubik font-black text-sm md:text-base tracking-wider uppercase shadow-[0_8px_20px_rgba(0,177,123,0.5)] border-2 border-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">flag</span>
            <span>CHECKPOINT SAVED!</span>
          </div>
        </div>
      )}

      {/* Middle Top: Track Progress Bar (0% at start, ~50% at checkpoint, 100% at finish) */}
      <div className="w-full max-w-md mx-auto pointer-events-auto px-4 mt-2 landscape:mt-0.5">
        <div className="relative w-full h-3.5 landscape:h-2.5 bg-white/85 backdrop-blur-md rounded-full border border-[#0ea5e9]/30 shadow-inner p-0.5 flex items-center">
          {/* Filled Progress Bar */}
          <div
            className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-[#00b17b] rounded-full transition-all duration-150 relative"
            style={{ width: `${Math.max(4, hudData.progressPercent)}%` }}
          >
            {/* Runner Pip Pin */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 landscape:w-4 landscape:h-4 rounded-full bg-[#fea619] border-2 border-white shadow-md flex items-center justify-center">
              <span className="material-symbols-outlined text-[12px] landscape:text-[10px] text-[#684000]">sprint</span>
            </div>
          </div>
          {/* Finish Crown Icon */}
          <div className="absolute right-1 w-4 h-4 rounded-full bg-[#fea619] flex items-center justify-center text-white text-[10px] shadow-sm">
            👑
          </div>
        </div>
      </div>

      {/* Bottom Center: Power-Up Slot Placeholder Only (NO prank weapon or level 3 unlock text) */}
      <div className="flex items-center justify-center pointer-events-auto mb-1 md:mb-2 max-h-[500px]:hidden landscape:hidden md:landscape:flex">
        <div className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md shadow-md border-2 border-dashed border-[#0ea5e9]/40 flex items-center justify-center text-[#0ea5e9]/40">
          <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
        </div>
      </div>
    </div>
  );
};
