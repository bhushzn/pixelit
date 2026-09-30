import React, { useState, useEffect } from 'react';
import { RaceStats } from '../../types/game';
import { networkClient } from '../../services/networking/NetworkClient';
import { progressionService } from '../../services/progression/progressionService';
import { RaceRewardResult } from '../../services/progression/progressionTypes';
import { getLevelProgress } from '../../services/progression/progressionConfig';

interface ResultsModalProps {
  stats: RaceStats;
  mapTitle?: string;
  mapSubtitle?: string;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  stats,
  mapTitle,
  mapSubtitle,
  onPlayAgain,
  onBackToLobby,
}) => {
  const [rewardResult, setRewardResult] = useState<RaceRewardResult | null>(null);

  useEffect(() => {
    // Authoritatively award rewards once upon modal mount
    const res = progressionService.awardRaceRewards(stats, mapTitle || 'cloud_climb');
    setRewardResult(res);
  }, [stats, mapTitle]);

  const formatTime = (ms: number): string => {
    const totalSecs = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const multiplayerResults = networkClient.results;
  const isMultiplayer = Boolean(multiplayerResults && multiplayerResults.length > 1);

  const handleRematch = () => {
    if (networkClient.currentRoom) {
      networkClient.send({
        type: 'LEAVE_ROOM',
        roomId: networkClient.currentRoom.roomId,
        playerId: networkClient.localPlayerId,
      });
    }
    onPlayAgain();
  };

  const handleReturnToLobby = () => {
    if (networkClient.currentRoom) {
      networkClient.send({
        type: 'LEAVE_ROOM',
        roomId: networkClient.currentRoom.roomId,
        playerId: networkClient.localPlayerId,
      });
    }
    onBackToLobby();
  };

  const levelProgress = rewardResult ? getLevelProgress(rewardResult.currentTotalXp) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-3xl p-6 shadow-[0_24px_48px_-12px_rgba(14,165,233,0.35)] border-4 border-[#e2e7ff] flex flex-col items-center text-center my-8">
        {/* Top Trophy / Crown Badge Floating */}
        <div className="absolute -top-10 w-20 h-20 rounded-full bg-gradient-to-b from-[#fea619] to-[#855300] p-1 shadow-[0_12px_24px_rgba(254,166,25,0.4)] flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[42px] text-[#fea619]" style={{ fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="mt-8 mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffddb8] text-[#855300] font-rubik text-xs font-black uppercase tracking-wider mb-1">
            <span>🏁 Race Complete!</span>
          </div>
          <h2 className="font-rubik text-3xl font-black text-[#131b2e] tracking-tight">
            {stats.finishPosition === 1 ? 'VICTORY DASH!' : `${stats.finishPosition}th Place`}
          </h2>
          <p className="font-sans-body text-xs text-[#3e4850] font-semibold">
            {mapTitle ? `${mapTitle}${mapSubtitle ? ` • ${mapSubtitle}` : ''}` : 'Cloud Climb'}
          </p>
        </div>

        {/* Level-Up Celebration Banner */}
        {rewardResult?.didLevelUp && (
          <div className="w-full my-2 bg-gradient-to-r from-[#fea619] via-[#ffb95f] to-[#fea619] text-[#684000] p-3 rounded-2xl border border-white shadow-md flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">military_tech</span>
              <div className="text-left leading-none">
                <div className="font-rubik text-xs font-black uppercase">LEVEL UP!</div>
                <div className="font-rubik text-[10px] font-extrabold mt-0.5">
                  Level {rewardResult.previousLevel} → Level {rewardResult.newLevel}
                </div>
              </div>
            </div>
            <span className="text-xs font-black bg-white/40 px-2.5 py-1 rounded-xl">Awesome!</span>
          </div>
        )}

        {/* Newly Unlocked Item Notification */}
        {rewardResult && rewardResult.newlyUnlockedCosmetics.length > 0 && (
          <div className="w-full my-1 bg-[#e0f2fe] text-[#006591] p-2.5 rounded-2xl border border-[#c9e6ff] flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-[20px] text-[#0ea5e9]">redeem</span>
              <div>
                <div className="font-rubik text-[10px] font-black uppercase">NEW UNLOCK!</div>
                <div className="font-rubik text-xs font-black text-[#131b2e]">
                  {rewardResult.newlyUnlockedCosmetics[0].name}
                </div>
              </div>
            </div>
            <span className="font-rubik text-[9px] font-black uppercase bg-white px-2 py-0.5 rounded-lg">
              {rewardResult.newlyUnlockedCosmetics[0].category}
            </span>
          </div>
        )}

        {/* Multiplayer Ranked Leaderboard (if in multiplayer) */}
        {isMultiplayer && multiplayerResults && (
          <div className="w-full mb-3 flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
            {multiplayerResults.map((r) => {
              const isLocal = r.playerId === networkClient.localPlayerId;
              return (
                <div
                  key={r.playerId}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                    isLocal
                      ? 'border-[#0ea5e9] bg-[#e0f2fe] font-black'
                      : 'border-[#e2e7ff] bg-[#faf8ff] font-bold text-[#3e4850]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-[#131b2e] flex items-center justify-center text-[10px] font-black shadow-xs">
                      #{r.position}
                    </span>
                    <span className="truncate max-w-[120px]">{r.displayName} {isLocal && '(You)'}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#006591]">
                    {r.finished ? formatTime(r.finishTimeMs) : 'DNF'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Level XP Progress Bar */}
        {levelProgress && (
          <div className="w-full bg-[#faf8ff] border border-[#e2e7ff] p-2.5 rounded-2xl my-2 flex flex-col gap-1 text-left">
            <div className="flex justify-between font-rubik text-[10px] font-bold text-[#3e4850]">
              <span>Level {levelProgress.currentLevel} Progress:</span>
              <span className="text-[#0ea5e9] font-black">
                {levelProgress.currentLevelXp} / {levelProgress.nextLevelXp} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#0ea5e9] to-[#00b17b] h-full transition-all duration-500"
                style={{ width: `${levelProgress.progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 my-1">
          {/* Finish Time */}
          <div className="p-2.5 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd] flex flex-col items-center">
            <span className="font-rubik text-[9px] font-black uppercase text-[#006591] tracking-wider">
              Finish Time
            </span>
            <span className="font-rubik text-lg font-black text-[#131b2e] mt-0.5 tabular-nums">
              {formatTime(stats.finishTimeMs)}
            </span>
          </div>

          {/* Position */}
          <div className="p-2.5 rounded-2xl bg-[#f2f3ff] border border-[#dae2fd] flex flex-col items-center">
            <span className="font-rubik text-[9px] font-black uppercase text-[#006591] tracking-wider">
              Rank
            </span>
            <span className="font-rubik text-lg font-black text-[#00b17b] mt-0.5">
              {stats.finishPosition}st / {stats.totalRacers}
            </span>
          </div>

          {/* Coins Earned */}
          <div className="p-2.5 rounded-2xl bg-[#ffddb8]/40 border border-[#ffddb8] flex flex-col items-center">
            <span className="font-rubik text-[9px] font-black uppercase text-[#855300] tracking-wider">
              Coins Earned
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-[#fea619]">monetization_on</span>
              <span className="font-rubik text-base font-black text-[#131b2e]">
                +{rewardResult?.coinsEarned ?? stats.coinsCollected}
              </span>
            </div>
          </div>

          {/* XP Earned */}
          <div className="p-2.5 rounded-2xl bg-[#c9e6ff]/50 border border-[#c9e6ff] flex flex-col items-center">
            <span className="font-rubik text-[9px] font-black uppercase text-[#006591] tracking-wider">
              XP Earned
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]">stars</span>
              <span className="font-rubik text-base font-black text-[#131b2e]">
                +{rewardResult?.xpEarned ?? stats.xpEarned} XP
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Rematch & Back to Lobby) */}
        <div className="w-full flex flex-col gap-2 mt-3">
          <button
            onClick={handleRematch}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#fea619] text-[#684000] font-rubik text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_0_0_#855300,0_10px_16px_-4px_rgba(254,166,25,0.4)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">replay</span>
            {isMultiplayer ? 'REMATCH (FIND MATCH)' : 'PLAY AGAIN'}
          </button>

          <button
            onClick={handleReturnToLobby}
            className="w-full py-2.5 px-6 rounded-2xl bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] font-rubik text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">cottage</span>
            BACK TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
};
