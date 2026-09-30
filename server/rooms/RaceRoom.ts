import {
  RoomMetadata,
  RoomState,
  PlayerNetworkState,
  ServerMessage,
  RaceResultEntry,
  AllowedMapId,
  AllowedPowerUpType,
  MAX_PLAYERS_PER_ROOM,
  ALLOWED_MAP_IDS,
  ALLOWED_POWERUP_TYPES,
} from "../types/network";
import { SERVER_CONFIG } from "../config/serverConfig";

export interface ConnectedClient {
  playerId: string;
  send: (msg: ServerMessage) => void;
  close?: () => void;
}

export class RaceRoom {
  public roomId: string;
  public mapId: AllowedMapId;
  public mode: string;
  public state: RoomState = "LOBBY";
  public leaderId: string;
  public players: Map<string, PlayerNetworkState> = new Map();
  public clients: Map<string, ConnectedClient> = new Map();
  public results: RaceResultEntry[] = [];
  public createdAt = Date.now();
  public countdownTimer: any = null;
  public tickTimer: any = null;
  public disconnectTimers: Map<string, any> = new Map();
  public raceStartTime = 0;

  // Checkpoint map definition data (valid checkpoint IDs)
  private mapCheckpoints: Map<string, number[]> = new Map([
    ["cloud_climb", [1]],
    ["sky_bridge", [1]],
    ["candy_canyon", [1]],
    ["jungle_jump", [1]],
  ]);

  constructor(roomId: string, mapId: string = "cloud_climb", mode: string = "quick_race", leaderId: string = "") {
    this.roomId = roomId;
    this.mapId = (ALLOWED_MAP_IDS.includes(mapId as AllowedMapId) ? mapId : "cloud_climb") as AllowedMapId;
    this.mode = mode;
    this.leaderId = leaderId;
  }

  public getMetadata(): RoomMetadata {
    return {
      roomId: this.roomId,
      mapId: this.mapId,
      mode: this.mode as any,
      state: this.state,
      leaderId: this.leaderId,
      playerCount: this.players.size,
      maxPlayers: MAX_PLAYERS_PER_ROOM,
      createdAt: this.createdAt,
      raceStartTime: this.raceStartTime,
    };
  }

  public addPlayer(
    client: ConnectedClient,
    displayName: string,
    avatarId: string = "pip",
    cosmetics?: { skinId?: string; hatId?: string; trailId?: string }
  ): { success: boolean; error?: string; player?: PlayerNetworkState } {
    if (this.state !== "LOBBY") {
      return { success: false, error: "Cannot join room: Race is already in progress or finished." };
    }

    if (this.players.size >= MAX_PLAYERS_PER_ROOM) {
      return { success: false, error: "ROOM_FULL: Maximum 4 players capacity reached." };
    }

    const playerId = client.playerId;
    const isFirstPlayer = this.players.size === 0;

    if (isFirstPlayer && !this.leaderId) {
      this.leaderId = playerId;
    }

    const isLeader = playerId === this.leaderId;

    const newPlayer: PlayerNetworkState = {
      playerId,
      displayName: displayName || "Runner-" + playerId.slice(0, 4),
      avatarId: avatarId || "pip",
      skinId: cosmetics?.skinId || "classic_runner",
      hatId: cosmetics?.hatId || "none_hat",
      trailId: cosmetics?.trailId || "none_trail",
      x: 100 + this.players.size * 50,
      y: 540,
      vx: 0,
      vy: 0,
      facing: "right",
      animation: "idle",
      grounded: true,
      checkpointId: 0,
      finished: false,
      connected: true,
      connectionState: "CONNECTED",
      isReady: isLeader, // Leader is ready by default
      isLeader,
      lastUpdate: Date.now(),
      pingMs: 0,
    };

    this.players.set(playerId, newPlayer);
    this.clients.set(playerId, client);

    // Cancel any pending disconnect timer if reconnecting
    if (this.disconnectTimers.has(playerId)) {
      clearTimeout(this.disconnectTimers.get(playerId));
      this.disconnectTimers.delete(playerId);
    }

    // Send ROOM_JOINED to new client
    client.send({
      type: "ROOM_JOINED",
      room: this.getMetadata(),
      players: Array.from(this.players.values()),
      localPlayerId: playerId,
    });

    // Broadcast to others
    this.broadcast(
      {
        type: "PLAYER_JOINED",
        player: newPlayer,
        playerCount: this.players.size,
      },
      playerId
    );

    return { success: true, player: newPlayer };
  }

