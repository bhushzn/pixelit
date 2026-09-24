import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen } from '../../types/game';
import { socialService } from '../../services/social/socialService';
import { Friend, FriendRequest, PlayerProfile } from '../../services/social/socialTypes';

interface FriendsScreenProps {
  onNavigate: (screen: GameScreen) => void;
  onOpenParty: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'pixel_runner_01', name: 'Pip Standard', color: 'bg-[#fea619]' },
  { id: 'pixel_runner_02', name: 'Fox Rusher', color: 'bg-[#ff5722]' },
  { id: 'pixel_runner_03', name: 'Nova Striker', color: 'bg-[#0ea5e9]' },
  { id: 'pixel_runner_04', name: 'Jungle Scout', color: 'bg-[#10b981]' },
  { id: 'pixel_runner_05', name: 'Candy Sprinter', color: 'bg-[#ec4899]' },
  { id: 'pixel_runner_06', name: 'Sky Glider', color: 'bg-[#8b5cf6]' },
];

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ onNavigate, onOpenParty }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => socialService.getProfile());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(profile.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isOnline = socialService.isOnlineMode();

  const refreshState = useCallback(async () => {
    setProfile(socialService.getProfile());
    const [fList, rList] = await Promise.all([
      socialService.getFriends(),
      socialService.getFriendRequests(),
    ]);
    setFriends(fList);
    setRequests(rList);
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = await socialService.searchUsers(searchQuery);
    setSearchResults(results);
  };

  const handleSendRequest = async (target: Friend) => {
    const res = await socialService.sendFriendRequest(target);
    showToast(res.message);
    await refreshState();
  };

  const handleAcceptRequest = async (requestId: string) => {
    await socialService.acceptFriendRequest(requestId);
    showToast('Friend request accepted!');
    await refreshState();
  };

  const handleDeclineRequest = async (requestId: string) => {
    await socialService.declineFriendRequest(requestId);
    showToast('Friend request declined.');
    await refreshState();
  };

  const handleRemoveFriend = async (friendId: string, name: string) => {
    if (confirm(`Remove ${name} from your friends list?`)) {
      await socialService.removeFriend(friendId);
      showToast(`${name} removed from friends.`);
      await refreshState();
    }
  };

  const handleSaveProfile = async () => {
    if (!newDisplayName.trim()) return;
    const updated = await socialService.updateProfile({
      displayName: newDisplayName.trim(),
      avatarId: selectedAvatar,
    });
    setProfile(updated);
    setEditingProfile(false);
    showToast('Profile updated successfully!');
  };

  const handleInviteToParty = async (friend: Friend) => {
    let party = socialService.getPartyState();
    if (!party) {
      party = await socialService.createParty('quick_race', 'cloud_climb');
    }
    const res = await socialService.inviteFriendToParty(friend);
    showToast(res.message);
    onOpenParty();
  };

  const onlineFriends = friends.filter((f) => f.status === 'online' || f.status === 'away');
  const offlineFriends = friends.filter((f) => f.status === 'offline');
  const incomingRequests = requests.filter((r) => r.type === 'incoming');
  const outgoingRequests = requests.filter((r) => r.type === 'outgoing');

  return (
    <div className="flex-1 w-full max-w-xl mx-auto px-4 py-4 flex flex-col gap-4 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#131b2e] text-white px-4 py-2 rounded-full font-rubik text-xs font-bold shadow-xl border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

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
            <div className="flex items-center gap-2">
              <h1 className="font-rubik text-xl font-black text-[#131b2e] tracking-tight">
                Friends & Squad
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full font-rubik text-[9px] font-black uppercase ${
                  isOnline
                    ? 'bg-[#00b17b]/15 text-[#006c49]'
                    : 'bg-[#fea619]/20 text-[#855300]'
                }`}
              >
                {isOnline ? 'Firebase Online' : 'Local Demo'}
              </span>
            </div>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              {isOnline ? 'Real Firebase Player Network' : 'Single Device Simulation'}
            </p>
          </div>
        </div>

        <button
          onClick={async () => {
            let party = socialService.getPartyState();
            if (!party) await socialService.createParty();
            onOpenParty();
          }}
          className="px-3 py-1.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">diversity_3</span>
          <span>Party Lobby</span>
        </button>
      </div>

      {/* Local Player Profile Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white font-black text-lg shadow-inner border-2 border-white">
            <span className="material-symbols-outlined text-[24px]">face</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-rubik text-base font-black text-[#131b2e]">{profile.displayName}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#fea619]/20 text-[#855300] font-rubik text-[10px] font-black">
                LVL {profile.level}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#00b17b]">
                <span className="w-2 h-2 rounded-full bg-[#00b17b]"></span> Online
              </span>
              <span className="text-[10px] text-[#8e909a] font-rubik">({profile.avatarId})</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditingProfile(true)}
          className="px-3 py-1 rounded-xl bg-[#f2f3ff] hover:bg-[#e2e7ff] text-[#006591] font-rubik text-xs font-bold transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-[#e2e7ff] flex flex-col gap-4">
            <h3 className="font-rubik text-base font-black text-[#131b2e]">Edit Profile</h3>
            
            <div>
              <label className="font-rubik text-xs font-bold text-[#3e4850] block mb-1">Display Name</label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                maxLength={16}
                className="w-full px-3 py-2 rounded-xl border border-[#c9e6ff] focus:outline-none focus:border-[#0ea5e9] font-rubik text-sm"
              />
            </div>

            <div>
              <label className="font-rubik text-xs font-bold text-[#3e4850] block mb-2">Select Runner Avatar</label>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      selectedAvatar === av.id
                        ? 'border-[#0ea5e9] bg-[#e0f2fe] font-black'
                        : 'border-[#e2e7ff] bg-[#faf8ff]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${av.color} text-white flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[18px]">sports_score</span>
                    </div>
                    <span className="font-rubik text-[9px] truncate">{av.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditingProfile(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-[#3e4850] font-rubik text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 rounded-xl bg-[#0ea5e9] text-white font-rubik text-xs font-black shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search / Add Friend Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-3">
        <h2 className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#0ea5e9]">person_search</span>
          {isOnline ? 'Search Online Players' : 'Find Demo Players'}
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder={isOnline ? 'Search by username...' : 'Search demo runners (e.g. PixelFox, Nova)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-[#f2f3ff] border border-[#e2e7ff] font-rubik text-xs focus:outline-none focus:border-[#0ea5e9]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#00b17b] hover:bg-[#009164] text-white font-rubik text-xs font-black shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 border-t border-[#f2f3ff] pt-2">
            <span className="font-rubik text-[10px] font-bold text-[#8e909a]">Results ({searchResults.length}):</span>
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded-xl bg-[#faf8ff] border border-[#e2e7ff]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#fea619] text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-rubik text-xs font-bold text-[#131b2e]">{user.displayName}</div>
                    <div className="font-rubik text-[9px] text-[#8e909a]">Level {user.level} • {user.status}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(user)}
                  className="px-2.5 py-1 rounded-lg bg-[#0ea5e9] text-white font-rubik text-[10px] font-bold shadow-xs hover:bg-[#0284c7]"
                >
                  + Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests Section */}
      {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-3">
          <h2 className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#fea619]">mark_email_unread</span>
            Friend Requests ({incomingRequests.length + outgoingRequests.length})
          </h2>

          {/* Incoming */}
          {incomingRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#fffbeb] border border-[#fef3c7]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-white flex items-center justify-center font-bold text-xs">
                  {req.fromPlayer.displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-rubik text-xs font-bold text-[#131b2e]">{req.fromPlayer.displayName}</div>
                  <div className="font-rubik text-[9px] text-[#8e909a]">Incoming Request • LVL {req.fromPlayer.level}</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleAcceptRequest(req.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#00b17b] text-white font-rubik text-[10px] font-bold shadow-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineRequest(req.id)}
                  className="px-2.5 py-1 rounded-lg bg-gray-200 text-[#3e4850] font-rubik text-[10px] font-bold"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}

          {/* Outgoing */}
          {outgoingRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-[10px]">
                  {req.fromPlayer.displayName.charAt(0)}
                </div>
                <div>
                  <div className="font-rubik text-xs font-bold text-[#3e4850]">{req.fromPlayer.displayName}</div>
                  <div className="font-rubik text-[9px] text-[#8e909a]">Outgoing • Pending response</div>
                </div>
              </div>
              <span className="font-rubik text-[9px] font-bold text-gray-400">Pending</span>
            </div>
          ))}
        </div>
      )}

      {/* Online Friends List */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-3">
        <h2 className="font-rubik text-xs font-black text-[#131b2e] uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00b17b] animate-pulse"></span>
            Online Friends ({onlineFriends.length})
          </div>
          <span className="text-[10px] font-bold text-[#8e909a]">{isOnline ? 'Firebase Online' : 'Demo Roster'}</span>
        </h2>

        {onlineFriends.length === 0 ? (
          <p className="font-rubik text-xs text-[#8e909a] py-2 text-center">No friends currently online.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {onlineFriends.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] border border-[#e2e7ff] hover:border-[#c9e6ff] transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {f.displayName.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      f.status === 'online' ? 'bg-[#00b17b]' : 'bg-[#fea619]'
                    }`}></span>
                  </div>
                  <div>
                    <div className="font-rubik text-xs font-black text-[#131b2e]">{f.displayName}</div>
                    <div className="font-rubik text-[10px] font-bold text-[#006591]">
                      Level {f.level} • {f.status === 'online' ? 'In Lobby' : 'Away'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleInviteToParty(f)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-[11px] font-black shadow-xs flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[14px]">group_add</span>
                    <span>Invite</span>
                  </button>
                  <button
                    onClick={() => handleRemoveFriend(f.id, f.displayName)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                    title="Remove Friend"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offline Friends List */}
      {offlineFriends.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e7ff] flex flex-col gap-3">
          <h2 className="font-rubik text-xs font-black text-[#8e909a] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
            Offline Friends ({offlineFriends.length})
          </h2>

          <div className="flex flex-col gap-2">
            {offlineFriends.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 opacity-75">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-xs">
                    {f.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-rubik text-xs font-bold text-[#3e4850]">{f.displayName}</div>
                    <div className="font-rubik text-[9px] text-[#8e909a]">Offline • LVL {f.level}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFriend(f.id, f.displayName)}
                  className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
