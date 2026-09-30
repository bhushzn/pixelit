import {
  MAX_PLAYERS_PER_ROOM,
  ALLOWED_MAP_IDS,
  ALLOWED_POWERUP_TYPES,
} from "../types/network";

export const SERVER_CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  TICK_RATE_HZ: 20, // 20 updates per second for race world snapshots
  TICK_INTERVAL_MS: 50,
  COUNTDOWN_SECONDS: 3,
  DISCONNECT_TIMEOUT_MS: 15000, // 15s timeout before removing disconnected player
  PING_INTERVAL_MS: 5000,
  MAX_PLAYERS: MAX_PLAYERS_PER_ROOM,
  ALLOWED_MAPS: ALLOWED_MAP_IDS,
  ALLOWED_POWERUPS: ALLOWED_POWERUP_TYPES,
} as const;
