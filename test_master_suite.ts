/**
 * Pixel Rush - Master Validation & Contract Test Suite
 * Deterministically tests Maps, Power-Ups, Social, Auth, and Real-Time Multiplayer.
 */

import { MAP_REGISTRY, getMapById } from './src/game/maps/mapRegistry';
import {
  POWERUP_DEFINITIONS,
  LOOT_TABLE,
  RARITY_WEIGHTS,
  rollPowerUp,
  getPowerUpById,
} from './src/game/powerups/powerUpRegistry';
import { LocalAuthService } from './src/services/auth/localAuthService';
import { LocalSocialService } from './src/services/social/socialService';
import { RaceRoom, ConnectedClient } from './server/rooms/RaceRoom';
import { RemotePlayerInterpolator } from './src/services/networking/NetworkInterpolation';
import { ServerMessage } from './src/services/networking/networkTypes';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passCount++;
    console.log(`PASS: ${msg}`);
  } else {
    failCount++;
    console.error(`FAIL: ${msg}`);
  }
}

async function runMasterSuite() {
  console.log('\n==================================================');
  console.log('🏁 PIXEL RUSH MASTER AUDIT & VALIDATION SUITE');
  console.log('==================================================\n');

  // ---------------------------------------------------------
  // 1. MAP AUDIT & REGISTRY
  // ---------------------------------------------------------
  console.log('--- 1. Map Verification (4 Playable Maps) ---');
  const expectedMaps = ['cloud_climb', 'sky_bridge', 'candy_canyon', 'jungle_jump'];

  for (const mapId of expectedMaps) {
    const entry = MAP_REGISTRY[mapId];
    assert(!!entry, `Map Registry contains ${mapId}`);
    assert(entry?.isPlayable === true, `Map ${mapId} is marked playable`);

    const mapData = getMapById(mapId);
    assert(mapData.worldWidth >= 5000, `Map ${mapId} has adequate length (${mapData.worldWidth}px)`);
    assert(mapData.platforms.length > 0, `Map ${mapId} has platforms (${mapData.platforms.length})`);
    assert(mapData.checkpoints.length >= 1, `Map ${mapId} has valid checkpoint(s)`);
    assert(mapData.finishTrigger.width > 0, `Map ${mapId} has finish trigger`);
    assert(mapData.coins.length > 0, `Map ${mapId} has gold coins (${mapData.coins.length})`);
    assert(mapData.hazards.length > 0, `Map ${mapId} has hazards`);
    assert(mapData.boostPads.length > 0, `Map ${mapId} has boost pads`);
  }

  // ---------------------------------------------------------
  // 2. POWER-UP AUDIT (Phase 6)
  // ---------------------------------------------------------
  console.log('\n--- 2. Power-Up System & Loot Table Verification ---');
  const powerUpTypes = [
    'banana_bounce',
    'mini_tornado',
    'freeze_pop',
    'wind_blast',
    'boomerang_bonk',
    'coin_magnet',
  ] as const;

  for (const pId of powerUpTypes) {
    const pDef = POWERUP_DEFINITIONS[pId];
    assert(!!pDef, `Power-up registered: ${pId}`);
    assert(pDef.cooldownMs > 0, `Power-up ${pId} has cooldown (${pDef.cooldownMs}ms)`);
  }

  // Verify exact weights: Common 45%, Uncommon 30%, Rare 18%, Epic 7%
  assert(RARITY_WEIGHTS.common === 45, 'Common rarity weight is 45%');
  assert(RARITY_WEIGHTS.uncommon === 30, 'Uncommon rarity weight is 30%');
  assert(RARITY_WEIGHTS.rare === 18, 'Rare rarity weight is 18%');
  assert(RARITY_WEIGHTS.epic === 7, 'Epic rarity weight is 7%');

  const totalTableWeight = LOOT_TABLE.reduce((sum, item) => sum + item.weight, 0);
  assert(totalTableWeight === 100, `Loot table total weight equals exactly 100 (got ${totalTableWeight})`);

  // Deterministic loot table roll verification
  const commonRoll = rollPowerUp(10);
  assert(commonRoll.id === 'banana_bounce', 'Deterministic roll @ 10 gives Banana Bounce');

  const uncommonRoll = rollPowerUp(50);
  assert(uncommonRoll.id === 'mini_tornado' || uncommonRoll.id === 'coin_magnet', 'Deterministic roll @ 50 gives Uncommon');

  const rareRoll = rollPowerUp(80);
  assert(rareRoll.id === 'freeze_pop' || rareRoll.id === 'wind_blast', 'Deterministic roll @ 80 gives Rare');

  const epicRoll = rollPowerUp(98);
  assert(epicRoll.id === 'boomerang_bonk', 'Deterministic roll @ 98 gives Epic (Boomerang Bonk)');

  // ---------------------------------------------------------
  // 3. AUTH & PROFILE LIFECYCLE (Phase 8)
  // ---------------------------------------------------------
  console.log('\n--- 3. Authentication & Profile Verification ---');
  const auth = new LocalAuthService();
  assert(auth.isOnlineMode() === false, 'Auth service correctly operates in local mode');

  const user = await auth.signInAsGuest('SpeedyPip');
  assert(user.displayName === 'SpeedyPip', 'Guest user sign in sets displayName');
  assert(user.isGuest === true, 'Guest user flag is true');
  assert(auth.getAuthState() === 'AUTHENTICATED', 'Auth state transitions to AUTHENTICATED');

  await auth.updateProfile({ coins: 7500 });
  assert(auth.getCurrentUser()?.coins === 7500, 'User profile coin balance updated');

  await auth.signOut();
  assert(auth.getAuthState() === 'SIGNED_OUT', 'Auth state transitions to SIGNED_OUT after signOut');

  // ---------------------------------------------------------
  // 4. SOCIAL & PARTY CONTRACT (Phase 7)
  // ---------------------------------------------------------
  console.log('\n--- 4. Social & Party System Verification ---');
  const social = new LocalSocialService();
  const initialParty = await social.createParty('quick_race', 'candy_canyon');
  assert(initialParty.status === 'LOBBY', 'Party created in LOBBY status');
  assert(initialParty.selectedMapId === 'candy_canyon', 'Party created with candy_canyon map');
  assert(initialParty.members.length === 1, 'Party starts with leader only');

  // Invite friends up to capacity (4 members)
  await social.inviteFriendToParty({
    id: 'runner-2',
    username: 'nova',
    displayName: 'Nova',
    avatarId: 'pixel_runner_02',
    level: 10,
    status: 'online',
  });
  await social.inviteFriendToParty({
    id: 'runner-3',
    username: 'blaze',
    displayName: 'Blaze',
    avatarId: 'pixel_runner_03',
    level: 14,
    status: 'online',
  });
  await social.inviteFriendToParty({
    id: 'runner-4',
    username: 'dash',
    displayName: 'Dash',
    avatarId: 'pixel_runner_04',
    level: 8,
    status: 'online',
  });

  const fullParty = social.getPartyState();
  assert(fullParty?.members.length === 4, 'Party reached 4-player maximum capacity');

  const overflowResult = await social.inviteFriendToParty({
    id: 'runner-5',
    username: 'extra',
    displayName: 'Extra',
    avatarId: 'pixel_runner_01',
    level: 5,
    status: 'online',
  });
  assert(overflowResult.success === false, 'Party strictly rejects 5th member beyond capacity of 4');

  await social.setPartyMap('jungle_jump');
  assert(social.getPartyState()?.selectedMapId === 'jungle_jump', 'Party leader updated map to jungle_jump');

  await social.leaveParty();
  assert(social.getPartyState() === null, 'Party cleared after leaveParty');

  // ---------------------------------------------------------
  // 5. REAL-TIME MULTIPLAYER ROOM & PROTOCOL (Phase 9)
  // ---------------------------------------------------------
  console.log('\n--- 5. Real-Time Multiplayer Server & Room Verification ---');
  const room = new RaceRoom('test-room-master', 'sky_bridge', 'quick_race', 'p1');
  assert(room.state === 'LOBBY', 'Room initial state is LOBBY');
  assert(room.mapId === 'sky_bridge', 'Room initialized with sky_bridge');

  const p1Messages: ServerMessage[] = [];
  const p2Messages: ServerMessage[] = [];
  const p3Messages: ServerMessage[] = [];
  const p4Messages: ServerMessage[] = [];

  const c1: ConnectedClient = { playerId: 'p1', send: (m) => p1Messages.push(m) };
  const c2: ConnectedClient = { playerId: 'p2', send: (m) => p2Messages.push(m) };
  const c3: ConnectedClient = { playerId: 'p3', send: (m) => p3Messages.push(m) };
  const c4: ConnectedClient = { playerId: 'p4', send: (m) => p4Messages.push(m) };

  // Join players
  const j1 = room.addPlayer(c1, 'Pip');
  const j2 = room.addPlayer(c2, 'Nova');
  const j3 = room.addPlayer(c3, 'Blaze');
  const j4 = room.addPlayer(c4, 'Dash');

  assert(j1.success && j2.success && j3.success && j4.success, 'All 4 runners joined room');
  assert(room.players.size === 4, 'Room contains exactly 4 players');

  // 5th player rejection
  const c5: ConnectedClient = { playerId: 'p5', send: () => {} };
  const j5 = room.addPlayer(c5, 'OverflowRunner');
  assert(j5.success === false, '5th player rejected by room (4-player maximum strictly enforced)');

  // Ready & Start sequence
  room.setPlayerReady('p2', true);
  room.setPlayerReady('p3', true);
  room.setPlayerReady('p4', true);

  const startRes = room.requestStartRace('p1');
  assert(startRes.success === true, 'Leader starts countdown when all 4 players are ready');
  assert(room.state === 'COUNTDOWN', 'Room state transitions to COUNTDOWN');

  // Fast forward into RACING
  (room as any).startRacing();
  assert(room.state === 'RACING', 'Room state transitions to RACING');

  // Player state message
  room.handlePlayerState('p1', { x: 350, y: 540, vx: 200, vy: 0, facing: 'right', animation: 'running' });
  assert(room.players.get('p1')?.x === 350, 'Room handles authoritative player position updates');

  // Checkpoint validation
  const invalidCp = room.handleCheckpoint('p1', 99, Date.now());
  assert(invalidCp.success === false, 'Room rejects invalid checkpoint ID 99');

  const validCp = room.handleCheckpoint('p1', 1, Date.now());
  assert(validCp.success === true, 'Room accepts valid checkpoint progression');

  const dupCp = room.handleCheckpoint('p1', 1, Date.now());
  assert(dupCp.success === false, 'Room rejects duplicate checkpoint progression');

  // Power-Up broadcast
  const validPu = room.handlePowerUp('p1', 'banana_bounce');
  assert(validPu.success === true, 'Room validates and broadcasts power-up use');

  const invalidPu = room.handlePowerUp('p1', 'laser_gun' as any);
  assert(invalidPu.success === false, 'Room rejects unknown/invalid power-up');

  // Finish synchronization
  const f2 = room.handlePlayerFinish('p2', 18450);
  assert(f2.position === 1, 'Player 2 finishes in 1st position');

  const f1 = room.handlePlayerFinish('p1', 19200);
  assert(f1.position === 2, 'Player 1 finishes in 2nd position');

  room.handlePlayerFinish('p3', 20100);
  room.handlePlayerFinish('p4', 21500);

  assert(room.state === 'FINISHED', 'Room automatically transitions to FINISHED when all players finish');
  assert(room.results.length === 4, 'Authoritative results contain all 4 ranked runners');
  assert(room.results[0].playerId === 'p2', '1st place awarded to Player 2');
  assert(room.results[1].playerId === 'p1', '2nd place awarded to Player 1');

  // Remote player interpolator test
  const interp = new RemotePlayerInterpolator();
  interp.interpolationDelayMs = 0; // immediate evaluation for test timestamp
  interp.pushSnapshot({ x: 100, y: 500, vx: 100, vy: 0, facing: 'right', animation: 'running', grounded: true, playerId: 'p2', displayName: 'Nova', avatarId: 'pip', checkpointId: 0, finished: false, connected: true, connectionState: 'CONNECTED', isReady: true, isLeader: false, lastUpdate: 1000, pingMs: 0 }, 1000);
  interp.pushSnapshot({ x: 200, y: 500, vx: 100, vy: 0, facing: 'right', animation: 'running', grounded: true, playerId: 'p2', displayName: 'Nova', avatarId: 'pip', checkpointId: 0, finished: false, connected: true, connectionState: 'CONNECTED', isReady: true, isLeader: false, lastUpdate: 1100, pingMs: 0 }, 1100);

  const sample = interp.sample(1050);
  assert(sample !== null && sample.x >= 145 && sample.x <= 155, `Remote player smoothly interpolated at midpoint (x=${sample?.x})`);

  room.close();
  assert(room.state === 'CLOSED', 'Room cleanly closed and timers freed');

  // ---------------------------------------------------------
  // FINAL TEST SUMMARY
  // ---------------------------------------------------------
  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log('==================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runMasterSuite().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
