import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen } from '../../types/game';
import { socialService } from '../../services/social/socialService';
import { PartyState, Friend } from '../../services/social/socialTypes';
import { MAP_REGISTRY } from '../../game/maps/mapRegistry';
import { networkClient } from '../../services/networking/NetworkClient';

interface PartyLobbyScreenProps {
  onNavigate: (screen: GameScreen) => void;
  onStartRace: (mapId: string, isMultiplayer?: boolean, roomId?: string) => void;
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
    const isMulti = party.members.length > 1;

    // Connect to WebSocket if possible
    if (isMulti) {
      try {
        await networkClient.connect('ws://localhost:3001');
        if (networkClient.isConnected) {
          networkClient.send({
            type: 'JOIN_ROOM',
            roomId: party.partyId,
            playerId: profile.id,
            displayName: profile.displayName,
            avatarId: profile.avatarId,
            mapId: party.selectedMapId,
            mode: party.selectedMode,
          });
        }
      } catch {
        // Fallback gracefully
      }
    }

    onStartRace(party.selectedMapId, isMulti, party.partyId);
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

  const mapList = Object.values(MAP_REGISTRY);
  const selectedMapDef = MAP_REGISTRY[party.selectedMapId] || mapList[0];

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white font-rubik text-xs font-bold py-2 px-4 rounded-full shadow-lg border border-[#3e4850] animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLeaveParty}
            className="w-9 h-9 rounded-full bg-white border border-[#e2e7ff] text-[#3e4850] flex items-center justify-center shadow-xs active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-rubik text-xl font-black text-[#131b2e] tracking-tight">
              Party Squad ({party.members.length}/4)
            </h1>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              Leader: {party.members.find((m) => m.id === party.leaderId)?.displayName || 'You'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLeaveParty}
          className="px-3 py-1.5 rounded-full bg-[#ffddb8] hover:bg-[#ffc994] text-[#855300] font-rubik text-xs font-black transition-colors"
        >
          Leave Party
        </button>
      </div>

      {/* Party Members (4 slots) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[0, 1, 2, 3].map((slotIdx) => {
          const member = party.members[slotIdx];
          if (member) {
            const isLocal = member.id === profile.id;
            return (
              <div
                key={member.id}
                className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  member.isReady
                    ? 'border-[#00b17b] bg-[#e6fbf4]'
                    : 'border-[#e2e7ff] bg-white'
                }`}
              >
                {/* Status Badges */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {member.isLeader && (
                    <span className="material-symbols-outlined text-[#fea619] text-[16px]">crown</span>
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-[#f2f3ff] border-2 border-white shadow-xs flex items-center justify-center text-2xl mb-1.5">
                  🏃
                </div>

                <div className="font-rubik text-xs font-black text-[#131b2e] truncate w-full">
                  {member.displayName} {isLocal && '(You)'}
                </div>

                <div className="mt-2">
                  {member.isReady ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#00b17b] text-white font-rubik text-[9px] font-black uppercase tracking-wider">
                      READY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#8e909a]/20 text-[#3e4850] font-rubik text-[9px] font-black uppercase tracking-wider">
                      WAITING
                    </span>
                  )}
                </div>

                {isLeader && !isLocal && (
                  <button
                    onClick={() => handleKickMember(member.id, member.displayName)}
                    className="mt-2 text-[10px] text-[#ba1a1a] font-bold hover:underline"
                  >
                    Kick
                  </button>
                )}
              </div>
            );
          }

          // Empty Slot
          return (
            <div
              key={`empty-${slotIdx}`}
              onClick={() => setShowInviteModal(true)}
              className="p-3 rounded-2xl border-2 border-dashed border-[#dae2fd] bg-[#faf8ff] hover:bg-white flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#dae2fd] text-[#0ea5e9] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </div>
              <span className="font-rubik text-[11px] font-bold text-[#0ea5e9]">
                + Invite
              </span>
            </div>
          );
        })}
      </div>

      {/* Mode & Map Selection Section */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-[#e2e7ff] flex flex-col gap-4">
        {/* Game Mode */}
        <div>
          <label className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider mb-2 block">
            Game Mode {!isLeader && '(Leader Only)'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GAME_MODES.map((m) => {
              const isSelected = party.selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-[#0ea5e9] bg-[#e0f2fe]'
                      : 'border-[#e2e7ff] hover:bg-[#faf8ff]'
                  }`}
                >
                  <div className="font-rubik text-xs font-black text-[#131b2e]">{m.name}</div>
                  <div className="font-rubik text-[9px] font-bold text-[#3e4850] mt-0.5">{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Track */}
        <div>
          <label className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider mb-2 block">
            Selected Track {!isLeader && '(Leader Only)'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {mapList.map((m) => {
              const isSelected = party.selectedMapId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMap(m.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-2 border-[#0ea5e9] bg-[#f0f9ff] shadow-xs'
                      : 'border-[#e2e7ff] hover:bg-[#faf8ff]'
                  }`}
                >
                  <div className="font-rubik text-xs font-black text-[#131b2e]">{m.name}</div>
                  <div className="font-rubik text-[9px] font-bold text-[#8e909a] mt-0.5">{m.theme}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-[#e2e7ff] flex items-center justify-between gap-3">
        <div>
          <div className="font-rubik text-sm font-black text-[#131b2e]">
            {selectedMapDef.name}
          </div>
          <div className="font-rubik text-[10px] font-bold text-[#006591]">
            {party.members.every((m) => m.isReady) ? 'All Members Ready!' : 'Waiting for Ready...'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isLeader && (
            <button
              onClick={handleToggleReady}
              className={`py-3 px-5 rounded-xl font-rubik text-xs font-black shadow-md transition-all ${
                currentMember?.isReady
                  ? 'bg-[#8e909a] text-white'
                  : 'bg-[#00b17b] text-white'
              }`}
            >
              {currentMember?.isReady ? 'CANCEL READY' : 'READY UP'}
            </button>
          )}

          {isLeader && (
            <button
              onClick={handleLaunchGame}
              disabled={!party.members.every((m) => m.isReady)}
              className={`py-3 px-6 rounded-xl font-rubik text-xs font-black shadow-md flex items-center gap-1.5 transition-all ${
                party.members.every((m) => m.isReady)
                  ? 'bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] shadow-[0_3px_0_0_#855300] active:translate-y-0.5 cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>LAUNCH RACE</span>
            </button>
          )}
        </div>
      </div>

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#e2e7ff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-rubik text-base font-black text-[#131b2e]">Invite Online Friends</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full bg-[#f2f3ff] text-[#3e4850] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {friends.length === 0 ? (
                <p className="font-rubik text-xs text-[#8e909a] py-6 text-center">
                  No online friends available to invite.
                </p>
              ) : (
                friends.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-[#e2e7ff] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-rubik text-xs font-black text-[#131b2e]">{f.displayName}</div>
                      <div className="font-rubik text-[10px] text-[#00b17b]">Online</div>
                    </div>
                    <button
                      onClick={() => handleInviteFriend(f)}
                      className="px-3 py-1 rounded-full bg-[#0ea5e9] text-white font-rubik text-xs font-black"
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
