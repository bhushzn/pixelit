import { MAP_REGISTRY, getMapById } from "./src/game/maps/mapRegistry";
import { POWERUP_DEFINITIONS, getPowerUpById } from "./src/game/powerups/powerUpRegistry";
import { PowerUpType } from "./src/game/powerups/types";
import { LocalAuthService } from "./src/services/auth/localAuthService";
import { LocalSocialService } from "./src/services/social/socialService";
import { isFirebaseConfigured } from "./src/services/firebase/firebaseConfig";

// Mock localStorage for Node test runtime
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log("PASS: " + testName);
    passed++;
  } else {
    console.error("FAIL: " + testName + " - " + (detail || "Assertion failed"));
    failed++;
  }
}

console.log("=== RUNNING PIXEL RUSH PHASE 8 CONTRACT & REGRESSION TESTS ===\n");

// 1. Map Registry Verification (4 maps)
console.log("--- 1. Map Registry Verification ---");
const maps = ["cloud_climb", "sky_bridge", "candy_canyon", "jungle_jump"];
for (const mapId of maps) {
  const map = getMapById(mapId);
  assert(!!map && map.id === mapId, "Map Registry resolves " + mapId, "Found: " + map?.name);
  assert(!!map?.checkpoints && map.checkpoints.length >= 1, "Map " + mapId + " has valid checkpoints");
}

// 2. Power-Up Registry Verification (6 power-ups)
console.log("\n--- 2. Power-Up Registry Verification ---");
const expectedPowerUps: PowerUpType[] = [
  "banana_bounce",
  "mini_tornado",
  "freeze_pop",
  "wind_blast",
  "boomerang_bonk",
  "coin_magnet"
];
for (const pid of expectedPowerUps) {
  const pu = getPowerUpById(pid);
  assert(!!pu && pu.id === pid, "Power-up registered: " + pid, "Found: " + pu?.name);
}

// 3. Firebase Configuration Detection
console.log("\n--- 3. Firebase Configuration Detection ---");
const isConfigured = isFirebaseConfigured();
console.log("Firebase configured status:", isConfigured);
assert(typeof isConfigured === "boolean", "isFirebaseConfigured() returns boolean");

// 4. Authentication Abstraction & LocalAuthService Lifecycle
console.log("\n--- 4. Authentication Service Lifecycle ---");
async function runAuthTests() {
  const auth = new LocalAuthService();
  assert(auth.getAuthState() === "SIGNED_OUT", "Initial state is SIGNED_OUT");
  assert(auth.isOnlineMode() === false, "LocalAuthService identifies as local mode");

  // Guest Sign-in
  const guestUser = await auth.signInAsGuest("SpeedyPip");
  assert(guestUser.displayName === "SpeedyPip", "Guest sign in sets custom display name");
  assert(guestUser.isGuest === true, "Guest flag is true");
  assert(auth.getAuthState() === "AUTHENTICATED", "Auth state transitions to AUTHENTICATED");

  // Update profile
  const updatedUser = await auth.updateProfile({ coins: 6500, avatarId: "pixel_runner_03" });
  assert(updatedUser.coins === 6500, "User coins updated in profile");
  assert(updatedUser.avatarId === "pixel_runner_03", "User avatar updated");

  // Sign out
  await auth.signOut();
  assert(auth.getCurrentUser() === null, "Current user is null after sign out");
  assert(auth.getAuthState() === "SIGNED_OUT", "Auth state transitions to SIGNED_OUT after sign out");
}

// 5. Social & Party System Lifecycle
console.log("\n--- 5. Social & Party Contract Verification ---");
async function runSocialTests() {
  const social = new LocalSocialService();
  assert(social.isOnlineMode() === false, "LocalSocialService identifies as local mode");

  const profile = social.getProfile();
  assert(!!profile.id && profile.displayName.length > 0, "Social profile resolved");

  // Friend search & requests
  const searchRes = await social.searchUsers("fox");
  assert(searchRes.length > 0, "Friend search returns matching users");

  const selfAdd = await social.sendFriendRequest(profile as any);
  assert(!selfAdd.success, "Cannot send friend request to yourself");

  // Party creation & 4-player max
  const party = await social.createParty("quick_race", "cloud_climb");
  assert(party.status === "LOBBY", "Party created in LOBBY status");
  assert(party.members.length === 1, "Party initialized with leader only");

  // Add up to 4 members
  const friends = await social.getFriends();
  for (let i = 0; i < 3 && i < friends.length; i++) {
    await social.inviteFriendToParty(friends[i]);
  }
  assert(social.getPartyState()?.members.length === 4, "Party reaches 4-player capacity");

  // Attempting 5th member
  const extra = { id: "extra_p", username: "Extra", displayName: "Extra", avatarId: "pixel_runner_01", level: 1, status: "online" as const };
  const fullRes = await social.inviteFriendToParty(extra);
  assert(!fullRes.success, "Party rejects 5th member exceeding limit of 4");

  // Map & Mode change
  await social.setPartyMap("sky_bridge");
  assert(social.getPartyState()?.selectedMapId === "sky_bridge", "Party map updated to sky_bridge");

  await social.setPartyMode("time_trial");
  assert(social.getPartyState()?.selectedMode === "time_trial", "Party mode updated to time_trial");

  // Start race check
  const canStart = social.canStartRace();
  assert(canStart.allowed, "Party can launch race when ready");

  const started = await social.startRace();
  assert(started?.status === "STARTING", "Party state transitions to STARTING");

  await social.leaveParty();
  assert(social.getPartyState() === null, "Party cleared on leave");
}

async function main() {
  await runAuthTests();
  await runSocialTests();

  console.log("\n========================================");
  console.log("TEST SUMMARY: " + passed + " PASSED, " + failed + " FAILED");
  console.log("========================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

main();
