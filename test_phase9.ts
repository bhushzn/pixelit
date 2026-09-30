/**
 * Pixel Rush Phase 9: Real-Time Multiplayer Foundation Automated Contract Test Suite
 */

import { RaceRoom, ConnectedClient } from "./server/rooms/RaceRoom";
import { ServerMessage } from "./src/services/networking/networkTypes";
import { MAP_REGISTRY } from "./src/game/maps/mapRegistry";
import { ALLOWED_POWERUP_TYPES } from "./src/services/networking/networkTypes";
import { RemotePlayerInterpolator } from "./src/services/networking/NetworkInterpolation";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`FAIL: ${testName} - ${detail || "Assertion failed"}`);
    failCount++;
  }
}

function createMockClient(playerId: string): { client: ConnectedClient; messages: ServerMessage[] } {
  const messages: ServerMessage[] = [];
  return {
    client: {
      playerId,
      send: (msg: ServerMessage) => {
        messages.push(msg);
      },
    },
    messages,
  };
}

async function runPhase9Tests() {
  console.log("=== RUNNING PIXEL RUSH PHASE 9 MULTIPLAYER FOUNDATION TESTS ===\n");

  console.log("--- 1. Map & Power-Up Registry Verification ---");
  const expectedMaps = ["cloud_climb", "sky_bridge", "candy_canyon", "jungle_jump"];
  for (const mapId of expectedMaps) {
    const entry = MAP_REGISTRY[mapId];
    assert(!!entry && entry.isPlayable, `Map Registry: ${mapId} playable`);
  }

  const expectedPowerups = [
    "banana_bounce",
    "mini_tornado",
    "freeze_pop",
    "wind_blast",
    "boomerang_bonk",
    "coin_magnet",
  ];
  for (const pw of expectedPowerups) {
    assert(ALLOWED_POWERUP_TYPES.includes(pw as any), `Power-Up registered: ${pw}`);
  }

  console.log("\n--- 2. Race Room Lifecycle & 4-Player Capacity ---");
  const room = new RaceRoom("room-alpha", "cloud_climb", "quick_race");
  assert(room.state === "LOBBY", "Room initial state is LOBBY");
  assert(room.players.size === 0, "Room initializes with 0 players");

  // Join Player 1 (Leader)
  const p1 = createMockClient("player-1");
  const j1 = room.addPlayer(p1.client, "PixelPip", "pip");
  assert(j1.success === true, "Player 1 joins successfully");
  assert(room.leaderId === "player-1", "Player 1 is designated leader");
  assert(p1.messages.some((m) => m.type === "ROOM_JOINED"), "Player 1 received ROOM_JOINED");

  // Join Player 2
  const p2 = createMockClient("player-2");
  const j2 = room.addPlayer(p2.client, "SkyRunner", "spark");
  assert(j2.success === true, "Player 2 joins successfully");
  assert(p1.messages.some((m) => m.type === "PLAYER_JOINED" && (m as any).player.playerId === "player-2"), "Player 1 notified of Player 2");

  // Join Player 3
  const p3 = createMockClient("player-3");
  const j3 = room.addPlayer(p3.client, "CandyDash", "dash");
  assert(j3.success === true, "Player 3 joins successfully");

  // Join Player 4 (Capacity Limit)
  const p4 = createMockClient("player-4");
  const j4 = room.addPlayer(p4.client, "JungleFox", "fox");
  assert(j4.success === true, "Player 4 joins successfully");
  assert(room.players.size === 4, "Room has reached 4-player maximum capacity");

  // Attempt 5th Player (Must be strictly rejected)
  const p5 = createMockClient("player-5");
  const j5 = room.addPlayer(p5.client, "ExtraRunner", "pip");
  assert(j5.success === false, "5th player is rejected");
  assert(j5.error?.includes("ROOM_FULL") === true, "5th player receives ROOM_FULL error");
  assert(room.players.size === 4, "Room preserves strict 4-player capacity");

  console.log("\n--- 3. Ready State & Start Validation ---");
  // Non-leader attempts start -> rejected
  const nonLeaderStart = room.requestStartRace("player-2");
  assert(nonLeaderStart.success === false, "Non-leader cannot trigger start");

  // Leader attempts start before all ready -> rejected
  const prematureStart = room.requestStartRace("player-1");
  assert(prematureStart.success === false, "Start rejected when players not ready");

  // Ready all players
  room.setPlayerReady("player-2", true);
  room.setPlayerReady("player-3", true);
  room.setPlayerReady("player-4", true);

  // Leader starts race
  const validStart = room.requestStartRace("player-1");
  assert(validStart.success === true, "Leader successfully starts countdown when all ready");
  assert(room.state === "COUNTDOWN", "Room transitions to COUNTDOWN state");

  console.log("\n--- 4. Racing State, Power-Ups & Checkpoints ---");
  // Fast-forward to RACING state
  (room as any).startRacing();
  assert(room.state === "RACING", "Room state is RACING");

  // Valid power-up broadcast during racing
  const pwEvent = room.handlePowerUp("player-1", "banana_bounce");
  assert(pwEvent.success === true, "Valid power-up broadcast succeeded");

  // Invalid power-up rejected
  const invalidPw = room.handlePowerUp("player-1", "invalid_item" as any);
  assert(invalidPw.success === false, "Invalid power-up rejected");

  // Invalid checkpoint rejected
  const invalidCp = room.handleCheckpoint("player-2", 999, Date.now());
  assert(invalidCp.success === false, "Invalid checkpoint ID rejected");

  // Valid checkpoint accepted
  const validCp = room.handleCheckpoint("player-2", 1, Date.now());
  assert(validCp.success === true, "Valid checkpoint progression accepted");

  // Duplicate checkpoint progression rejected
  const dupCp = room.handleCheckpoint("player-2", 1, Date.now());
  assert(dupCp.success === false, "Duplicate checkpoint progression rejected");

  console.log("\n--- 5. Finish Synchronization & Authoritative Results ---");
  // Player 2 finishes 1st
  const finish1 = room.handlePlayerFinish("player-2", 45200);
  assert(finish1.success === true && finish1.position === 1, "Player 2 finishes 1st position");

  // Duplicate finish rejected
  const dupFinish = room.handlePlayerFinish("player-2", 45200);
  assert(dupFinish.success === false, "Duplicate finish event rejected");

  // Player 1 finishes 2nd
  const finish2 = room.handlePlayerFinish("player-1", 46100);
  assert(finish2.success === true && finish2.position === 2, "Player 1 finishes 2nd position");

  // Finish remaining players
  room.handlePlayerFinish("player-3", 48000);
  room.handlePlayerFinish("player-4", 49500);

  assert(room.state === "FINISHED", "Room transitions to FINISHED when all players complete");
  assert(room.results.length === 4, "Authoritative results contain 4 ranked players");
  assert(room.results[0].playerId === "player-2", "1st place correctly awarded to player-2");
  assert(room.results[1].playerId === "player-1", "2nd place correctly awarded to player-1");

  console.log("\n--- 6. Remote Player Interpolation ---");
  // Test remote player interpolation
  const interp = new RemotePlayerInterpolator();
  interp.pushSnapshot({
    playerId: "player-2",
    displayName: "SkyRunner",
    avatarId: "spark",
    x: 100,
    y: 500,
    vx: 10,
    vy: 0,
    facing: "right",
    animation: "run",
    grounded: true,
    checkpointId: 0,
    finished: false,
    connected: true,
    connectionState: "CONNECTED",
    isReady: true,
    isLeader: false,
    lastUpdate: Date.now() - 200,
    pingMs: 20,
  }, Date.now() - 200);

  interp.pushSnapshot({
    playerId: "player-2",
    displayName: "SkyRunner",
    avatarId: "spark",
    x: 300,
    y: 500,
    vx: 10,
    vy: 0,
    facing: "right",
    animation: "run",
    grounded: true,
    checkpointId: 0,
    finished: false,
    connected: true,
    connectionState: "CONNECTED",
    isReady: true,
    isLeader: false,
    lastUpdate: Date.now(),
    pingMs: 20,
  }, Date.now());

  const smoothed = interp.getInterpolatedState(Date.now());
  assert(smoothed !== null && smoothed.x >= 100 && smoothed.x <= 300, "Remote interpolation smoothly calculates intermediate position");

  console.log("\n--- 7. Cleanup & Room Close ---");
  room.close();
  assert(room.state === "CLOSED", "Room closes cleanly");

  console.log("\n========================================");
  console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("========================================");

  if (failCount > 0) {
    process.exit(1);
  }
}

runPhase9Tests();
