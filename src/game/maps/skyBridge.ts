import { MapDefinition } from './types';

export const SKY_BRIDGE_MAP: MapDefinition = {
  id: 'sky_bridge',
  name: 'Sky Bridge',
  subtitle: 'High-Speed Straightaways & Windy Gaps',
  theme: 'cloud_sky',
  worldWidth: 7200,
  worldHeight: 900,
  killPlaneY: 820,
  xpReward: 150,

  startSpawn: { x: 180, y: 480 },
  checkpointSpawn: { x: 4420, y: 400 },
  playerSpawn: { x: 180, y: 480 },

  platforms: [
    // ----------------------------------------------------
    // SECTION 1: CLOUD GATE (Safe Starting Island)
    // ----------------------------------------------------
    { x: 60, y: 560, width: 700, height: 260, type: 'grass' },
    { x: 500, y: 500, width: 160, height: 60, type: 'grass' },
    { x: 780, y: 480, width: 180, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 2: BROKEN BRIDGES (Multi-Route Gaps)
    // ----------------------------------------------------
    // Lower standard route
    { x: 1040, y: 520, width: 200, height: 48, type: 'grass' },
    { x: 1340, y: 540, width: 220, height: 48, type: 'grass' },
    // Upper risky shortcut route
    { x: 1160, y: 400, width: 160, height: 44, type: 'cloud' },
    { x: 1440, y: 360, width: 160, height: 44, type: 'cloud' },
    { x: 1700, y: 440, width: 260, height: 260, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 3: WIND PASS (Narrow Stepping & Canyon)
    // ----------------------------------------------------
    { x: 2060, y: 520, width: 220, height: 240, type: 'grass' },
    { x: 2720, y: 460, width: 220, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 4: SKY ISLANDS (Elevations & Trampoline)
    // ----------------------------------------------------
    { x: 3280, y: 440, width: 280, height: 260, type: 'grass' },
    { x: 3660, y: 360, width: 180, height: 44, type: 'cloud' },
    { x: 3760, y: 540, width: 220, height: 48, type: 'grass' },
    { x: 3900, y: 540, width: 140, height: 44, type: 'bounce' },
    { x: 4080, y: 320, width: 220, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 5: CHECKPOINT HAVEN (Recovery Island)
    // ----------------------------------------------------
    { x: 4320, y: 480, width: 560, height: 280, type: 'grass' },
    { x: 4940, y: 440, width: 200, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 6: HIGH ALTITUDE (Climactic Aerial Gauntlet)
    // ----------------------------------------------------
    { x: 5200, y: 380, width: 180, height: 44, type: 'cloud' },
    { x: 5760, y: 360, width: 240, height: 48, type: 'grass' },
    { x: 6060, y: 300, width: 180, height: 44, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 7: GRAND SKY FINISH (Podium Landing Island)
    // ----------------------------------------------------
    { x: 6280, y: 460, width: 800, height: 320, type: 'grass' },
  ],

  movingPlatforms: [
    // Section 3: Wind Pass horizontal shuttle
    {
      x: 2360,
      y: 480,
      width: 180,
      height: 44,
      distanceX: 280,
      distanceY: 0,
      speed: 110,
      type: 'hover',
    },
    // Section 3: Wind Pass vertical lift
    {
      x: 3020,
      y: 520,
      width: 170,
      height: 44,
      distanceX: 0,
      distanceY: -150,
      speed: 95,
      type: 'cloud',
    },
    // Section 6: High Altitude shuttle
    {
      x: 5440,
      y: 420,
      width: 170,
      height: 44,
      distanceX: 240,
      distanceY: -60,
      speed: 105,
      type: 'hover',
    },
  ],

  boostPads: [
    // Section 4: Island Launch
    { x: 3340, y: 428, width: 120, height: 16 },
    // Section 6: High Speed Gap Launch
    { x: 5880, y: 348, width: 110, height: 16 },
  ],

  hazards: [
    // Section 3: Spike on stepping cloud
    { x: 2800, y: 432, width: 50, height: 28, type: 'spike' },
    // Section 6: High Altitude spike trap
    { x: 5800, y: 332, width: 50, height: 28, type: 'spike' },
  ],

  coins: [
    // Section 1: Cloud Gate
    { x: 240, y: 500 },
    { x: 300, y: 470 },
    { x: 360, y: 500 },
    { x: 480, y: 440 },
    { x: 560, y: 440 },
    { x: 840, y: 420 },
    { x: 900, y: 420 },

    // Section 2: Broken Bridges (Routes & Shortcuts)
    { x: 1100, y: 460 },
    { x: 1220, y: 340 },
    { x: 1280, y: 340 },
    { x: 1400, y: 480 },
    { x: 1500, y: 300 },
    { x: 1560, y: 300 },
    { x: 1780, y: 380 },
    { x: 1860, y: 380 },

    // Section 3: Wind Pass
    { x: 2420, y: 420 },
    { x: 2500, y: 400 },
    { x: 2600, y: 420 },
    { x: 2760, y: 400 },
    { x: 2880, y: 400 },
    { x: 3080, y: 360 },

    // Section 4: Sky Islands
    { x: 3380, y: 380 },
    { x: 3460, y: 380 },
    { x: 3700, y: 300 },
    { x: 3940, y: 480 },
    { x: 3970, y: 260 },
    { x: 4120, y: 260 },
    { x: 4200, y: 260 },

    // Section 5: Checkpoint Haven
    { x: 4560, y: 420 },
    { x: 4640, y: 420 },
    { x: 4720, y: 420 },
    { x: 4980, y: 380 },
    { x: 5060, y: 380 },

    // Section 6: High Altitude
    { x: 5260, y: 320 },
    { x: 5520, y: 360 },
    { x: 5600, y: 340 },
    { x: 5780, y: 300 },
    { x: 5920, y: 300 },
    { x: 6120, y: 240 },

    // Section 7: Grand Sky Finish
    { x: 6360, y: 400 },
    { x: 6440, y: 400 },
    { x: 6520, y: 400 },
    { x: 6600, y: 400 },
    { x: 6680, y: 400 },
    { x: 6760, y: 400 },
    { x: 6820, y: 400 },
  ],

  checkpoints: [
    { id: 1, x: 4460, y: 480, width: 48, height: 80 },
  ],

  powerUps: [
    { x: 1700, y: 360 },
    { x: 4600, y: 420 },
  ],

  finishTrigger: {
    x: 6860,
    y: 360,
    width: 60,
    height: 120,
  },

  decorativeFinishArch: {
    x: 6920,
    y: 460,
  },

  decorativeStartArch: {
    x: 120,
    y: 560,
  },

  decorativeSigns: [
    { x: 620, y: 560, type: 'arrow' },
    { x: 1060, y: 520, type: 'arrow' },
    { x: 2120, y: 520, type: 'arrow' },
    { x: 2740, y: 460, type: 'hazard' },
    { x: 3300, y: 440, type: 'boost' },
    { x: 4600, y: 480, type: 'arrow' },
    { x: 5740, y: 360, type: 'hazard' },
    { x: 5840, y: 360, type: 'boost' },
  ],

  scenicProps: [
    // Section 1: Starting Island
    { x: 80, y: 560, type: 'fence_checkered' },
    { x: 150, y: 560, type: 'critter_blue' },
    { x: 210, y: 560, type: 'balloon_bundle' },
    { x: 320, y: 560, type: 'flower_tuft' },
    { x: 660, y: 560, type: 'fence_checkered' },

    // Section 2: Broken Bridges
    { x: 1080, y: 520, type: 'flower_tuft' },
    { x: 1720, y: 440, type: 'fence_checkered' },
    { x: 1820, y: 440, type: 'critter_pink' },

    // Section 3: Wind Pass
    { x: 2080, y: 520, type: 'fence_checkered' },

    // Section 4: Sky Islands
    { x: 3320, y: 440, type: 'flower_tuft' },
    { x: 3800, y: 540, type: 'fence_checkered' },

    // Section 5: Checkpoint Haven
    { x: 4340, y: 480, type: 'fence_checkered' },
    { x: 4500, y: 480, type: 'balloon_bundle' },
    { x: 4540, y: 480, type: 'critter_blue' },
    { x: 4680, y: 480, type: 'flower_tuft' },
    { x: 4840, y: 480, type: 'fence_checkered' },

    // Section 6: High Altitude
    { x: 5780, y: 360, type: 'flower_tuft' },

    // Section 7: Grand Sky Finish
    { x: 6300, y: 460, type: 'fence_checkered' },
    { x: 6380, y: 460, type: 'critter_blue' },
    { x: 6420, y: 460, type: 'critter_pink' },
    { x: 6500, y: 460, type: 'flower_tuft' },
    { x: 6720, y: 460, type: 'balloon_bundle' },
    { x: 6800, y: 460, type: 'balloon_bundle' },
    { x: 6980, y: 460, type: 'critter_blue' },
    { x: 7040, y: 460, type: 'fence_checkered' },
  ],

  finishLine: {
    x: 6860,
    y: 360,
    width: 60,
    height: 120,
  },
};