  public removePlayer(playerId: string, reason: string = "left"): void {
    if (!this.players.has(playerId)) return;

    this.players.delete(playerId);
    this.clients.delete(playerId);

    if (this.disconnectTimers.has(playerId)) {
      clearTimeout(this.disconnectTimers.get(playerId));
      this.disconnectTimers.delete(playerId);
    }

    // Reassign leader if leader left
    let newLeaderId: string | undefined;
    if (this.leaderId === playerId && this.players.size > 0) {
      const nextPlayer = this.players.values().next().value;
      if (nextPlayer) {
        this.leaderId = nextPlayer.playerId;
        nextPlayer.isLeader = true;
        nextPlayer.isReady = true;
        newLeaderId = this.leaderId;
      }
    }

    this.broadcast({
      type: "PLAYER_LEFT",
      playerId,
      newLeaderId,
      playerCount: this.players.size,
    });

    if (this.players.size === 0) {
      this.close();
    }
  }

  public handleDisconnect(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.connected = false;
    player.connectionState = "DISCONNECTED";
    this.clients.delete(playerId);

    this.broadcast({
      type: "PLAYER_STATE_UPDATED",
      playerId,
      connectionState: "DISCONNECTED",
    });

    // Start disconnect timeout
    const timer = setTimeout(() => {
      this.removePlayer(playerId, "timeout");
    }, SERVER_CONFIG.DISCONNECT_TIMEOUT_MS);

    this.disconnectTimers.set(playerId, timer);
  }

  public setPlayerReady(playerId: string, isReady: boolean): { success: boolean; error?: string } {
    if (this.state !== "LOBBY") {
      return { success: false, error: "Cannot change ready state during race." };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: "Player not found in room." };
    }

    player.isReady = isReady;

    this.broadcast({
      type: "PLAYER_STATE_UPDATED",
      playerId,
      isReady,
    });

