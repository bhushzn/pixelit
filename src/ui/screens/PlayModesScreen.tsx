import React, { useState, useEffect } from 'react';
import { GameScreen } from '../../types/game';
import { MAP_REGISTRY } from '../../game/maps/mapRegistry';
import { socialService } from '../../services/social/socialService';
import { networkClient } from '../../services/networking/NetworkClient';
import { MatchRegion, PublicRoomSummary, ServerMessage } from '../../services/networking/networkTypes';

interface PlayModesScreenProps {
  onStartRace: (mapId: string, isMultiplayer?: boolean, roomId?: string) => void;
  onNavigate: (screen: GameScreen) => void;
}

export const PlayModesScreen: React.FC<PlayModesScreenProps> = ({ onStartRace, onNavigate }) => {
  const [selectedMapId, setSelectedMapId] = useState<string>('cloud_climb');
  const [activeTab, setActiveTab] = useState<'modes' | 'browse'>('modes');
  
  // Matchmaking Modal & Search state
  const [showMatchmakingModal, setShowMatchmakingModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchFoundData, setMatchFoundData] = useState<{
    matchId: string;
    roomId: string;
    mapId: string;
    mode: string;
    players: { playerId: string; displayName: string; avatarId: string }[];
    countdownSeconds: number;
  } | null>(null);

  // Live Queue Telemetry
  const [queueTimeSeconds, setQueueTimeSeconds] = useState(0);
  const [playersFoundCount, setPlayersFoundCount] = useState(1);
  const [estimatedWaitSeconds, setEstimatedWaitSeconds] = useState(3);
  const [playerMmr, setPlayerMmr] = useState(1000);
  const [mmrWindow, setMmrWindow] = useState<[number, number]>([900, 1100]);
  const [region] = useState<MatchRegion>('IN');
  const [statusMessage, setStatusMessage] = useState('Searching for online runners...');

  // Public Rooms Browser
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const maps = Object.values(MAP_REGISTRY);
  const selectedMap = MAP_REGISTRY[selectedMapId] || maps[0];

  useEffect(() => {
    let timer: any = null;
    if (isSearching) {
      timer = setInterval(() => {
        setQueueTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setQueueTimeSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSearching]);

  // Network message listener for matchmaking & rooms
  useEffect(() => {
    const unsubscribe = networkClient.onMessage((msg: ServerMessage) => {
      switch (msg.type) {
        case 'QUEUE_STATUS':
          if (msg.status === 'QUEUED') {
            setIsSearching(true);
            if (msg.playersInQueue !== undefined) setPlayersFoundCount(msg.playersInQueue);
            if (msg.estimatedWaitMs !== undefined) {
              setEstimatedWaitSeconds(Math.ceil(msg.estimatedWaitMs / 1000));
            }
            if (msg.mmrRange) setMmrWindow(msg.mmrRange);
          }
          break;

        case 'MATCH_SEARCHING':
          setIsSearching(true);
          setPlayersFoundCount(msg.playersFound);
          setEstimatedWaitSeconds(msg.estimatedWaitSeconds);
          setPlayerMmr(msg.mmr);
          break;

        case 'MATCH_FOUND':
          setMatchFoundData(msg);
          setIsSearching(false);
          setStatusMessage(`Match Found! Starting ${msg.mapId}...`);
          setTimeout(() => {
            setShowMatchmakingModal(false);
            setMatchFoundData(null);
            onStartRace(msg.mapId, true, msg.roomId);
          }, 1500);
          break;

        case 'MATCH_CANCELLED':
          setIsSearching(false);
          setStatusMessage('Matchmaking cancelled.');
          break;

        case 'MATCH_FAILED':
          setIsSearching(false);
          setStatusMessage('Matchmaking failed. Please retry.');
          break;

        case 'ROOM_LIST':
          setPublicRooms(msg.rooms);
          setIsLoadingRooms(false);
          break;

        case 'ERROR':
          if (msg.code.includes('QUEUE')) {
            setIsSearching(false);
            setStatusMessage(`Error: ${msg.message}`);
          }
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onStartRace]);

  const handleStartSoloRace = () => {
    onStartRace(selectedMapId, false);
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

  const handleStartMatchmaking = async () => {
    setShowMatchmakingModal(true);
    setIsSearching(true);
    setMatchFoundData(null);
    setStatusMessage('Connecting to Pixel Rush matchmaking server...');

    const profile = socialService.getProfile();

    try {
      if (!networkClient.isConnected) {
        const connected = await networkClient.connect('ws://localhost:3001');
        if (!connected) {
          setStatusMessage('Multiplayer server offline. Launching solo time-trial sprint.');
          setTimeout(() => {
            setIsSearching(false);
            setShowMatchmakingModal(false);
            onStartRace(selectedMapId, false);
          }, 1200);
          return;
        }
      }

      // Authoritative Queue Join
      setStatusMessage('Entering ranked matchmaking queue...');
      networkClient.send({
        type: 'CLIENT_HELLO',
        playerId: profile.id,
        displayName: profile.displayName,
        avatarId: profile.avatarId,
      });

      networkClient.joinQueue({
        mode: 'quick_race',
        mapPreference: selectedMapId,
        region: 'IN',
      });
    } catch {
      setStatusMessage('Launching single player race fallback...');
      setTimeout(() => {
        setIsSearching(false);
        setShowMatchmakingModal(false);
        onStartRace(selectedMapId, false);
      }, 800);
    }
  };

  const handleCancelMatchmaking = () => {
    networkClient.leaveQueue();
    setIsSearching(false);
    setShowMatchmakingModal(false);
    setMatchFoundData(null);
  };

  const handleRefreshRooms = async () => {
    setIsLoadingRooms(true);
    if (!networkClient.isConnected) {
      await networkClient.connect('ws://localhost:3001');
    }
    networkClient.requestRoomList();
  };

  const handleJoinPublicRoom = async (room: PublicRoomSummary) => {
    const profile = socialService.getProfile();
    if (!networkClient.isConnected) {
      await networkClient.connect('ws://localhost:3001');
    }
    networkClient.send({
      type: 'JOIN_ROOM',
      roomId: room.roomId,
      playerId: profile.id,
      displayName: profile.displayName,
      avatarId: profile.avatarId,
      mapId: room.mapId,
      mode: room.mode,
    });
    onStartRace(room.mapId, true, room.roomId);
  };

  return (
    <div className="flex-1 w-full max-w-xl mx-auto px-4 py-4 flex flex-col gap-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('lobby')}
            className="w-9 h-9 rounded-full bg-white border border-[#e2e7ff] text-[#3e4850] flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-rubik text-xl font-black text-[#131b2e] tracking-tight">
              Play & Ranked Matchmaking
            </h1>
            <p className="font-rubik text-[10px] font-bold text-[#006591]">
              Phase 10 Global Lobbies & Real-Time Queue
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenParty}
          className="px-3 py-1.5 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-rubik text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">diversity_3</span>
          <span>Party Squad</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#e2e7ff]/60 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('modes')}
          className={`flex-1 py-2 rounded-xl font-rubik text-xs font-black transition-all ${
            activeTab === 'modes'
              ? 'bg-white text-[#006591] shadow-xs'
              : 'text-[#3e4850] hover:text-[#131b2e]'
          }`}
        >
          🏁 QUICK RACE & TRACKS
        </button>
        <button
          onClick={() => {
            setActiveTab('browse');
            handleRefreshRooms();
          }}
          className={`flex-1 py-2 rounded-xl font-rubik text-xs font-black transition-all ${
            activeTab === 'browse'
              ? 'bg-white text-[#006591] shadow-xs'
              : 'text-[#3e4850] hover:text-[#131b2e]'
          }`}
        >
          🌐 GLOBAL ROOMS
        </button>
      </div>

      {activeTab === 'modes' ? (
        <>
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
                <div className="font-rubik text-[10px] font-bold text-[#00b17b]">Ranked Matchmaking Enabled</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#e0f2fe] text-[#006591] font-rubik text-[10px] font-black flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00b17b] animate-pulse"></span>
                Region: {region} (25ms)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleStartSoloRace}
                className="py-3.5 px-4 rounded-xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-rubik text-xs font-black shadow-[0_3px_0_0_#855300] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>SOLO PRACTICE</span>
              </button>

              <button
                onClick={handleStartMatchmaking}
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:brightness-105 text-white font-rubik text-xs font-black shadow-[0_3px_0_0_#006591] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>QUICK MATCH (4P)</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Global Rooms Discovery Browser */
        <div className="bg-white rounded-2xl p-4 shadow-md border border-[#e2e7ff] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-rubik text-sm font-black text-[#131b2e]">Live Public Lobbies</h3>
              <p className="font-rubik text-[10px] text-[#3e4850]">Discover and join active race rooms</p>
            </div>
            <button
              onClick={handleRefreshRooms}
              className="px-3 py-1.5 rounded-xl bg-[#e0f2fe] hover:bg-[#c9e6ff] text-[#006591] font-rubik text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${isLoadingRooms ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>Refresh</span>
            </button>
          </div>

          {publicRooms.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-[#8e909a]">meeting_room</span>
              <p className="font-rubik text-xs text-[#3e4850] font-bold">No active public rooms currently.</p>
              <p className="font-rubik text-[10px] text-[#8e909a]">Use Quick Match to queue or start a new party room.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
              {publicRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="p-3 rounded-xl border border-[#e2e7ff] bg-[#faf8ff] flex items-center justify-between hover:bg-white transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-rubik text-xs font-black text-[#131b2e]">{room.mapId}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#006591] text-[9px] font-black uppercase">
                        {room.mode}
                      </span>
                    </div>
                    <div className="font-rubik text-[10px] text-[#8e909a] mt-0.5 flex items-center gap-2">
                      <span>Players: {room.playerCount}/{room.maxPlayers}</span>
                      <span>•</span>
                      <span>Region: {room.region}</span>
                      <span>•</span>
                      <span className="text-[#00b17b]">{room.pingMs || 25}ms</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinPublicRoom(room)}
                    disabled={room.playerCount >= room.maxPlayers}
                    className={`px-3 py-1.5 rounded-xl font-rubik text-xs font-black transition-all ${
                      room.playerCount < room.maxPlayers
                        ? 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] active:scale-95 shadow-xs'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {room.playerCount < room.maxPlayers ? 'Join' : 'Full'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Online Matchmaking Modal */}
      {showMatchmakingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-[#e2e7ff] flex flex-col gap-3 text-center relative overflow-hidden">
            {matchFoundData ? (
              /* MATCH FOUND STATE */
              <div className="flex flex-col items-center gap-3 animate-bounce-short">
                <div className="w-16 h-16 rounded-full bg-[#00b17b]/20 text-[#00b17b] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[40px]">celebration</span>
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full bg-[#00b17b] text-white font-rubik text-xs font-black uppercase tracking-wider">
                    MATCH FOUND!
                  </span>
                  <h3 className="font-rubik text-lg font-black text-[#131b2e] mt-2">
                    {matchFoundData.mapId.toUpperCase().replace('_', ' ')}
                  </h3>
                  <p className="font-rubik text-xs text-[#006591] font-bold">
                    Mode: Quick Race • Players: {matchFoundData.players.length}/4
                  </p>
                </div>

                <div className="w-full bg-[#faf8ff] p-3 rounded-2xl border border-[#e2e7ff] flex flex-col gap-1 text-xs">
                  <div className="flex justify-between font-bold text-[#3e4850]">
                    <span>Room:</span>
                    <span className="font-mono text-[#131b2e]">{matchFoundData.roomId}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#3e4850]">
                    <span>Launching in:</span>
                    <span className="font-rubik font-black text-[#00b17b]">3s</span>
                  </div>
                </div>
              </div>
            ) : (
              /* SEARCHING QUEUE STATE */
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#e0f2fe] text-[#0ea5e9] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[36px] animate-spin">
                    cloud_sync
                  </span>
                </div>

                <div>
                  <h3 className="font-rubik text-lg font-black text-[#131b2e]">
                    Searching for Players...
                  </h3>
                  <p className="font-rubik text-xs text-[#3e4850] mt-1">{statusMessage}</p>
                </div>

                {/* Live Matchmaking Telemetry Card */}
                <div className="w-full bg-[#faf8ff] p-3.5 rounded-2xl border border-[#e2e7ff] flex flex-col gap-2 text-xs text-left">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#3e4850]">Players Found:</span>
                    <span className="font-rubik font-black text-[#0ea5e9]">{playersFoundCount}/4</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-[#3e4850]">Queue Time:</span>
                    <span className="font-mono text-[#131b2e]">{queueTimeSeconds}s</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-[#3e4850]">Estimated Wait:</span>
                    <span className="font-rubik font-black text-[#855300]">{estimatedWaitSeconds}s</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-[#3e4850]">MMR Range:</span>
                    <span className="font-rubik text-[#006591]">
                      {playerMmr} (±{mmrWindow[1] - playerMmr})
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-[#3e4850]">Region / Ping:</span>
                    <span className="font-rubik text-[#00b17b]">{region} • 25ms</span>
                  </div>
                </div>

                <button
                  onClick={handleCancelMatchmaking}
                  className="w-full py-3 px-4 rounded-xl bg-[#ffddb8] hover:bg-[#ffcca0] text-[#855300] font-rubik text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Cancel Matchmaking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
