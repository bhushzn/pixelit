/**
 * Pixel Rush Real-Time Multiplayer Networking Architecture
 * Maximum Capacities:
 *   - Random Matchmaking: 4 players
 *   - Party Match: 4 players
 *   - Custom Room: 6 players
 */

export type RoomMode = 'random_match' | 'party_room' | 'custom_room';

export const MAX_PLAYERS_CONFIG = {
  random_match: 4,
  party_room: 4,
  custom_room: 6,
} as const;

export interface InputState {
  sequence: number;
  timestamp: number;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  dash: boolean;
}

export interface PlayerState {
  playerId: string;
  displayName: string;
  characterSkin: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facing: 'left' | 'right';
  state: 'idle' | 'running' | 'jumping' | 'falling' | 'hit' | 'respawning' | 'finished';
  coins: number;
  checkpointId: number;
  progressPercent: number;
  finishTimeMs?: number;
  pingMs: number;
}

export type MatchStatus = 'waiting' | 'countdown' | 'in_progress' | 'finished';

export interface MatchState {
  matchId: string;
  mapId: string;
  mode: RoomMode;
  status: MatchStatus;
  startTime: number;
  elapsedMs: number;
  players: Record<string, PlayerState>;
  leaderboard: string[]; // Ordered list of playerIds by race position
}

export interface GameRoom {
  roomId: string;
  roomCode?: string; // 6-character code for custom rooms (e.g. SKY420)
  mode: RoomMode;
  hostPlayerId: string;
  maxPlayers: number;
  isPrivate: boolean;
  mapId: string;
  players: Array<{
    id: string;
    name: string;
    isReady: boolean;
    isHost: boolean;
  }>;
}

// Client to Server Messages
export type ClientMessage =
  | { type: 'join_queue'; mode: RoomMode; mapId?: string }
  | { type: 'join_room'; roomCode: string }
  | { type: 'create_custom_room'; mapId: string; isPrivate: boolean }
  | { type: 'set_ready'; isReady: boolean }
  | { type: 'player_input'; input: InputState }
  | { type: 'activate_powerup'; powerUpId: string }
  | { type: 'leave_room' };

// Server to Client Messages
export type ServerMessage =
  | { type: 'room_joined'; room: GameRoom; localPlayerId: string }
  | { type: 'match_countdown'; startTimestamp: number; countdownSeconds: number }
  | { type: 'match_start'; match: MatchState }
  | { type: 'world_snapshot'; timestamp: number; players: Record<string, PlayerState> }
  | { type: 'player_finished'; playerId: string; position: number; finishTimeMs: number }
  | { type: 'match_end'; finalResults: Array<{ playerId: string; position: number; timeMs: number }> }
  | { type: 'error'; message: string };

export interface NetworkClient {
  isConnected: boolean;
  connect(serverUrl: string): Promise<boolean>;
  disconnect(): void;
  send(message: ClientMessage): void;
  onMessage(callback: (message: ServerMessage) => void): () => void;
}
