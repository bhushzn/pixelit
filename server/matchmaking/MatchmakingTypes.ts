/**
 * Pixel Rush Server-Authoritative Matchmaking Types (Phase 10)
 */

import {
  MatchmakingState,
  MatchRegion,
  RoomMode,
  AllowedMapId,
  MAX_PLAYERS_PER_ROOM,
} from "../types/network";
import { ConnectedClient } from "../rooms/RaceRoom";

export interface QueuePartyMember {
  playerId: string;
  displayName: string;
  avatarId: string;
  mmr: number;
}

export interface QueueEntry {
  ticketId: string;
  leaderId: string;
  members: QueuePartyMember[];
  mode: RoomMode;
  mapPreference?: AllowedMapId;
  region: MatchRegion;
  averageMmr: number;
  queuedAt: number;
  status: MatchmakingState;
  assignedRoomId?: string;
  client: ConnectedClient;
}

export interface MatchCandidate {
  matchId: string;
  entries: QueueEntry[];
  totalPlayers: number;
  mode: RoomMode;
  mapId: AllowedMapId;
  region: MatchRegion;
  averageMmr: number;
}

export const MATCHMAKING_CONFIG = {
  DEFAULT_MMR: 1000,
  INITIAL_MMR_WINDOW: 100,      // 0 - 5s
  STAGE_1_WINDOW: 200,          // 5 - 15s
  STAGE_2_WINDOW: 400,          // 15 - 30s
  STAGE_3_WINDOW: 1000,         // 30s+
  STAGE_1_TIME_MS: 5000,
  STAGE_2_TIME_MS: 15000,
  STAGE_3_TIME_MS: 30000,
  MAX_QUEUE_WAIT_MS: 45000,     // 45s fallback/timeout
  TICK_INTERVAL_MS: 1000,       // 1Hz matchmaking loop
  MATCH_COUNTDOWN_SECONDS: 3,
  MAX_PLAYERS: MAX_PLAYERS_PER_ROOM,
  DEFAULT_REGION: 'IN' as MatchRegion,
} as const;
