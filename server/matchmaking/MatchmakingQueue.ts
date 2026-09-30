/**
 * Pixel Rush Matchmaking Queue Data Structure
 * Ensures strict duplicate prevention and atomic player reservations.
 */

import { QueueEntry } from "./MatchmakingTypes";

export class MatchmakingQueue {
  private entries: Map<string, QueueEntry> = new Map(); // ticketId -> QueueEntry
  private playerToTicketMap: Map<string, string> = new Map(); // playerId -> ticketId

  public addEntry(entry: QueueEntry): { success: boolean; error?: string } {
    // 1. Check if leader is already queued
    if (this.playerToTicketMap.has(entry.leaderId)) {
      return { success: false, error: "Player is already in matchmaking queue." };
    }

    // 2. Check if any party member is already queued
    for (const member of entry.members) {
      if (this.playerToTicketMap.has(member.playerId)) {
        return { success: false, error: `Party member ${member.displayName} is already queued.` };
      }
    }

    // 3. Register entry and reserve all player IDs
    this.entries.set(entry.ticketId, entry);
    for (const member of entry.members) {
      this.playerToTicketMap.set(member.playerId, entry.ticketId);
    }

    return { success: true };
  }

  public removeByTicketId(ticketId: string): QueueEntry | null {
    const entry = this.entries.get(ticketId);
    if (!entry) return null;

    this.entries.delete(ticketId);
    for (const member of entry.members) {
      this.playerToTicketMap.delete(member.playerId);
    }

    return entry;
  }

  public removeByPlayerId(playerId: string): QueueEntry | null {
    const ticketId = this.playerToTicketMap.get(playerId);
    if (!ticketId) return null;
    return this.removeByTicketId(ticketId);
  }

  public getEntryByPlayerId(playerId: string): QueueEntry | undefined {
    const ticketId = this.playerToTicketMap.get(playerId);
    if (!ticketId) return undefined;
    return this.entries.get(ticketId);
  }

  public getEntryByTicketId(ticketId: string): QueueEntry | undefined {
    return this.entries.get(ticketId);
  }

  public getAllEntries(): QueueEntry[] {
    return Array.from(this.entries.values());
  }

  public count(): number {
    return this.entries.size;
  }

  public totalPlayers(): number {
    let total = 0;
    for (const entry of this.entries.values()) {
      total += entry.members.length;
    }
    return total;
  }

  public clear(): void {
    this.entries.clear();
    this.playerToTicketMap.clear();
  }
}
