import { MAP_REGISTRY, getMapById } from "./src/game/maps/mapRegistry";
import { SocialStorage } from "./src/services/social/socialStorage";
import { FriendService, DEMO_FRIENDS } from "./src/services/social/friendService";
import { PartyService } from "./src/services/social/partyService";
import { SocialService } from "./src/services/social/socialService";

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

console.log("=== RUNNING PHASE 7 SOCIAL & PARTY CONTRACT TESTS ===\n");

// 1. Map Registry Check
console.log("--- 1. Map Registry Verification ---");
const maps = ["cloud_climb", "sky_bridge", "candy_canyon", "jungle_jump"];
for (const mapId of maps) {
  const map = getMapById(mapId);
  assert(!!map && map.id === mapId, "Map Registry resolves " + mapId, "Found: " + map?.name);
  assert(!!map?.checkpoints && map.checkpoints.length >= 1, "Map " + mapId + " has valid checkpoints (" + map?.checkpoints?.length + ")");
}

// 2. Profile Management & Persistence
console.log("\n--- 2. Profile Management & Persistence ---");
const social = new SocialService();
const initialProfile = social.getProfile();
assert(initialProfile.id === "local_player_1", "Default local profile exists");
assert(initialProfile.displayName === "Pip", "Default profile name is Pip");

const updated = social.updateProfile({ displayName: "TurboFox", avatarId: "pixel_runner_02" });
assert(updated.displayName === "TurboFox", "Profile update displayName");
assert(updated.avatarId === "pixel_runner_02", "Profile update avatarId");

const reloadedProfile = SocialStorage.loadProfile();
assert(reloadedProfile.displayName === "TurboFox", "Profile persists to localStorage");

// 3. Friend Search & Requests Lifecycle
console.log("\n--- 3. Friend Search & Requests Lifecycle ---");
const searchResults = social.searchUsers("fox");
assert(searchResults.length > 0 && searchResults.some(u => u.displayName === "PixelFox"), "Search demo user PixelFox");

// Self-add prevention
const selfAdd = social.sendFriendRequest({
  id: "local_player_1",
  username: "Pip",
  displayName: "Pip",
  avatarId: "pixel_runner_01",
  level: 12,
  status: "online",
});
assert(!selfAdd.success, "Cannot send friend request to yourself");

// Send request to demo user
const targetUser = DEMO_FRIENDS.find(f => f.id === "demo_5")!;
const reqResult = social.sendFriendRequest(targetUser);
assert(reqResult.success, "Send friend request to SkyRunner");

const duplicateReq = social.sendFriendRequest(targetUser);
assert(!duplicateReq.success, "Cannot send duplicate friend request");

const requests = social.getFriendRequests();
const outgoing = requests.find(r => r.fromPlayer.id === "demo_5");
assert(!!outgoing, "Outgoing request recorded");

// Incoming request accept test
const incoming = requests.find(r => r.type === "incoming");
if (incoming) {
  const acceptRes = social.acceptFriendRequest(incoming.id);
  assert(acceptRes, "Accept incoming friend request");
  const friendsList = social.getFriends();
  assert(friendsList.some(f => f.id === incoming.fromPlayer.id), "Accepted friend added to friends list");
}

// Remove friend test
const friendToRemove = social.getFriends()[0];
if (friendToRemove) {
  const removeRes = social.removeFriend(friendToRemove.id);
  assert(removeRes, "Remove friend succeeds");
  const friendsListAfter = social.getFriends();
  assert(!friendsListAfter.some(f => f.id === friendToRemove.id), "Friend removed from list");
}

// 4. Party Lifecycle & Rules
console.log("\n--- 4. Party Lifecycle & Rules ---");
const party = social.createParty("quick_race", "cloud_climb");
assert(!!party && party.status === "LOBBY", "Party created with status LOBBY");
assert(party.leaderId === initialProfile.id, "Local player is party leader");
assert(party.members.length === 1, "Party starts with 1 member (leader)");

const friend1 = DEMO_FRIENDS[0];
const friend2 = DEMO_FRIENDS[1];
const friend3 = DEMO_FRIENDS[2];
const friend4 = DEMO_FRIENDS[3];

const inv1 = social.inviteFriendToParty(friend1);
assert(inv1.success, "Invite friend 1 (" + friend1.displayName + ")");
const inv2 = social.inviteFriendToParty(friend2);
assert(inv2.success, "Invite friend 2 (" + friend2.displayName + ")");
const inv3 = social.inviteFriendToParty(friend3);
assert(inv3.success, "Invite friend 3 (" + friend3.displayName + ")");

assert(social.getPartyState()?.members.length === 4, "Party has 4 members (Full capacity)");

const inv4 = social.inviteFriendToParty(friend4);
assert(!inv4.success, "Party enforces maximum limit of 4 members");

const invDup = social.inviteFriendToParty(friend1);
assert(!invDup.success, "Cannot add duplicate member to party");

social.setPartyMap("candy_canyon");
assert(social.getPartyState()?.selectedMapId === "candy_canyon", "Party leader selects map candy_canyon");

social.setPartyMode("time_trial");
assert(social.getPartyState()?.selectedMode === "time_trial", "Party leader selects mode time_trial");

const canStart = social.canStartRace();
assert(canStart.allowed, "Party can start race when all members ready");

const startedParty = social.startRace();
assert(startedParty?.status === "STARTING", "Party transitions to STARTING state");

const loadedParty = SocialStorage.loadPartyState();
assert(loadedParty?.selectedMapId === "candy_canyon", "Party state persists to storage");

social.leaveParty();
assert(social.getPartyState() === null, "Leave party clears party state");
assert(SocialStorage.loadPartyState() === null, "Party state cleared in storage");

const partyService2 = new PartyService();
const p2 = partyService2.createParty({
  id: "other_leader",
  username: "LeaderX",
  displayName: "LeaderX",
  avatarId: "pixel_runner_01",
  level: 10,
  xp: 1000,
  coins: 500,
  status: "online",
  createdAt: Date.now()
});
const nonLeaderStart = partyService2.canStartRace("local_player_1");
assert(!nonLeaderStart.allowed, "Non-leader player cannot start race");

console.log("\n========================================");
console.log("TEST SUMMARY: " + passed + " PASSED, " + failed + " FAILED");
console.log("========================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}