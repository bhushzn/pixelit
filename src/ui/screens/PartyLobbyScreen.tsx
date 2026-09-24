import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen } from '../../types/game';
import { socialService } from '../../services/social/socialService';
import { PartyState, Friend } from '../../services/social/socialTypes';
import { MAP_REGISTRY } from '../../game/maps/mapRegistry';

interface PartyLobbyScreenProps {
  onNavigate: (screen: GameScreen) => void;
  onStartRace: (mapId: string) => void;
}

const GAME_MODES = [
  { id: 'quick_race', name: 'Quick Race', icon: 'bolt', status: 'AVAILABLE', desc: '4-Runner Sprint' },
  { id: 'time_trial', name: 'Time Trial', icon: 'timer', status: 'AVAILABLE', desc: 'Solo Speed Run' },
  { id: 'team_rush', name: 'Team Rush', icon: 'groups', status: 'COMING SOON', desc: '2v2 Tag Battle' },
  { id: 'custom_room', name: 'Custom Room', icon: 'tune', status: 'COMING SOON', desc: 'Host with Rules' },
];

export const PartyLobbyScreen: React.FC<PartyLobbyScreenProps> = ({ onNavigate, onStartRace }) => {
  const [party, setParty] = useState<PartyState | null>(() => socialService.getPartyState());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const isOnline = socialService.isOnlineMode();
  const profile = socialService.getProfile();
  const isLeader = party?.leaderId === profile.id;
  const currentMember = party?.members.find((m) => m.id === profile.id);

  const refreshParty = useCallback(async () => {
    let p = socialService.getPartyState();
    if (!p) {
      p = await socialService.createParty('quick_race', 'cloud_climb');
    }
    setParty(p);
    const fList = await socialService.getFriends();
    setFriends(fList.filter((f) => f.status === 'online'));
  }, []);

  useEffect(() => {
    refreshParty();
  }, [refreshParty]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectMap = async (mapId: string) => {
    if (!isLeader) {
      showToast('Only the party leader can select maps.');
      return;
    }
    await socialService.setPartyMap(mapId);
    setParty(socialService.getPartyState());
  };

  const handleSelectMode = async (modeId: string) => {
    if (!isLeader) {
      showToast('Only the party leader can select modes.');
      return;
    }
    if (modeId === 'team_rush' || modeId === 'custom_room') {
      showToast(`${modeId.replace('_', ' ').toUpperCase()} is coming in the future multiplayer update!`);
      return;
    }
    await socialService.setPartyMode(modeId);
    setParty(socialService.getPartyState());
  };

  const handleToggleReady = async () => {
    if (!currentMember) return;
    await socialService.setReady(!currentMember.isReady);
    setParty(socialService.getPartyState());
  };

  const handleKickMember = async (memberId: string, name: string) => {
    await socialService.removePartyMember(memberId);
    showToast(`${name} removed from party.`);
    setParty(socialService.getPartyState());
  };

  const handleInviteFriend = async (friend: Friend) => {
    const res = await socialService.inviteFriendToParty(friend);
    showToast(res.message);
    setShowInviteModal(false);
    setParty(socialService.getPartyState());
  };

  const handleLeaveParty = async () => {
    await socialService.leaveParty();
    onNavigate('lobby');
  };

  const handleLaunchGame = async () => {
    if (!party) return;
    const check = socialService.canStartRace();
    if (!check.allowed) {
      showToast(check.reason || 'Cannot launch race.');
      return;
    }

    await socialService.startRace();
    onStartRace(party.selectedMapId);
  };

  if (!party) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-rubik text-lg font-black text-[#131b2e]">No Party Active</h2>
        <button
          onClick={async () => {
            const newP = await socialService.createParty();
            setParty(newP);
          }}
          className="mt-4 px-6 py-2.5 rounded-full bg-[#0ea5e9] text-white font-rubik text-sm font-black shadow-md"
        >
          Create New Party
        </button>
      </div>
    );
  }

  // 4 Player Slots
  const slots = [0, 1, 2, 3].map((idx) => party.members[idx] || null);
  const selectedMap = MAP_REGISTRY[party.selectedMapId] || MAP_REGISTRY['cloud_climb'];

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4 pb-28">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white px-4 py-2 rounded-full font-rubik text-xs font-bold shadow-xl border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('lobby')}
            className="w-9 h-9 rounded-full bg-white border border-[#e2e7ff] text-[#3e4850] flex items-center justify-center shadow-xs active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-rubik text-xl font-black text-[#131b2e] tracking-tight">
                Party Lobby
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-[#fea619]/20 text-[#855300] font-rubik text-[10px] font-black">
                {party.roomCode || 'ROOM-4P'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full font-rubik text-[8px] font-black uppercase ${
                  isOnline
                    ? 'bg-[#00b17b]/15 text-[#006c49]'
                    : 'bg-[#fea619]/20 text-[#855300]'
                }`}
              >
                {isOnline ? 'Firebase' : 'Local'}
              </span>
            </div>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              4-Player Squad • {party.members.length}/4 Runners Ready
            </p>
          </div>
        </div>

        <button
          onClick={handleLeaveParty}
          className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-rubik text-xs font-bold border border-red-200 transition-colors"
        >
          Leave Party
        </button>
      </div>

      {/* 4 Player Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((member, i) => (
          <div
            key={i}
            className={`relative rounded-2xl p-3 border flex flex-col items-center justify-center min-h-[140px] text-center transition-all ${
              member
                ? 'bg-white border-[#e2e7ff] shadow-sm'
                : 'bg-white/40 border-dashed border-[#c9e6ff] hover:bg-white/80'
            }`}
          >
            {member ? (
              <>
                {/* Leader Crown */}
                {member.isLeader && (
                  <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#fea619] text-[#684000] flex items-center justify-center shadow-xs font-black text-[12px]" title="Party Leader">
                    👑
                  </span>
                )}

                {/* Kick Button (Leader Only) */}
                {isLeader && !member.isLeader && (
                  <button
                    onClick={() => handleKickMember(member.id, member.displayName)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 flex items-center justify-center text-[10px]"
                    title="Remove Player"
                  >
                    ✕
                  </button>
                )}

                {/* Avatar Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] text-white flex items-center justify-center font-black text-xl shadow-inner border-2 border-white mb-2">
                  <span className="material-symbols-outlined text-[28px]">sports_score</span>
                </div>

                <span className="font-rubik text-xs font-black text-[#131b2e] truncate max-w-[100px]">
                  {member.displayName}
                </span>
                <span className="font-rubik text-[9px] text-[#8e909a] font-bold">
                  LVL {member.level} {member.isDemo ? '• DEMO' : ''}
                </span>

                {/* Ready Status Badge */}
                <div className="mt-1.5">
                  {member.isReady ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#00b17b]/15 text-[#006c49] font-rubik text-[9px] font-black flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00b17b]"></span> READY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#fea619]/15 text-[#855300] font-rubik text-[9px] font-black">
                      NOT READY
                    </span>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#0ea5e9] hover:text-[#0284c7] active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                </div>
                <span className="font-rubik text-xs font-black">+ Invite</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-[#e2e7ff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-rubik text-sm font-black text-[#131b2e]">Invite Online Friends</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {friends.length === 0 ? (
              <p className="font-rubik text-xs text-[#8e909a] py-3 text-center">No online friends available.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {friends.map((f: Friend) => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-xl bg-[#faf8ff] border border-[#e2e7ff]">
                    <div>
                      <div className="font-rubik text-xs font-bold text-[#131b2e]">{f.displayName}</div>
                      <div className="font-rubik text-[9px] text-[#00b17b]">Online • LVL {f.level}</div>
                    </div>
                    <button
                      onClick={() => handleInviteFriend(f)}
                      className="px-3 py-1 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-[10px] font-black"
                    >
                      Invite
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]">sports_esports</span>
            Game Mode
          </h2>
          {!isLeader && <span className="font-rubik text-[10px] text-[#8e909a]">Leader selects mode</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GAME_MODES.map((mode) => {
            const isSelected = party.selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode.id)}
                disabled={!isLeader}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#0ea5e9] bg-[#e0f2fe] shadow-xs'
                    : 'border-[#e2e7ff] bg-[#faf8ff] hover:bg-white'
                } ${!isLeader ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-[18px] text-[#0ea5e9]">{mode.icon}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>}
                </div>
                <div className="mt-1">
                  <span className="font-rubik text-xs font-black text-[#131b2e] block truncate">{mode.name}</span>
                  <span className="font-rubik text-[9px] font-bold text-[#8e909a]">{mode.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Selection (4 Maps) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#fea619]">map</span>
            Select Map (4 Playable Maps)
          </h2>
          {!isLeader && <span className="font-rubik text-[10px] text-[#8e909a]">Leader selects map</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.values(MAP_REGISTRY).map((m) => {
            const isSelected = party.selectedMapId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMap(m.id)}
                disabled={!isLeader}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-2 border-[#0ea5e9] bg-white shadow-md scale-102'
                    : 'border-[#e2e7ff] bg-[#faf8ff] hover:bg-white opacity-80 hover:opacity-100'
                } ${!isLeader ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-[#fea619]/20 text-[#855300] font-rubik text-[8px] font-black uppercase">
                      {m.theme}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#0ea5e9] text-[18px]">check_circle</span>
                    )}
                  </div>
                  <h3 className="font-rubik text-xs font-black text-[#131b2e] leading-tight">{m.name}</h3>
                </div>

                <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-[#8e909a]">
                  <span className="truncate">{m.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Party Action Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-[#e2e7ff] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="font-rubik text-xs font-black text-[#131b2e]">
            {selectedMap.name} • {party.selectedMode.replace('_', ' ').toUpperCase()}
          </div>
          <div className="font-rubik text-[10px] text-[#8e909a]">
            {isLeader ? 'All members ready. Launch whenever ready!' : 'Waiting for party leader to start.'}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isLeader && (
            <button
              onClick={handleToggleReady}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-rubik text-xs font-black transition-all ${
                currentMember?.isReady
                  ? 'bg-[#fea619] text-[#684000]'
                  : 'bg-[#00b17b] text-white'
              }`}
            >
              {currentMember?.isReady ? 'UNREADY' : 'READY'}
            </button>
          )}

          {isLeader && (
            <button
              onClick={handleLaunchGame}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-sm font-black shadow-[0_4px_0_0_#855300] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">sports_score</span>
              <span>START RACE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
