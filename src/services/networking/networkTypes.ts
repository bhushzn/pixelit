/**
 * Pixel Rush Real-Time Multiplayer Networking Architecture (Phase 9, 10 & 11)
 * 4-Player Authoritative Real-Time Race, Ranked Matchmaking & Cosmetic Synchronization
 */

export type RoomMode = 'quick_race' | 'time_trial' | 'custom_room' | 'party_room';

export const MAX_PLAYERS_PER_ROOM = 4;

export const ALLOWED_MAP_IDS = [
  'cloud_climb',
  'sky_bridge',
  'candy_canyon',
  'jungle_jump',
] as const;

export type AllowedMapId = typeof ALLOWED_MAP_IDS[number];

export const ALLOWED_POWERUP_TYPES = [
  'banana_bounce',
  'mini_tornado',
  'freeze_pop',
  'wind_blast',
  'boomerang_bonk',
  'coin_magnet',
] as const;

export type AllowedPowerUpType = typeof ALLOWED_POWERUP_TYPES[number];

export type RoomState = 'LOBBY' | 'COUNTDOWN' | 'RACING' | 'FINISHED' | 'CLOSED';

export type PlayerConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTED';

export type MatchmakingState =
  | 'IDLE'
  | 'QUEUED'
  | 'MATCH_FOUND'
  | 'ROOM_CREATING'
  | 'ROOM_ASSIGNED'
  | 'CANCELLED'
  | 'FAILED';

export type MatchRegion = 'IN' | 'ASIA' | 'EU' | 'NA' | 'OTHER';

export interface PlayerNetworkState {
  playerId: string;
  displayName: string;
  avatarId: string;
  skinId?: string;
  hatId?: string;
  trailId?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  animation: string;
  grounded: boolean;
  checkpointId: number;
  finished: boolean;
  finishTimeMs?: number;
  finishPosition?: number;
  connected: boolean;
  connectionState: PlayerConnectionState;
  isReady: boolean;
  isLeader: boolean;
  lastUpdate: number;
  pingMs: number;
}

export interface NetworkInputPacket {
  left: boolean;
  right: boolean;
  jump: boolean;
  dash: boolean;
  activatePowerUp?: boolean;
  sequence: number;
  timestamp: number;
}

export interface RoomMetadata {
  roomId: string;
  mapId: string;
  mode: RoomMode;
  state: RoomState;
  leaderId: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: number;
  countdownSeconds?: number;
  raceStartTime?: number;
  region?: MatchRegion;
}

export interface PublicRoomSummary {
  roomId: string;
  mapId: string;
  mode: RoomMode;
  state: RoomState;
  playerCount: number;
  maxPlayers: number;
  region: MatchRegion;
  pingMs?: number;
}

export interface RaceResultEntry {
  playerId: string;
  displayName: string;
  avatarId: string;
  position: number;
  finishTimeMs: number;
  checkpointProgress: number;
  finished: boolean;
}

export interface QueuePartyMemberInfo {
  playerId: string;
  displayName: string;
  avatarId: string;
  skinId?: string;
  hatId?: string;
  trailId?: string;
}

// Discriminant Client-to-Server Message Protocol
export type ClientMessage =
  | { type: 'CLIENT_HELLO'; playerId?: string; displayName?: string; avatarId?: string; reconnectToken?: string }
  | { type: 'JOIN_ROOM'; roomId?: string; playerId?: string; displayName?: string; avatarId?: string; skinId?: string; hatId?: string; trailId?: string; mapId?: string; mode?: RoomMode | string }
  | { type: 'LEAVE_ROOM'; roomId?: string; playerId?: string }
  | { type: 'PLAYER_READY'; roomId?: string; playerId?: string; isReady: boolean }
  | { type: 'START_REQUEST'; roomId?: string; playerId?: string }
  | { type: 'INPUT'; roomId?: string; playerId?: string; input: NetworkInputPacket }
  | { type: 'PLAYER_STATE'; roomId?: string; playerId?: string; state: Partial<PlayerNetworkState> }
  | { type: 'CHECKPOINT'; roomId?: string; playerId?: string; checkpointId: number; timestamp: number }
  | { type: 'PLAYER_FINISHED'; roomId?: string; playerId?: string; finishTimeMs: number }
  | { type: 'ACTIVATE_POWERUP'; roomId?: string; playerId?: string; powerUpId: AllowedPowerUpType }
  | { type: 'QUEUE_JOIN'; mode?: RoomMode | string; mapPreference?: string; region?: MatchRegion; partyMembers?: QueuePartyMemberInfo[]; skinId?: string; hatId?: string; trailId?: string }
  | { type: 'QUEUE_LEAVE' }
  | { type: 'ROOM_LIST_REQUEST' }
  | { type: 'PING'; timestamp: number };

// Discriminant Server-to-Client Message Protocol
export type ServerMessage =
  | { type: 'SERVER_HELLO'; playerId: string; serverTime: number; reconnectToken: string }
  | { type: 'ROOM_JOINED'; room: RoomMetadata; players: PlayerNetworkState[]; localPlayerId: string }
  | { type: 'PLAYER_JOINED'; player: PlayerNetworkState; playerCount: number }
  | { type: 'PLAYER_LEFT'; playerId: string; newLeaderId?: string; playerCount: number }
  | { type: 'PLAYER_STATE_UPDATED'; playerId: string; isReady?: boolean; connectionState?: PlayerConnectionState }
  | { type: 'COUNTDOWN'; countdownSeconds: number; startTimestamp: number }
  | { type: 'RACE_START'; raceStartTime: number; mapId: string }
  | { type: 'WORLD_SNAPSHOT'; timestamp: number; players: Record<string, PlayerNetworkState> }
  | { type: 'CHECKPOINT_BROADCAST'; playerId: string; checkpointId: number; serverTime: number }
  | { type: 'PLAYER_FINISHED_BROADCAST'; playerId: string; position: number; finishTimeMs: number }
  | { type: 'RACE_FINISHED_BROADCAST'; results: RaceResultEntry[] }
  | { type: 'POWERUP_EVENT'; sourcePlayerId: string; powerUpId: AllowedPowerUpType; effect: string; timestamp: number }
  | { type: 'ROOM_STATE_CHANGED'; state: RoomState; metadata: RoomMetadata }
  | { type: 'QUEUE_STATUS'; status: MatchmakingState; ticketId?: string; queueTimeMs?: number; estimatedWaitMs?: number; playersInQueue?: number; mmrRange?: [number, number]; region?: MatchRegion }
  | { type: 'MATCH_SEARCHING'; ticketId: string; playersFound: number; maxPlayers: number; estimatedWaitSeconds: number; mmr: number; region: MatchRegion }
  | { type: 'MATCH_FOUND'; matchId: string; roomId: string; mapId: string; mode: string; players: { playerId: string; displayName: string; avatarId: string }[]; countdownSeconds: number }
  | { type: 'MATCH_CANCELLED'; reason: string }
  | { type: 'MATCH_FAILED'; reason: string }
  | { type: 'ROOM_LIST'; rooms: PublicRoomSummary[] }
  | { type: 'PONG'; clientTimestamp: number; serverTime: number }
  | { type: 'ERROR'; code: string; message: string };

export interface INetworkTransport {
  isConnected: boolean;
  connect(url: string): Promise<boolean>;
  disconnect(): void;
  send(message: ClientMessage): void;
  onMessage(callback: (message: ServerMessage) => void): () => void;
  onStatusChange(callback: (status: 'connected' | 'disconnected' | 'error', error?: string) => void): () => void;
}
