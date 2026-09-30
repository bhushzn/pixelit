/**
 * Pixel Rush Authoritative Matchmaking Service
 * Orchestrates player queues, background matchmaking ticks, and room assignments.
 */

import { MatchmakingQueue } from "./MatchmakingQueue";
import { Matchmaker } from "./Matchmaker";
import {
  QueueEntry,
  QueuePartyMember,
  MATCHMAKING_CONFIG,
} from "./MatchmakingTypes";
import {
  RoomMode,
  AllowedMapId,
  MatchRegion,
  PublicRoomSummary,
  ALLOWED_MAP_IDS,
} from "../types/network";
import { RaceRoom, ConnectedClient } from "../rooms/RaceRoom";

export class MatchmakingService {
  public queue: MatchmakingQueue = new MatchmakingQueue();
  private rooms: Map<string, RaceRoom>;
  private tickInterval: any = null;

  constructor(rooms: Map<string, RaceRoom>) {
    this.rooms = rooms;
    this.startLoop();
  }

  public startLoop(): void {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => {
      this.tick();
    }, MATCHMAKING_CONFIG.TICK_INTERVAL_MS);
  }

  public stopLoop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  public joinQueue(
    client: ConnectedClient,
    options: {
      playerId: string;
      displayName?: string;
      avatarId?: string;
      mode?: RoomMode | string;
      mapPreference?: string;
      region?: MatchRegion;
      partyMembers?: { playerId: string; displayName: string; avatarId: string }[];
    }
  ): { success: boolean; error?: string; ticketId?: string } {
    const leaderId = options.playerId;
    const mode = (options.mode || "quick_race") as RoomMode;
    const region = options.region || MATCHMAKING_CONFIG.DEFAULT_REGION;

    // Validate Map Preference if provided
    let mapPref: AllowedMapId | undefined;
    if (options.mapPreference) {
      if (ALLOWED_MAP_IDS.includes(options.mapPreference as AllowedMapId)) {
        mapPref = options.mapPreference as AllowedMapId;
      } else {
        return { success: false, error: "Invalid map preference requested." };
      }
    }

    // Validate party members
    const members: QueuePartyMember[] = [];
    if (options.partyMembers && options.partyMembers.length > 0) {
      for (const m of options.partyMembers) {
        members.push({
          playerId: m.playerId,
          displayName: m.displayName || "Runner",
          avatarId: m.avatarId || "pip",
          mmr: MATCHMAKING_CONFIG.DEFAULT_MMR,
        });
      }
    } else {
      members.push({
        playerId: leaderId,
        displayName: options.displayName || "Runner",
        avatarId: options.avatarId || "pip",
        mmr: MATCHMAKING_CONFIG.DEFAULT_MMR,
      });
    }

    if (members.length > MATCHMAKING_CONFIG.MAX_PLAYERS) {
      return { success: false, error: "Party exceeds maximum match size of 4 players." };
    }

    const ticketId = `ticket-${Date.now()}-${leaderId.slice(0, 5)}`;
    const entry: QueueEntry = {
      ticketId,
      leaderId,
      members,
      mode,
      mapPreference: mapPref,
      region,
      averageMmr: MATCHMAKING_CONFIG.DEFAULT_MMR,
      queuedAt: Date.now(),
      status: "QUEUED",
      client,
    };

    const addRes = this.queue.addEntry(entry);
    if (!addRes.success) {
      return addRes;
    }

    // Notify client of immediate QUEUED status
    client.send({
      type: "QUEUE_STATUS",
      status: "QUEUED",
      ticketId,
      queueTimeMs: 0,
      estimatedWaitMs: 3000,
      playersInQueue: this.queue.totalPlayers(),
      region,
      mmrRange: [
        MATCHMAKING_CONFIG.DEFAULT_MMR - MATCHMAKING_CONFIG.INITIAL_MMR_WINDOW,
        MATCHMAKING_CONFIG.DEFAULT_MMR + MATCHMAKING_CONFIG.INITIAL_MMR_WINDOW,
      ],
    });

    client.send({
      type: "MATCH_SEARCHING",
      ticketId,
      playersFound: members.length,
      maxPlayers: MATCHMAKING_CONFIG.MAX_PLAYERS,
      estimatedWaitSeconds: 3,
      mmr: MATCHMAKING_CONFIG.DEFAULT_MMR,
      region,
    });

    return { success: true, ticketId };
  }

  public leaveQueue(playerId: string): { success: boolean; reason?: string } {
    const entry = this.queue.removeByPlayerId(playerId);
    if (!entry) {
      return { success: false, reason: "Player was not in matchmaking queue." };
    }

    entry.status = "CANCELLED";
    entry.client.send({
      type: "MATCH_CANCELLED",
      reason: "Matchmaking cancelled by player.",
    });

    return { success: true };
  }

  public handleDisconnect(playerId: string): void {
    this.queue.removeByPlayerId(playerId);
  }

  public tick(now: number = Date.now()): void {
    const allEntries = this.queue.getAllEntries();
    if (allEntries.length === 0) return;

    // 1. Send periodic searching progress update to each waiting ticket
    for (const entry of allEntries) {
      const waitMs = now - entry.queuedAt;
      const mmrWindow = Matchmaker.getMmrWindow(entry.queuedAt, now);

      entry.client.send({
        type: "QUEUE_STATUS",
        status: "QUEUED",
        ticketId: entry.ticketId,
        queueTimeMs: waitMs,
        estimatedWaitMs: Math.max(1000, 5000 - waitMs),
        playersInQueue: this.queue.totalPlayers(),
        region: entry.region,
        mmrRange: [entry.averageMmr - mmrWindow, entry.averageMmr + mmrWindow],
      });
    }

    // 2. Find compatible matches
    const matches = Matchmaker.findMatches(allEntries, now);

    for (const match of matches) {
      // Create new RaceRoom
      const roomId = `room-${match.matchId}`;
      const leaderId = match.entries[0].leaderId;
      const room = new RaceRoom(roomId, match.mapId, match.mode, leaderId);
      this.rooms.set(roomId, room);

      // Collect matched player summaries
      const playerSummaries: { playerId: string; displayName: string; avatarId: string }[] = [];
      for (const entry of match.entries) {
        for (const m of entry.members) {
          playerSummaries.push({
            playerId: m.playerId,
            displayName: m.displayName,
            avatarId: m.avatarId,
          });
        }
      }

      // Add each player to room and dispatch MATCH_FOUND
      for (const entry of match.entries) {
        this.queue.removeByTicketId(entry.ticketId);
        entry.status = "ROOM_ASSIGNED";
        entry.assignedRoomId = roomId;

        entry.client.send({
          type: "MATCH_FOUND",
          matchId: match.matchId,
          roomId,
          mapId: match.mapId,
          mode: match.mode,
          players: playerSummaries,
          countdownSeconds: MATCHMAKING_CONFIG.MATCH_COUNTDOWN_SECONDS,
        });

        // Automatically join player and all party members to room
        for (const member of entry.members) {
          const memberClient: ConnectedClient = {
            playerId: member.playerId,
            send: (msg) => entry.client.send(msg),
            close: entry.client.close,
          };
          room.addPlayer(memberClient, member.displayName, member.avatarId);
        }
      }
    }
  }

  public getPublicRoomSummaries(): PublicRoomSummary[] {
    const summaries: PublicRoomSummary[] = [];
    for (const room of this.rooms.values()) {
      const meta = room.getMetadata();
      if (meta.state === "LOBBY" || meta.state === "COUNTDOWN") {
        summaries.push({
          roomId: meta.roomId,
          mapId: meta.mapId,
          mode: meta.mode,
          state: meta.state,
          playerCount: meta.playerCount,
          maxPlayers: meta.maxPlayers,
          region: "IN",
          pingMs: 25,
        });
      }
    }
    return summaries;
  }
}
