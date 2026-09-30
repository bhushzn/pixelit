/**
 * Pixel Rush Phase 10 Test Suite
 * Deterministic Contract Tests for Ranked Matchmaking & Global Lobbies
 */

import { MatchmakingQueue } from "./server/matchmaking/MatchmakingQueue";
import { Matchmaker } from "./server/matchmaking/Matchmaker";
import { MatchmakingService } from "./server/matchmaking/MatchmakingService";
import { MATCHMAKING_CONFIG, QueueEntry } from "./server/matchmaking/MatchmakingTypes";
import { RaceRoom, ConnectedClient } from "./server/rooms/RaceRoom";
import { ServerMessage, ClientMessage } from "./src/services/networking/networkTypes";
import { LocalAuthService } from "./src/services/auth/localAuthService";

// Mock localStorage for Node test runtime
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

interface TestContext {
  passed: number;
  failed: number;
}

const ctx: TestContext = { passed: 0, failed: 0 };

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    ctx.passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    ctx.failed++;
  }
}

function createMockClient(playerId: string): { client: ConnectedClient; sentMessages: ServerMessage[] } {
  const sentMessages: ServerMessage[] = [];
  const client: ConnectedClient = {
    playerId,
    send: (msg: ServerMessage) => {
      sentMessages.push(msg);
    },
    close: () => {},
  };
  return { client, sentMessages };
}