    return { success: true };
  }

  public requestStartRace(callerId: string): { success: boolean; error?: string } {
    if (this.state !== "LOBBY") {
      return { success: false, error: "Race is already started or closed." };
    }

    if (this.leaderId !== callerId) {
      return { success: false, error: "Only the party leader can start the race." };
    }

    // Verify all players are ready
    for (const player of this.players.values()) {
      if (!player.isReady) {
        return { success: false, error: `Cannot start race: ${player.displayName} is not ready.` };
      }
    }

    this.startCountdown();
    return { success: true };
  }

  private startCountdown(): void {
    this.state = "COUNTDOWN";
    let countdown = SERVER_CONFIG.COUNTDOWN_SECONDS;

    this.broadcast({
      type: "ROOM_STATE_CHANGED",
      state: "COUNTDOWN",
      metadata: this.getMetadata(),
    });

    this.broadcast({
      type: "COUNTDOWN",
      countdownSeconds: countdown,
      startTimestamp: Date.now(),
    });

    this.countdownTimer = setInterval(() => {
      countdown -= 1;
      if (countdown > 0) {
        this.broadcast({
          type: "COUNTDOWN",
          countdownSeconds: countdown,
          startTimestamp: Date.now(),
        });
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.startRacing();
      }
    }, 1000);
  }

  private startRacing(): void {
    this.state = "RACING";
    this.raceStartTime = Date.now();

    this.broadcast({
      type: "ROOM_STATE_CHANGED",
      state: "RACING",
      metadata: this.getMetadata(),
    });

    this.broadcast({
      type: "RACE_START",
      raceStartTime: this.raceStartTime,
      mapId: this.mapId,
    });

    this.startTickLoop();
  }

  private startTickLoop(): void {
    this.stopTickLoop();
    this.tickTimer = setInterval(() => {
      if (this.state !== "RACING") return;

      const playerMap: Record<string, PlayerNetworkState> = {};
      for (const [id, state] of this.players.entries()) {
        playerMap[id] = { ...state };
      }

      this.broadcast({
        type: "WORLD_SNAPSHOT",
        timestamp: Date.now(),
        players: playerMap,
      });
    }, SERVER_CONFIG.TICK_INTERVAL_MS);
  }

  private stopTickLoop(): void {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  public handlePlayerState(playerId: string, stateUpdate: Partial<PlayerNetworkState>): void {
    const player = this.players.get(playerId);
    if (!player || this.state !== "RACING") return;

    if (typeof stateUpdate.x === "number") player.x = stateUpdate.x;
    if (typeof stateUpdate.y === "number") player.y = stateUpdate.y;
    if (typeof stateUpdate.vx === "number") player.vx = stateUpdate.vx;
    if (typeof stateUpdate.vy === "number") player.vy = stateUpdate.vy;
    if (stateUpdate.facing) player.facing = stateUpdate.facing;
    if (stateUpdate.animation) player.animation = stateUpdate.animation;
    if (typeof stateUpdate.grounded === "boolean") player.grounded = stateUpdate.grounded;
    player.lastUpdate = Date.now();
  }

  public handleCheckpoint(playerId: string, checkpointId: number, timestamp: number): { success: boolean; error?: string } {
    if (this.state !== "RACING") {
      return { success: false, error: "Checkpoint events only valid in RACING state." };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    const validCheckpoints = this.mapCheckpoints.get(this.mapId) || [1];
    if (!validCheckpoints.includes(checkpointId)) {
      return { success: false, error: "Invalid checkpoint ID for current map." };
    }

    if (checkpointId <= player.checkpointId) {
      return { success: false, error: "Duplicate or regressive checkpoint progression." };
    }

    player.checkpointId = checkpointId;

    this.broadcast({
      type: "CHECKPOINT_BROADCAST",
      playerId,
      checkpointId,
      serverTime: Date.now(),
    });

    return { success: true };
  }

  public handlePlayerFinish(playerId: string, finishTimeMs: number): { success: boolean; error?: string; position?: number } {
    if (this.state !== "RACING") {
      return { success: false, error: "Finish events only valid in RACING state." };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    if (player.finished) {
      return { success: false, error: "Player already finished." };
    }

    const position = this.results.length + 1;
    player.finished = true;
    player.finishPosition = position;
    player.finishTimeMs = finishTimeMs > 0 ? finishTimeMs : Date.now() - this.raceStartTime;

    const resultEntry: RaceResultEntry = {
      playerId,
      displayName: player.displayName,
      avatarId: player.avatarId,
      position,
      finishTimeMs: player.finishTimeMs,
      checkpointProgress: player.checkpointId,
      finished: true,
    };

    this.results.push(resultEntry);

    this.broadcast({
      type: "PLAYER_FINISHED_BROADCAST",
      playerId,
      position,
      finishTimeMs: player.finishTimeMs,
    });

    // Check if all active connected players finished
    let allFinished = true;
    for (const p of this.players.values()) {
      if (p.connected && !p.finished) {
        allFinished = false;
        break;
      }
    }

    if (allFinished) {
      this.finishRace();
    }

    return { success: true, position };
  }

  public handlePowerUp(playerId: string, powerUpId: AllowedPowerUpType): { success: boolean; error?: string } {
    if (this.state !== "RACING") {
      return { success: false, error: "Power-ups only usable in RACING state." };
    }

    if (!ALLOWED_POWERUP_TYPES.includes(powerUpId)) {
      return { success: false, error: "Invalid power-up ID." };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: "Player not found." };
    }

    this.broadcast({
      type: "POWERUP_EVENT",
      sourcePlayerId: playerId,
      powerUpId,
      effect: `${player.displayName} used ${powerUpId}`,
      timestamp: Date.now(),
    });

    return { success: true };
  }

  private finishRace(): void {
    this.state = "FINISHED";
    this.stopTickLoop();

    this.broadcast({
      type: "ROOM_STATE_CHANGED",
      state: "FINISHED",
      metadata: this.getMetadata(),
    });

    this.broadcast({
      type: "RACE_FINISHED_BROADCAST",
      results: this.results,
    });
  }

  public broadcast(message: ServerMessage, excludePlayerId?: string): void {
    for (const [id, client] of this.clients.entries()) {
      if (excludePlayerId && id === excludePlayerId) continue;
      try {
        client.send(message);
      } catch (err) {
        console.error(`[RaceRoom] Error broadcasting to client ${id}:`, err);
      }
    }
  }

  public close(): void {
    this.state = "CLOSED";
    this.stopTickLoop();
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectTimers.clear();
    this.clients.clear();
    this.players.clear();
  }
}
