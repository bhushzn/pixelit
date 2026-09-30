/**
 * Pixel Rush Authoritative Matchmaker Algorithm
 * Dynamic MMR search expansion, region compatibility, and party combinations.
 */

import {
  QueueEntry,
  MatchCandidate,
  MATCHMAKING_CONFIG,
} from "./MatchmakingTypes";
import { ALLOWED_MAP_IDS, AllowedMapId } from "../types/network";

export class Matchmaker {
  public static getMmrWindow(queuedAt: number, now: number = Date.now()): number {
    const waitMs = Math.max(0, now - queuedAt);
    if (waitMs < MATCHMAKING_CONFIG.STAGE_1_TIME_MS) {
      return MATCHMAKING_CONFIG.INITIAL_MMR_WINDOW;
    } else if (waitMs < MATCHMAKING_CONFIG.STAGE_2_TIME_MS) {
      return MATCHMAKING_CONFIG.STAGE_1_WINDOW;
    } else if (waitMs < MATCHMAKING_CONFIG.STAGE_3_TIME_MS) {
      return MATCHMAKING_CONFIG.STAGE_2_WINDOW;
    }
    return MATCHMAKING_CONFIG.STAGE_3_WINDOW;
  }

  public static isRegionCompatible(entryA: QueueEntry, entryB: QueueEntry, now: number = Date.now()): boolean {
    if (entryA.region === entryB.region) return true;
    const maxWait = Math.max(now - entryA.queuedAt, now - entryB.queuedAt);
    return maxWait >= MATCHMAKING_CONFIG.STAGE_2_TIME_MS; // Allow cross-region after 15s
  }

  public static isMmrCompatible(entryA: QueueEntry, entryB: QueueEntry, now: number = Date.now()): boolean {
    const windowA = this.getMmrWindow(entryA.queuedAt, now);
    const windowB = this.getMmrWindow(entryB.queuedAt, now);
    const effectiveWindow = Math.max(windowA, windowB);
    const mmrDiff = Math.abs(entryA.averageMmr - entryB.averageMmr);
    return mmrDiff <= effectiveWindow;
  }

  public static findMatches(queueEntries: QueueEntry[], now: number = Date.now()): MatchCandidate[] {
    const matchedTickets = new Set<string>();
    const matches: MatchCandidate[] = [];

    // Sort by oldest queued first (FIFO fairness)
    const sorted = [...queueEntries].sort((a, b) => a.queuedAt - b.queuedAt);

    for (let i = 0; i < sorted.length; i++) {
      const primary = sorted[i];
      if (matchedTickets.has(primary.ticketId)) continue;

      const groupEntries: QueueEntry[] = [primary];
      let currentTotalPlayers = primary.members.length;

      // Single party with 4 players creates an instant full room
      if (currentTotalPlayers === MATCHMAKING_CONFIG.MAX_PLAYERS) {
        matchedTickets.add(primary.ticketId);
        matches.push(this.createMatchCandidate(groupEntries, now));
        continue;
      }

      // Search for compatible entries to fill up to 4 players
      for (let j = 0; j < sorted.length; j++) {
        if (i === j) continue;
        const candidate = sorted[j];
        if (matchedTickets.has(candidate.ticketId)) continue;
        if (candidate.mode !== primary.mode) continue;

        if (currentTotalPlayers + candidate.members.length > MATCHMAKING_CONFIG.MAX_PLAYERS) {
          continue;
        }

        const regionOk = this.isRegionCompatible(primary, candidate, now);
        const mmrOk = this.isMmrCompatible(primary, candidate, now);

        if (regionOk && mmrOk) {
          groupEntries.push(candidate);
          currentTotalPlayers += candidate.members.length;

          if (currentTotalPlayers === MATCHMAKING_CONFIG.MAX_PLAYERS) {
            break; // Full 4-player match formed!
          }
        }
      }

      // Determine if group can start:
      // Either 4 players, or >=2 players if oldest player waited past timeout (e.g. 15s+)
      const primaryWaitMs = now - primary.queuedAt;
      const isFull = currentTotalPlayers === MATCHMAKING_CONFIG.MAX_PLAYERS;
      const isTimedOutGroup = currentTotalPlayers >= 2 && primaryWaitMs >= MATCHMAKING_CONFIG.STAGE_2_TIME_MS;
      const isSoloTimeout = currentTotalPlayers >= 1 && primaryWaitMs >= MATCHMAKING_CONFIG.MAX_QUEUE_WAIT_MS;

      if (isFull || isTimedOutGroup || isSoloTimeout) {
        for (const entry of groupEntries) {
          matchedTickets.add(entry.ticketId);
        }
        matches.push(this.createMatchCandidate(groupEntries, now));
      }
    }

    return matches;
  }

  private static createMatchCandidate(entries: QueueEntry[], now: number): MatchCandidate {
    const matchId = `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const totalPlayers = entries.reduce((sum, e) => sum + e.members.length, 0);

    // Calculate weighted average MMR
    let totalMmr = 0;
    for (const entry of entries) {
      for (const m of entry.members) {
        totalMmr += m.mmr;
      }
    }
    const averageMmr = totalPlayers > 0 ? Math.round(totalMmr / totalPlayers) : MATCHMAKING_CONFIG.DEFAULT_MMR;

    // Resolve Map: use primary's map preference if valid, else pick from list
    const preferredMap = entries.find((e) => e.mapPreference)?.mapPreference;
    let selectedMap: AllowedMapId = 'cloud_climb';
    if (preferredMap && ALLOWED_MAP_IDS.includes(preferredMap)) {
      selectedMap = preferredMap;
    } else {
      const idx = Math.floor(Math.random() * ALLOWED_MAP_IDS.length);
      selectedMap = ALLOWED_MAP_IDS[idx];
    }

    return {
      matchId,
      entries,
      totalPlayers,
      mode: entries[0].mode,
      mapId: selectedMap,
      region: entries[0].region,
      averageMmr,
    };
  }
}