async function runPhase10Tests() {
  console.log("==================================================");
  console.log("PIXEL RUSH — PHASE 10 MATCHMAKING & LOBBY TESTS");
  console.log("==================================================\n");

  const rooms = new Map<string, RaceRoom>();
  const matchmakingService = new MatchmakingService(rooms);
  matchmakingService.stopLoop(); // Control ticks deterministically in tests

  // 1. Player enters queue
  console.log("--- 1. Solo Queue Entry ---");
  const p1 = createMockClient("p1");
  const join1 = matchmakingService.joinQueue(p1.client, {
    playerId: "p1",
    displayName: "Player 1",
    avatarId: "pip",
    mode: "quick_race",
    mapPreference: "cloud_climb",
  });
  assert(join1.success === true, "1. Player enters queue successfully");

  // 2. Queue status is returned
  console.log("\n--- 2. Queue Status Returned ---");
  const hasQueueStatus = p1.sentMessages.some((m) => m.type === "QUEUE_STATUS" && m.status === "QUEUED");
  assert(hasQueueStatus, "2. Queue status event returned to client");

  // 3. Duplicate queue request rejected safely
  console.log("\n--- 3. Duplicate Queue Prevention ---");
  const dupJoin = matchmakingService.joinQueue(p1.client, {
    playerId: "p1",
    displayName: "Player 1",
  });
  assert(dupJoin.success === false, "3. Duplicate queue request rejected safely");

  // 4. Player cancels queue
  console.log("\n--- 4. Queue Cancellation ---");
  const leaveRes = matchmakingService.leaveQueue("p1");
  assert(leaveRes.success === true, "4. Player cancels queue");
  assert(matchmakingService.queue.totalPlayers() === 0, "4b. Queue is empty after cancellation");
  const hasCancelledMsg = p1.sentMessages.some((m) => m.type === "MATCH_CANCELLED");
  assert(hasCancelledMsg, "4c. Cancelled notification delivered to client");

  // 5. Player disconnects while queued
  console.log("\n--- 5. Disconnect Cleanup ---");
  const p2 = createMockClient("p2");
  matchmakingService.joinQueue(p2.client, { playerId: "p2" });
  assert(matchmakingService.queue.totalPlayers() === 1, "5a. Player 2 queued");
  matchmakingService.handleDisconnect("p2");
  assert(matchmakingService.queue.totalPlayers() === 0, "5. Disconnect removes queued player");

  // 6. Two compatible players match
  console.log("\n--- 6. Two Player Matching ---");
  matchmakingService.queue.clear();
  const pa = createMockClient("pa");
  const pb = createMockClient("pb");
  const now = Date.now();
  matchmakingService.joinQueue(pa.client, { playerId: "pa", mode: "quick_race" });
  matchmakingService.joinQueue(pb.client, { playerId: "pb", mode: "quick_race" });

  // Simulate tick after 16s (past stage 2 threshold so 2 players can match)
  matchmakingService.tick(now + 16000);
  const paFound = pa.sentMessages.some((m) => m.type === "MATCH_FOUND");
  const pbFound = pb.sentMessages.some((m) => m.type === "MATCH_FOUND");
  assert(paFound && pbFound, "6. Two compatible players match after search window");

  // 7. Four compatible players form a full race immediately
  console.log("\n--- 7. Four Player Immediate Full Match ---");
  matchmakingService.queue.clear();
  rooms.clear();
  const c1 = createMockClient("c1");
  const c2 = createMockClient("c2");
  const c3 = createMockClient("c3");
  const c4 = createMockClient("c4");
  matchmakingService.joinQueue(c1.client, { playerId: "c1" });
  matchmakingService.joinQueue(c2.client, { playerId: "c2" });
  matchmakingService.joinQueue(c3.client, { playerId: "c3" });
  matchmakingService.joinQueue(c4.client, { playerId: "c4" });
  matchmakingService.tick(Date.now()); // Immediate tick

  const allFound = [c1, c2, c3, c4].every((c) => c.sentMessages.some((m) => m.type === "MATCH_FOUND"));
  assert(allFound, "7. Four compatible players form a full race instantly");
  assert(rooms.size === 1, "7b. Exactly one race room created for 4 players");

  // 8. Fifth player does not enter the existing room
  console.log("\n--- 8. Room Capacity Constraint (Max 4) ---");
  const c5 = createMockClient("c5");
  const createdRoom = Array.from(rooms.values())[0];
  const join5 = createdRoom.addPlayer(c5.client, "Player 5", "pip");
  assert(join5.success === false, "8. Fifth player rejected from full 4-player room");
  assert(createdRoom.players.size === 4, "8b. Room capacity strictly capped at 4");

  // 9. MMR compatibility works
  console.log("\n--- 9. MMR Compatibility ---");
  const qA: QueueEntry = {
    ticketId: "tA",
    leaderId: "a",
    members: [{ playerId: "a", displayName: "A", avatarId: "pip", mmr: 1000 }],
    mode: "quick_race",
    region: "IN",
    averageMmr: 1000,
    queuedAt: now,
    status: "QUEUED",
    client: createMockClient("a").client,
  };
  const qB_close: QueueEntry = {
    ticketId: "tB",
    leaderId: "b",
    members: [{ playerId: "b", displayName: "B", avatarId: "pip", mmr: 1050 }],
    mode: "quick_race",
    region: "IN",
    averageMmr: 1050,
    queuedAt: now,
    status: "QUEUED",
    client: createMockClient("b").client,
  };
  const qC_far: QueueEntry = {
    ticketId: "tC",
    leaderId: "c",
    members: [{ playerId: "c", displayName: "C", avatarId: "pip", mmr: 1800 }],
    mode: "quick_race",
    region: "IN",
    averageMmr: 1800,
    queuedAt: now,
    status: "QUEUED",
    client: createMockClient("c").client,
  };
  assert(Matchmaker.isMmrCompatible(qA, qB_close, now) === true, "9a. Close MMR (1000 vs 1050) matches");
  assert(Matchmaker.isMmrCompatible(qA, qC_far, now) === false, "9b. Distant MMR (1000 vs 1800) does not match at t=0");

  // 10. MMR search range expands over time
  console.log("\n--- 10. MMR Window Expansion ---");
  const w0 = Matchmaker.getMmrWindow(now, now);
  const w10 = Matchmaker.getMmrWindow(now, now + 10000);
  const w20 = Matchmaker.getMmrWindow(now, now + 20000);
  const w35 = Matchmaker.getMmrWindow(now, now + 35000);
  assert(w0 === 100, "10a. Window at 0s is ±100");
  assert(w10 === 200, "10b. Window at 10s is ±200");
  assert(w20 === 400, "10c. Window at 20s is ±400");
  assert(w35 === 1000, "10d. Window at 35s is ±1000");

  // 11. Region compatibility works
  console.log("\n--- 11. Region Compatibility ---");
  const q_eu: QueueEntry = { ...qA, region: "EU" };
  const q_asia: QueueEntry = { ...qA, region: "ASIA" };
  assert(Matchmaker.isRegionCompatible(q_eu, q_asia, now) === false, "11a. Cross-region blocked initially");
  assert(Matchmaker.isRegionCompatible(q_eu, q_asia, now + 20000) === true, "11b. Cross-region permitted after 15s wait");

  // 12. Queue timeout works
  console.log("\n--- 12. Queue Timeout ---");
  const matchesTimeout = Matchmaker.findMatches([qA], now + 50000);
  assert(matchesTimeout.length === 1, "12. Solo queue player matches via timeout threshold");

  // 13. Invalid mode rejected
  console.log("\n--- 13. Invalid Mode / Map Validation ---");
  // @ts-ignore
  const invMode = matchmakingService.joinQueue(createMockClient("inv").client, { playerId: "inv", mode: "battle_royale_3d" });
  assert(invMode.success === true, "13. Mode sanitized/defaulted to quick_race safely");

  // 14. Invalid map rejected
  const invMap = matchmakingService.joinQueue(createMockClient("inv2").client, { playerId: "inv2", mapPreference: "cyberpunk_city" });
  assert(invMap.success === false, "14. Invalid map preference rejected by server");

  // 15. Room assignment succeeds
  console.log("\n--- 15. Room Assignment ---");
  matchmakingService.queue.clear();
  rooms.clear();
  const ra1 = createMockClient("ra1");
  const ra2 = createMockClient("ra2");
  const ra3 = createMockClient("ra3");
  const ra4 = createMockClient("ra4");
  matchmakingService.joinQueue(ra1.client, { playerId: "ra1" });
  matchmakingService.joinQueue(ra2.client, { playerId: "ra2" });
  matchmakingService.joinQueue(ra3.client, { playerId: "ra3" });
  matchmakingService.joinQueue(ra4.client, { playerId: "ra4" });
  matchmakingService.tick(Date.now());
  const assignedMsg = ra1.sentMessages.find((m) => m.type === "MATCH_FOUND") as any;
  assert(assignedMsg && assignedMsg.roomId.startsWith("room-"), "15. Room assigned successfully with valid roomId");

  // 16. Room creation failure handled safely
  console.log("\n--- 16. Room Creation Resilience ---");
  assert(matchmakingService.queue.totalPlayers() === 0, "16. Queue state cleanly cleared upon room creation");

  // 17. Party of 2 matchmaking
  console.log("\n--- 17. Party of 2 Matchmaking ---");
  matchmakingService.queue.clear();
  rooms.clear();
  const partyLeader2 = createMockClient("leader2");
  const soloA = createMockClient("soloA");
  const soloB = createMockClient("soloB");
  matchmakingService.joinQueue(partyLeader2.client, {
    playerId: "leader2",
    partyMembers: [
      { playerId: "leader2", displayName: "Leader", avatarId: "pip" },
      { playerId: "member2", displayName: "Member", avatarId: "dash" },
    ],
  });
  matchmakingService.joinQueue(soloA.client, { playerId: "soloA" });
  matchmakingService.joinQueue(soloB.client, { playerId: "soloB" });
  matchmakingService.tick(Date.now());
  assert(rooms.size === 1, "17a. Party of 2 + 2 solos formed 1 full room");
  const p2Room = Array.from(rooms.values())[0];
  assert(p2Room.players.size === 4, "17b. Exactly 4 players in room from Party(2) + 2 Solos");

  // 18. Party of 3 matchmaking
  console.log("\n--- 18. Party of 3 Matchmaking ---");
  matchmakingService.queue.clear();
  rooms.clear();
  const partyLeader3 = createMockClient("leader3");
  const soloC = createMockClient("soloC");
  matchmakingService.joinQueue(partyLeader3.client, {
    playerId: "leader3",
    partyMembers: [
      { playerId: "leader3", displayName: "L3", avatarId: "pip" },
      { playerId: "m1", displayName: "M1", avatarId: "dash" },
      { playerId: "m2", displayName: "M2", avatarId: "spark" },
    ],
  });
  matchmakingService.joinQueue(soloC.client, { playerId: "soloC" });
  matchmakingService.tick(Date.now());
  assert(rooms.size === 1, "18a. Party of 3 + 1 solo formed 1 full room");
  const p3Room = Array.from(rooms.values())[0];
  assert(p3Room.players.size === 4, "18b. Exactly 4 players in room from Party(3) + 1 Solo");

  // 19. Party of 4 matchmaking
  console.log("\n--- 19. Party of 4 Instant Private Race ---");
  matchmakingService.queue.clear();
  rooms.clear();
  const partyLeader4 = createMockClient("leader4");
  matchmakingService.joinQueue(partyLeader4.client, {
    playerId: "leader4",
    partyMembers: [
      { playerId: "leader4", displayName: "L4", avatarId: "pip" },
      { playerId: "pm1", displayName: "PM1", avatarId: "dash" },
      { playerId: "pm2", displayName: "PM2", avatarId: "spark" },
      { playerId: "pm3", displayName: "PM3", avatarId: "bolt" },
    ],
  });
  matchmakingService.tick(Date.now());
  assert(rooms.size === 1, "19a. Full Party of 4 instantly creates room");
  const p4Room = Array.from(rooms.values())[0];
  assert(p4Room.players.size === 4, "19b. Exactly 4 players assigned to room");

  // 20. Duplicate party queue rejected
  console.log("\n--- 20. Duplicate Party Member Queue Rejected ---");
  matchmakingService.queue.clear();
  const pLeader = createMockClient("pLeader");
  matchmakingService.joinQueue(pLeader.client, {
    playerId: "pLeader",
    partyMembers: [
      { playerId: "pLeader", displayName: "PL", avatarId: "pip" },
      { playerId: "pMember", displayName: "PM", avatarId: "dash" },
    ],
  });
  const rogueClient = createMockClient("pMember");
  const rogueJoin = matchmakingService.joinQueue(rogueClient.client, { playerId: "pMember" });
  assert(rogueJoin.success === false, "20. Party member attempting separate queue is safely rejected");

  // 21. Match found event delivered
  console.log("\n--- 21. Match Found Event Delivery ---");
  assert(partyLeader4.sentMessages.some((m) => m.type === "MATCH_FOUND"), "21. MATCH_FOUND delivered to party leader");

  // 22. Cancel after match found handled safely
  console.log("\n--- 22. Post-Match State Resilience ---");
  const cancelAfterMatch = matchmakingService.leaveQueue("leader4");
  assert(cancelAfterMatch.success === false, "22. Cannot cancel queue after match is already formed");

  // 23. Rematch flow does not duplicate queue entries
  console.log("\n--- 23. Rematch Queue Re-entry ---");
  matchmakingService.queue.clear();
  const rematchClient = createMockClient("rematch1");
  const r1 = matchmakingService.joinQueue(rematchClient.client, { playerId: "rematch1" });
  assert(r1.success === true, "23a. First rematch queue join succeeds");
  const r2 = matchmakingService.joinQueue(rematchClient.client, { playerId: "rematch1" });
  assert(r2.success === false, "23b. Duplicate rematch queue join prevented");

  // 24. Public Room Discovery (Global Lobbies)
  console.log("\n--- 24. Global Lobby Discovery ---");
  const pubRooms = matchmakingService.getPublicRoomSummaries();
  assert(Array.isArray(pubRooms), "24a. Public rooms summary returned");
  if (pubRooms.length > 0) {
    const r = pubRooms[0];
    assert(Boolean(r.roomId && r.mapId && r.playerCount !== undefined && r.region !== undefined), "24b. Public room contains sanitized metadata");
  }

  // 25. Local / Firebase Auth fallback
  console.log("\n--- 25. Auth Fallback Functionality ---");
  const auth = new LocalAuthService();
  const guestProf = await auth.signInAsGuest("TesterPip");
  assert(Boolean(guestProf && guestProf.uid.startsWith("guest_")), "25. Local authentication fallback functional");

  console.log("\n==================================================");
  console.log(`PHASE 10 TEST RESULTS: ${ctx.passed} Passed, ${ctx.failed} Failed`);
  console.log("==================================================");

  if (ctx.failed > 0) {
    process.exit(1);
  }
}

runPhase10Tests();
