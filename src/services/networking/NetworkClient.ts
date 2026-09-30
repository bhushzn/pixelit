/**
 * Pixel Rush Real-Time Multiplayer Network Client (Phase 9 & 10)
 */

import {
  ClientMessage,
  ServerMessage,
  INetworkTransport,
  PlayerNetworkState,
  RoomMetadata,
  RaceResultEntry,
  MatchmakingState,
  MatchRegion,
  PublicRoomSummary,
  QueuePartyMemberInfo,
} from "./networkTypes";
import { RemotePlayerInterpolator } from "./NetworkInterpolation";

export class MultiplayerRaceClient implements INetworkTransport {
  private ws: WebSocket | null = null;
  private messageListeners: Set<(message: ServerMessage) => void> = new Set();
  private statusListeners: Set<(status: "connected" | "disconnected" | "error", error?: string) => void> = new Set();
  
  public isConnected = false;
  public localPlayerId = "";
  public currentRoom: RoomMetadata | null = null;
  public players: Map<string, PlayerNetworkState> = new Map();
  public remoteInterpolators: Map<string, RemotePlayerInterpolator> = new Map();
  public results: RaceResultEntry[] | null = null;
  public reconnectToken: string | null = null;
  public serverUrl = "ws://localhost:3001";
  public pingMs = 0;

  // Phase 10 Matchmaking State
  public matchmakingState: MatchmakingState = "IDLE";
  public queueTicketId: string | null = null;
  public publicRooms: PublicRoomSummary[] = [];

  private pingInterval: any = null;

  public async connect(url: string = this.serverUrl): Promise<boolean> {
    this.serverUrl = url;
    return new Promise((resolve) => {
      try {
        if (typeof WebSocket === "undefined") {
          this.notifyStatus("error", "WebSocket not supported in current environment.");
          resolve(false);
          return;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.notifyStatus("connected");
          this.startHeartbeat();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as ServerMessage;
            this.handleServerMessage(data);
          } catch (e) {
            console.error("[NetworkClient] Failed to parse server message:", e);
          }
        };

        this.ws.onerror = () => {
          this.isConnected = false;
          this.notifyStatus("error", "Multiplayer server connection error.");
          resolve(false);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.matchmakingState = "IDLE";
          this.queueTicketId = null;
          this.stopHeartbeat();
          this.notifyStatus("disconnected");
        };
      } catch (err: any) {
        this.isConnected = false;
        this.notifyStatus("error", err?.message || "Failed to initialize WebSocket.");
        resolve(false);
      }
    });
  }

  public disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.currentRoom = null;
    this.matchmakingState = "IDLE";
    this.queueTicketId = null;
    this.players.clear();
    this.remoteInterpolators.clear();
  }

  public send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  public joinQueue(options?: {
    mode?: string;
    mapPreference?: string;
    region?: MatchRegion;
    partyMembers?: QueuePartyMemberInfo[];
  }): void {
    this.matchmakingState = "QUEUED";
    this.send({
      type: "QUEUE_JOIN",
      mode: options?.mode || "quick_race",
      mapPreference: options?.mapPreference,
      region: options?.region || "IN",
      partyMembers: options?.partyMembers,
    });
  }

  public leaveQueue(): void {
    this.matchmakingState = "CANCELLED";
    this.send({
      type: "QUEUE_LEAVE",
    });
  }

  public requestRoomList(): void {
    this.send({
      type: "ROOM_LIST_REQUEST",
    });
  }

  public onMessage(callback: (message: ServerMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  public onStatusChange(callback: (status: "connected" | "disconnected" | "error", error?: string) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private notifyStatus(status: "connected" | "disconnected" | "error", error?: string): void {
    for (const listener of this.statusListeners) {
      listener(status, error);
    }
  }

  private handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case "SERVER_HELLO":
        this.localPlayerId = message.playerId;
        this.reconnectToken = message.reconnectToken;
        break;

      case "QUEUE_STATUS":
        this.matchmakingState = message.status;
        if (message.ticketId) {
          this.queueTicketId = message.ticketId;
        }
        break;

      case "MATCH_SEARCHING":
        this.matchmakingState = "QUEUED";
        this.queueTicketId = message.ticketId;
        break;

      case "MATCH_FOUND":
        this.matchmakingState = "MATCH_FOUND";
        break;

      case "MATCH_CANCELLED":
        this.matchmakingState = "CANCELLED";
        this.queueTicketId = null;
        break;

      case "MATCH_FAILED":
        this.matchmakingState = "FAILED";
        this.queueTicketId = null;
        break;

      case "ROOM_LIST":
        this.publicRooms = message.rooms;
        break;

      case "ROOM_JOINED":
        this.matchmakingState = "ROOM_ASSIGNED";
        this.currentRoom = message.room;
        this.localPlayerId = message.localPlayerId;
        this.players.clear();
        for (const p of message.players) {
          this.players.set(p.playerId, p);
          if (p.playerId !== this.localPlayerId) {
            const interp = new RemotePlayerInterpolator();
            interp.pushSnapshot(p);
            this.remoteInterpolators.set(p.playerId, interp);
          }
        }
        break;

      case "PLAYER_JOINED":
        this.players.set(message.player.playerId, message.player);
        if (message.player.playerId !== this.localPlayerId) {
          const interp = new RemotePlayerInterpolator();
          interp.pushSnapshot(message.player);
          this.remoteInterpolators.set(message.player.playerId, interp);
        }
        if (this.currentRoom) {
          this.currentRoom.playerCount = message.playerCount;
        }
        break;

      case "PLAYER_LEFT":
        this.players.delete(message.playerId);
        this.remoteInterpolators.delete(message.playerId);
        if (this.currentRoom) {
          this.currentRoom.playerCount = message.playerCount;
          if (message.newLeaderId) {
            this.currentRoom.leaderId = message.newLeaderId;
          }
        }
        break;

      case "WORLD_SNAPSHOT":
        for (const [pid, state] of Object.entries(message.players)) {
          if (pid !== this.localPlayerId) {
            let interp = this.remoteInterpolators.get(pid);
            if (!interp) {
              interp = new RemotePlayerInterpolator();
              this.remoteInterpolators.set(pid, interp);
            }
            interp.pushSnapshot(state, message.timestamp);
          }
          this.players.set(pid, state);
        }
        break;

      case "ROOM_STATE_CHANGED":
        if (this.currentRoom) {
          this.currentRoom.state = message.state;
          this.currentRoom = message.metadata;
        }
        break;

      case "RACE_FINISHED_BROADCAST":
        this.results = message.results;
        break;

      case "PONG":
        this.pingMs = Math.max(0, Date.now() - message.clientTimestamp);
        break;
    }

    for (const listener of this.messageListeners) {
      listener(message);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: "PING", timestamp: Date.now() });
      }
    }, 5000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export const networkClient = new MultiplayerRaceClient();
