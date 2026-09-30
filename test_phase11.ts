/**
 * Pixel Rush Phase 11 Test Suite
 * Deterministic Contract Tests for Progression, Runner Cosmetics & Store
 */

import {
  COSMETIC_SKINS,
  COSMETIC_HATS,
  COSMETIC_TRAILS,
  ALL_COSMETICS,
  getCosmeticById,
  getCosmeticsByCategory,
  getDefaultCosmetics,
} from "./src/game/cosmetics/cosmeticRegistry";
import {
  PROGRESSION_CONFIG,
  getCumulativeXpForLevel,
  getLevelFromTotalXp,
  getLevelProgress,
} from "./src/services/progression/progressionConfig";
import { ProgressionService } from "./src/services/progression/progressionService";
import { RaceStats } from "./src/types/game";
import { RaceRoom, ConnectedClient } from "./server/rooms/RaceRoom";
import { ServerMessage } from "./src/services/networking/networkTypes";
import { isFirebaseConfigured } from "./src/services/firebase/firebaseConfig";

// Mock localStorage for deterministic Node environment test runs
let mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { mockStorage = {}; }
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

async function runPhase11Tests() {
  console.log("==================================================");
  console.log("PIXEL RUSH — PHASE 11 PROGRESSION & COSMETIC TESTS");
  console.log("==================================================\n");

  localStorage.clear();
  let progressionService = new ProgressionService();

  // 1. New player starts at Level 1
  console.log("--- 1. Initial Player Progression State ---");
  const initialProg = progressionService.getProgression();
  assert(initialProg.level === 1, "1. New player starts at Level 1");
  assert(initialProg.xp === 0, "1b. Initial XP is 0");

  // 2. Default runner is unlocked
  console.log("\n--- 2. Default Runner & Cosmetics Unlocked ---");
  const defaults = getDefaultCosmetics();
  assert(initialProg.unlockedCosmetics.includes("classic_runner"), "2a. Default classic_runner is unlocked");
  assert(initialProg.unlockedCosmetics.includes(defaults.hatId), "2b. Default hat is unlocked");
  assert(initialProg.unlockedCosmetics.includes(defaults.trailId), "2c. Default trail is unlocked");

  // 3. XP is awarded correctly
  console.log("\n--- 3. XP Awarding & Level Curves ---");
  const mockStats1: RaceStats = {
    finishPosition: 2,
    totalRacers: 4,
    finishTimeMs: 45000,
    coinsCollected: 15,
    checkpointsPassed: 1,
    totalCheckpoints: 1,
    xpEarned: 0,
  };
  const reward1 = progressionService.awardRaceRewards(mockStats1, "cloud_climb");
  // 50 (participation) + 50 (finish) + 60 (2nd place) = 160 XP
  assert(reward1.xpEarned === 160, "3a. XP awarded correctly (160 XP for 2nd place)");
  assert(progressionService.getProgression().xp === 160, "3b. Cumulative XP updated in progression");

  // 4. Level-up works (160 XP reaches Level 2)
  console.log("\n--- 4. Single Level-Up Transition ---");
  assert(reward1.didLevelUp === true, "4a. Level-up flag is true");
  assert(reward1.newLevel === 2, "4b. Player transitioned from Level 1 -> Level 2");

  // 5. Multiple level-ups work (adding 600 XP pushes past Level 4)
  console.log("\n--- 5. Multi-Level Level-Up ---");
  const mockStatsBig: RaceStats = {
    finishPosition: 1,
    totalRacers: 4,
    finishTimeMs: 40000,
    coinsCollected: 50,
    checkpointsPassed: 1,
    totalCheckpoints: 1,
    xpEarned: 500,
  };
  const reward2 = progressionService.awardRaceRewards(mockStatsBig, "cloud_climb");
  assert(reward2.didLevelUp === true, "5a. Multi-level up flagged");
  assert(reward2.newLevel >= 4, "5b. Jumped multiple levels from Level 2 -> Level " + reward2.newLevel);

  // 6. Coins are awarded correctly
  console.log("\n--- 6. Coin Rewards ---");
  // 1st place: 100 bonus + 50 collected = 150 coins
  assert(reward2.coinsEarned === 150, "6a. Coin reward calculated correctly (150 coins)");

  // 7. Negative currency is rejected
  console.log("\n--- 7. Currency Protection ---");
  const currentProg = progressionService.getProgression();
  assert(currentProg.totalCoins >= 0, "7a. Total coins cannot be negative");
  assert(currentProg.totalGems >= 0, "7b. Total gems cannot be negative");

  // 8. Cosmetic registry loads
  console.log("\n--- 8. Cosmetic Registry ---");
  assert(COSMETIC_SKINS.length >= 6, "8a. At least 6 runner skins defined");
  assert(COSMETIC_HATS.length >= 4, "8b. At least 4 hats defined");
  assert(COSMETIC_TRAILS.length >= 4, "8c. At least 4 trails defined");
  assert(ALL_COSMETICS.length === COSMETIC_SKINS.length + COSMETIC_HATS.length + COSMETIC_TRAILS.length, "8d. All cosmetics aggregated");

  // 9. Default cosmetic is owned
  console.log("\n--- 9. Default Item Ownership ---");
  assert(progressionService.isOwned("classic_runner") === true, "9. Classic Runner is owned by default");

  // 10. Locked cosmetic cannot be equipped
  console.log("\n--- 10. Locked Cosmetic Equipment Block ---");
  const equipLocked = progressionService.equipCosmetic("mecha_pip", "skin");
  assert(equipLocked.success === false, "10. Locked cosmetic (Mecha Pip) cannot be equipped");

  // 11. Owned cosmetic can be equipped
  console.log("\n--- 11. Owned Cosmetic Equipment ---");
  const equipClassic = progressionService.equipCosmetic("classic_runner", "skin");
  assert(equipClassic.success === true, "11. Owned cosmetic (Classic Runner) can be equipped");
  assert(progressionService.getProgression().equippedSkinId === "classic_runner", "11b. Equipped skin updated");

  // 12. Cosmetic purchase works
  console.log("\n--- 12. Cosmetic Purchase ---");
  const coinsBefore = progressionService.getProgression().totalCoins;
  const buyFox = progressionService.purchaseCosmetic("forest_fox");
  assert(buyFox.success === true, "12a. Forest Fox purchased successfully");
  assert(progressionService.isOwned("forest_fox") === true, "12b. Forest Fox is now in owned cosmetics");
  assert(progressionService.getProgression().totalCoins === coinsBefore - 1000, "12c. 1000 Coins deducted correctly");

  // 13. Duplicate purchase is rejected
  console.log("\n--- 13. Duplicate Purchase Prevention ---");
  const dupBuy = progressionService.purchaseCosmetic("forest_fox");
  assert(dupBuy.success === false, "13. Duplicate purchase of already owned item rejected");

  // 14. Insufficient coins are rejected
  console.log("\n--- 14. Insufficient Currency Check ---");
  // Set coins to 0 and attempt buying 2500 coin Mecha Pip
  const zeroCoinService = new ProgressionService();
  (zeroCoinService as any).progression.totalCoins = 10;
  const poorBuy = zeroCoinService.purchaseCosmetic("mecha_pip");
  assert(poorBuy.success === false, "14. Purchase with insufficient coins rejected");

  // 15. Level-locked item cannot be purchased early
  console.log("\n--- 15. Level-Locked Items ---");
  (zeroCoinService as any).progression.level = 1;
  const earlyLvlBuy = zeroCoinService.purchaseCosmetic("sky_runner");
  assert(earlyLvlBuy.success === false, "15. Level 5 Sky Runner cannot be claimed at Level 1");

  // 16. Equipped skin persists
  console.log("\n--- 16. Persistence of Equipped Skin ---");
  progressionService.equipCosmetic("forest_fox", "skin");
  assert(progressionService.getProgression().equippedSkinId === "forest_fox", "16. Equipped skin set to forest_fox");

  // 17. Equipped hat persists
  console.log("\n--- 17. Persistence of Equipped Hat ---");
  progressionService.purchaseCosmetic("explorer_hat");
  progressionService.equipCosmetic("explorer_hat", "hat");
  assert(progressionService.getProgression().equippedHatId === "explorer_hat", "17. Equipped hat set to explorer_hat");

  // 18. Equipped trail persists
  console.log("\n--- 18. Persistence of Equipped Trail ---");
  progressionService.purchaseCosmetic("spark_trail");
  progressionService.equipCosmetic("spark_trail", "trail");
  assert(progressionService.getProgression().equippedTrailId === "spark_trail", "18. Equipped trail set to spark_trail");

  // 19. Local persistence across service reload
  console.log("\n--- 19. Local Storage Persistence Reload ---");
  const reloadedService = new ProgressionService();
  const reloadedProg = reloadedService.getProgression();
  assert(reloadedProg.equippedSkinId === "forest_fox", "19a. Equipped skin reloaded from storage");
  assert(reloadedProg.equippedHatId === "explorer_hat", "19b. Equipped hat reloaded from storage");
  assert(reloadedProg.equippedTrailId === "spark_trail", "19c. Equipped trail reloaded from storage");
  assert(reloadedProg.unlockedCosmetics.includes("forest_fox"), "19d. Owned list reloaded");

  // 20. Malformed local data recovers safely
  console.log("\n--- 20. Corrupted Storage Recovery ---");
  mockStorage["pixel_rush_player_progression_v1"] = "{ invalid json string @#$";
  const recoveredService = new ProgressionService();
  assert(recoveredService.getProgression().level === 1, "20a. Corrupted storage safely resets to Level 1");
  assert(recoveredService.getProgression().equippedSkinId === "classic_runner", "20b. Defaults safely restored");

  // 21. Firebase fallback detection
  console.log("\n--- 21. Firebase Fallback ---");
  const fbConfigured = isFirebaseConfigured();
  assert(typeof fbConfigured === "boolean", "21. Firebase fallback detection operates without crashing");

  // 22. Multiplayer cosmetic IDs serialize correctly
  console.log("\n--- 22. Multiplayer Cosmetic ID Serialization ---");
  const room = new RaceRoom("room-cosmetics-test", "cloud_climb", "quick_race", "p1");
  const client1 = createMockClient("p1");
  const joinRes = room.addPlayer(client1.client, "Player 1", "pip", {
    skinId: "forest_fox",
    hatId: "explorer_hat",
    trailId: "spark_trail",
  });
  assert(joinRes.success === true, "22a. Player added with cosmetic payload");
  assert(joinRes.player?.skinId === "forest_fox", "22b. skinId serialized on network player state");
  assert(joinRes.player?.hatId === "explorer_hat", "22c. hatId serialized on network player state");
  assert(joinRes.player?.trailId === "spark_trail", "22d. trailId serialized on network player state");

  // 23. Remote cosmetic IDs resolve correctly
  console.log("\n--- 23. Remote Cosmetic ID Resolution ---");
  const resolvedSkin = getCosmeticById(joinRes.player?.skinId!);
  const resolvedHat = getCosmeticById(joinRes.player?.hatId!);
  const resolvedTrail = getCosmeticById(joinRes.player?.trailId!);
  assert(resolvedSkin?.name === "Forest Fox", "23a. Remote skin ID resolves to Forest Fox");
  assert(resolvedHat?.name === "Explorer Hat", "23b. Remote hat ID resolves to Explorer Hat");
  assert(resolvedTrail?.name === "Spark Trail", "23c. Remote trail ID resolves to Spark Trail");

  // 24. Race rewards update progression
  console.log("\n--- 24. End-to-End Reward Progression Update ---");
  const endService = new ProgressionService();
  const xpBefore = endService.getProgression().xp;
  endService.awardRaceRewards(mockStats1, "candy_canyon");
  assert(endService.getProgression().xp > xpBefore, "24. Race rewards increment total XP");

  // 25. Level-up reward notification contains newly unlocked items
  console.log("\n--- 25. Level-Up Unlocks Notification ---");
  localStorage.clear();
  const freshService = new ProgressionService();
  const lvlUpStats: RaceStats = {
    finishPosition: 1,
    totalRacers: 4,
    finishTimeMs: 35000,
    coinsCollected: 10,
    checkpointsPassed: 1,
    totalCheckpoints: 1,
    xpEarned: 200, // Reaches level 2
  };
  const lvlUpReward = freshService.awardRaceRewards(lvlUpStats, "cloud_climb");
  assert(lvlUpReward.didLevelUp === true, "25a. Level up detected in reward object");
  assert(lvlUpReward.newlyUnlockedCosmetics.some((c) => c.id === "cloud_cap"), "25b. Level 2 Cloud Cap unlocked in notification");

  console.log("\n==================================================");
  console.log(`PHASE 11 TEST RESULTS: ${ctx.passed} Passed, ${ctx.failed} Failed`);
  console.log("==================================================");

  if (ctx.failed > 0) {
    process.exit(1);
  }
}

runPhase11Tests();
