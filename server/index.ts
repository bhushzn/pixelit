import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { RaceRoom, ConnectedClient } from "./rooms/RaceRoom";
import { SERVER_CONFIG } from "./config/serverConfig";
import { ClientMessage, ServerMessage, ALLOWED_MAP_IDS } from "./types/network";
import { MatchmakingService } from "./matchmaking/MatchmakingService";

const app = express();
app.use(express.json());

export const rooms: Map<string, RaceRoom> = new Map();
export const matchmakingService = new MatchmakingService(rooms);

// HTTP Health check & status
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "pixel-rush-multiplayer",
    phase: 10,
    activeRooms: rooms.size,
    queuedPlayers: matchmakingService.queue.totalPlayers(),
    timestamp: Date.now(),
  });
});

app.get("/rooms", (req, res) => {
  const roomList = matchmakingService.getPublicRoomSummaries();
  res.status(200).json({ rooms: roomList });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  let boundPlayerId: string | null = null;
  let boundRoomId: string | null = null;

  const clientSender: ConnectedClient = {
    playerId: "",
    send: (msg: ServerMessage) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
      }
    },
    close: () => ws.close(),
  };

  ws.on("message", (raw: string) => {
    try {
      const msg = JSON.parse(raw.toString()) as ClientMessage;

      switch (msg.type) {
        case "CLIENT_HELLO": {
          boundPlayerId = msg.playerId || "runner-" + Math.random().toString(36).slice(2, 7);
          clientSender.playerId = boundPlayerId;
          clientSender.send({
            type: "SERVER_HELLO",
            playerId: boundPlayerId,
            serverTime: Date.now(),
            reconnectToken: "token-" + boundPlayerId + "-" + Date.now(),
          });
          break;
        }

        case "QUEUE_JOIN": {
          const playerId = boundPlayerId || "runner-" + Math.random().toString(36).slice(2, 7);
          boundPlayerId = playerId;
          clientSender.playerId = playerId;

          const joinResult = matchmakingService.joinQueue(clientSender, {
            playerId,
            mode: msg.mode,
            mapPreference: msg.mapPreference,
            region: msg.region,
            partyMembers: msg.partyMembers,
          });

          if (!joinResult.success) {
            clientSender.send({
              type: "ERROR",
              code: "QUEUE_JOIN_FAILED",
              message: joinResult.error || "Failed to join matchmaking queue.",
            });
          }
          break;
        }

        case "QUEUE_LEAVE": {
          if (boundPlayerId) {
            matchmakingService.leaveQueue(boundPlayerId);
          }
          break;
        }

        case "ROOM_LIST_REQUEST": {
          const roomSummaries = matchmakingService.getPublicRoomSummaries();
          clientSender.send({
            type: "ROOM_LIST",
            rooms: roomSummaries,
          });
          break;
        }

        case "JOIN_ROOM": {
          const roomId = msg.roomId || "room-default";
          const playerId = msg.playerId || boundPlayerId || "runner-anon";
          boundPlayerId = playerId;
          boundRoomId = roomId;
          clientSender.playerId = playerId;

          let room = rooms.get(roomId);
          if (!room) {
            const mapId = msg.mapId && ALLOWED_MAP_IDS.includes(msg.mapId as any) ? msg.mapId : "cloud_climb";
            room = new RaceRoom(roomId, mapId, msg.mode || "quick_race", playerId);
            rooms.set(roomId, room);
          }

          const joinResult = room.addPlayer(clientSender, msg.displayName || "Runner", msg.avatarId || "pip");
          if (!joinResult.success) {
            clientSender.send({
              type: "ERROR",
              code: "JOIN_FAILED",
              message: joinResult.error || "Failed to join room.",
            });
          }
          break;
        }

        case "PLAYER_READY": {
          if (!boundRoomId || !boundPlayerId) return;
          const room = rooms.get(boundRoomId);
          if (room) {
            room.setPlayerReady(boundPlayerId, msg.isReady);
          }
          break;
        }

        case "START_REQUEST": {
          if (!boundRoomId || !boundPlayerId) return;
          const room = rooms.get(boundRoomId);
          if (room) {
            const res = room.requestStartRace(boundPlayerId);
            if (!res.success) {
              clientSender.send({
                type: "ERROR",
                code: "START_FAILED",
                message: res.error || "Failed to start race.",
              });
            }
          }
          break;
        }

        case "PLAYER_STATE": {
          if (!boundRoomId || !boundPlayerId) return;
          const room = rooms.get(boundRoomId);
          if (room && msg.state) {
            room.handlePlayerState(boundPlayerId, msg.state);
          }
          break;
        }

        case "CHECKPOINT": {
          if (!boundRoomId || !boundPlayerId) return;
          const room = rooms.get(boundRoomId);
          if (room) {
            room.handleCheckpoint(boundPlayerId, msg.checkpointId, msg.timestamp);
          }
          break;
        }

        case "PLAYER_FINISHED": {
          if (!boundRoomId || !boundPlayerId) return;
          const room = rooms.get(boundRoomId);
          if (room) {
            room.handlePlayerFinish(boundPlayerId, msg.finishTimeMs);
          }
          break;
        }

        case "ACTIVATE_POWERUP": {
          if (!boundRoomId || !boundPlayerId) return;
          const room = rooms.get(boundRoomId);
          if (room) {
            room.handlePowerUp(boundPlayerId, msg.powerUpId);
          }
          break;
        }

        case "LEAVE_ROOM": {
          if (boundRoomId && boundPlayerId) {
            const room = rooms.get(boundRoomId);
            if (room) {
              room.removePlayer(boundPlayerId, "client_leave");
              if (room.players.size === 0) {
                rooms.delete(boundRoomId);
              }
            }
            boundRoomId = null;
          }
          break;
        }

        case "PING": {
          clientSender.send({
            type: "PONG",
            clientTimestamp: msg.timestamp,
            serverTime: Date.now(),
          });
          break;
        }
      }
    } catch (e: any) {
      clientSender.send({
        type: "ERROR",
        code: "MALFORMED_PACKET",
        message: "Invalid packet structure received.",
      });
    }
  });

  ws.on("close", () => {
    if (boundPlayerId) {
      matchmakingService.handleDisconnect(boundPlayerId);
    }
    if (boundRoomId && boundPlayerId) {
      const room = rooms.get(boundRoomId);
      if (room) {
        room.handleDisconnect(boundPlayerId);
        if (room.players.size === 0) {
          rooms.delete(boundRoomId);
        }
      }
    }
  });
});

export function startServer(port: number = SERVER_CONFIG.PORT): Promise<http.Server> {
  return new Promise((resolve) => {
    matchmakingService.startLoop();
    server.listen(port, () => {
      console.log(`[PixelRush Server] Running on http://localhost:${port}`);
      resolve(server);
    });
  });
}

export function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    matchmakingService.stopLoop();
    wss.close(() => {
      server.close(() => resolve());
    });
  });
}

if (process.argv[1] && process.argv[1].includes("server")) {
  startServer();
}
