import React, { useState } from 'react';
import { GameScreen } from '../../types/game';
import { MAP_REGISTRY } from '../../game/maps/mapRegistry';
import { socialService } from '../../services/social/socialService';

interface PlayModesScreenProps {
  onStartRace: (mapId: string) => void;
  onNavigate: (screen: GameScreen) => void;
}

export const PlayModesScreen: React.FC<PlayModesScreenProps> = ({ onStartRace, onNavigate }) => {
  const [selectedMapId, setSelectedMapId] = useState<string>('cloud_climb');
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);

  const maps = Object.values(MAP_REGISTRY);
  const selectedMap = MAP_REGISTRY[selectedMapId] || maps[0];

  const handleStartSoloRace = () => {
    onStartRace(selectedMapId);
  };

  const handleOpenParty = () => {
    let party = socialService.getPartyState();
    if (!party) {
      socialService.createParty('quick_race', selectedMapId);
    } else {
      socialService.setPartyMap(selectedMapId);
    }
    onNavigate('party');
  };

  return (
    <div className="flex-1 w-full max-w-xl mx-auto px-4 py-4 flex flex-col gap-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('lobby')}
            className="w-9 h-9 rounded-full bg-white border border-[#e2e7ff] text-[#3e4850] flex items-center justify-center shadow-xs active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-rubik text-xl font-black text-[#131b2e] tracking-tight">
              Play & Modes
            </h1>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              Select Map & Play Solo or in Squad
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenParty}
          className="px-3 py-1.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">diversity_3</span>
          <span>Party Squad</span>
        </button>
      </div>

      {/* Map Selection Grid (4 Maps) */}
      <div className="flex flex-col gap-2">
        <h2 className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#fea619]">map</span>
          Choose Track (4 Playable Maps)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {maps.map((m) => {
            const isSelected = selectedMapId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMapId(m.id)}
                className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-[#0ea5e9] bg-white shadow-md scale-101'
                    : 'border-[#e2e7ff] bg-[#faf8ff] hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded bg-[#fea619]/20 text-[#855300] font-rubik text-[9px] font-black uppercase">
                      {m.theme}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#0ea5e9] text-[20px]">check_circle</span>
                    )}
                  </div>
                  <h3 className="font-rubik text-base font-black text-[#131b2e]">{m.name}</h3>
                  <p className="font-rubik text-[11px] text-[#3e4850] mt-0.5">{m.subtitle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#f2f3ff] flex items-center justify-between text-[10px] font-bold text-[#8e909a]">
                  <span>🏁 {m.isPlayable ? 'Playable Map' : 'Coming Soon'}</span>
                  <span>⭐ Level {m.unlockedLevel} Required</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matchmaking / Solo Launch Buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-[#e2e7ff] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-rubik text-sm font-black text-[#131b2e]">{selectedMap.name}</div>
            <div className="font-rubik text-[10px] font-bold text-[#00b17b]">Ready to Sprint</div>
          </div>
          <button
            onClick={() => setShowMatchmakingModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#3e4850] font-rubik text-xs font-bold transition-colors"
          >
            Online Matchmaking
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleStartSoloRace}
            className="py-3.5 px-4 rounded-xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-xs font-black shadow-[0_3px_0_0_#855300] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>SOLO RACE</span>
          </button>

          <button
            onClick={handleOpenParty}
            className="py-3.5 px-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-xs font-black shadow-[0_3px_0_0_#006591] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">diversity_3</span>
            <span>SQUAD LOBBY</span>
          </button>
        </div>
      </div>

      {/* Online Matchmaking Notice Modal */}
      {showMatchmakingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#e2e7ff] flex flex-col gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-[#e0f2fe] text-[#0ea5e9] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">cloud_sync</span>
            </div>
            <h3 className="font-rubik text-base font-black text-[#131b2e]">Online Matchmaking</h3>
            <p className="font-rubik text-xs text-[#3e4850] leading-relaxed">
              Real online matchmaking servers are coming in a future multiplayer update!
              <br /><br />
              For now, enjoy playable single-player races across all 4 maps or simulate local party lobbies with demo squad members.
            </p>
            <button
              onClick={() => setShowMatchmakingModal(false)}
              className="mt-2 py-2.5 px-4 rounded-xl bg-[#0ea5e9] text-white font-rubik text-xs font-black shadow-md"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
