import { MapDefinition } from './types';

export const JUNGLE_JUMP_MAP: MapDefinition = {
  id: 'jungle_jump',
  name: 'Jungle Jump',
  subtitle: 'Vibrant Canopy Branches & Ancient Ruins',
  theme: 'jungle',
  worldWidth: 8000,
  worldHeight: 960,
  killPlaneY: 880,
  xpReward: 250,

  startSpawn: { x: 180, y: 520 },
  checkpointSpawn: { x: 4860, y: 440 },
  playerSpawn: { x: 180, y: 520 },

  platforms: [
    // ----------------------------------------------------
    // SECTION 1: JUNGLE GATE (Safe Starting Clearing)
    // ----------------------------------------------------
    { x: 60, y: 600, width: 740, height: 260, type: 'grass' },
    { x: 540, y: 540, width: 160, height: 60, type: 'grass' },
    { x: 820, y: 520, width: 180, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 2: VINE TRAIL (Staggered Canopy Paths)
    // ----------------------------------------------------
    // Lower jungle path
    { x: 1080, y: 560, width: 200, height: 48, type: 'grass' },
    { x: 1380, y: 580, width: 220, height: 48, type: 'grass' },
    // High vine canopy shortcut
    { x: 1200, y: 440, width: 160, height: 44, type: 'cloud' },
    { x: 1480, y: 400, width: 170, height: 44, type: 'cloud' },
    { x: 1760, y: 480, width: 280, height: 260, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 3: WATERFALL RUN (Gorge & Bounce Trampoline)
    // ----------------------------------------------------
    { x: 2160, y: 560, width: 200, height: 240, type: 'grass' },
    { x: 2820, y: 500, width: 220, height: 48, type: 'grass' },
    { x: 3120, y: 540, width: 140, height: 44, type: 'bounce' },
    { x: 3300, y: 340, width: 180, height: 44, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 4: ANCIENT RUINS (Temple Terraces & Pillars)
    // ----------------------------------------------------
    { x: 3560, y: 480, width: 260, height: 260, type: 'grass' },
    { x: 4160, y: 360, width: 200, height: 48, type: 'grass' },
    { x: 4420, y: 520, width: 220, height: 48, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 5: JUNGLE CHECKPOINT (Lush Haven Clearing)
    // ----------------------------------------------------
    { x: 4760, y: 520, width: 620, height: 280, type: 'grass' },
    { x: 5460, y: 480, width: 200, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 6: CANOPY RUSH (Apex Gauntlet & Speed Launch)
    // ----------------------------------------------------
    { x: 5720, y: 440, width: 260, height: 260, type: 'grass' },
    { x: 6060, y: 340, width: 170, height: 44, type: 'cloud' },
    { x: 6620, y: 380, width: 240, height: 48, type: 'grass' },
    { x: 6940, y: 300, width: 180, height: 44, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 7: TEMPLE FINISH (Grand Ancient Terrace)
    // ----------------------------------------------------
    { x: 7120, y: 500, width: 880, height: 320, type: 'grass' },
  ],

  movingPlatforms: [
    // Section 3: Waterfall gorge shuttle
    {
      x: 2460,
      y: 520,
      width: 170,
      height: 44,
      distanceX: 260,
      distanceY: 0,
      speed: 110,
      type: 'hover',
    },
    // Section 4: Ancient stone elevator
    {
      x: 3900,
      y: 540,
      width: 170,
      height: 44,
      distanceX: 0,
      distanceY: -160,
      speed: 100,
      type: 'cloud',
    },
    // Section 6: Diagonal canopy hover shuttle
    {
      x: 6300,
      y: 460,
      width: 170,
      height: 44,
      distanceX: 240,
      distanceY: -90,
      speed: 120,
      type: 'hover',
    },
  ],

  boostPads: [
    // Section 6: Canopy conveyor launch
    { x: 5800, y: 428, width: 120, height: 16 },
    // Section 6: Apex speed launch pad
    { x: 6740, y: 368, width: 110, height: 16 },
  ],

  hazards: [
    // Section 3: Waterfall gorge spike trap
    { x: 2880, y: 472, width: 50, height: 28, type: 'spike' },
    // Section 4: Ancient ruins terrace spike
    { x: 4240, y: 332, width: 40, height: 28, type: 'spike' },
    // Section 6: Canopy rush spike trap
    { x: 6660, y: 352, width: 50, height: 28, type: 'spike' },
  ],

  coins: [
    // Section 1: Jungle Gate
    { x: 240, y: 540 },
    { x: 300, y: 510 },
    { x: 360, y: 540 },
    { x: 480, y: 480 },
    { x: 580, y: 480 },
    { x: 880, y: 460 },
    { x: 940, y: 460 },

    // Section 2: Vine Trail
    { x: 1140, y: 500 },
    { x: 1260, y: 380 },
    { x: 1320, y: 380 },
    { x: 1440, y: 520 },
    { x: 1540, y: 340 },
    { x: 1600, y: 340 },
    { x: 1840, y: 420 },
    { x: 1920, y: 420 },

    // Section 3: Waterfall Run
    { x: 2520, y: 460 },
    { x: 2600, y: 460 },
    { x: 2840, y: 440 },
    { x: 2940, y: 440 },
    { x: 3180, y: 460 },
    { x: 3180, y: 380 },
    { x: 3360, y: 280 },

    // Section 4: Ancient Ruins
    { x: 3620, y: 420 },
    { x: 3960, y: 480 },
    { x: 3960, y: 400 },
    { x: 4200, y: 300 },
    { x: 4280, y: 300 },
    { x: 4480, y: 460 },
    { x: 4560, y: 460 },

    // Section 5: Jungle Checkpoint
    { x: 4960, y: 460 },
    { x: 5040, y: 460 },
    { x: 5120, y: 460 },
    { x: 5200, y: 460 },
    { x: 5520, y: 420 },

    // Section 6: Canopy Rush
    { x: 5760, y: 380 },
    { x: 5860, y: 380 },
    { x: 6120, y: 280 },
    { x: 6360, y: 400 },
    { x: 6460, y: 360 },
    { x: 6700, y: 320 },
    { x: 6780, y: 320 },
    { x: 7000, y: 240 },

    // Section 7: Temple Finish
    { x: 7200, y: 440 },
    { x: 7280, y: 440 },
    { x: 7360, y: 440 },
    { x: 7440, y: 440 },
    { x: 7520, y: 440 },
    { x: 7600, y: 440 },
    { x: 7660, y: 440 },
  ],

  checkpoints: [
    { id: 1, x: 4880, y: 520, width: 48, height: 80 },
  ],

  powerUps: [
    { x: 1760, y: 400 },
    { x: 3560, y: 400 },
    { x: 5100, y: 440 },
  ],

  finishTrigger: {
    x: 7680,
    y: 400,
    width: 60,
    height: 120,
  },

  decorativeFinishArch: {
    x: 7740,
    y: 500,
  },

  decorativeStartArch: {
    x: 120,
    y: 600,
  },

  decorativeSigns: [
    { x: 620, y: 600, type: 'arrow' },
    { x: 1100, y: 560, type: 'arrow' },
    { x: 2180, y: 560, type: 'arrow' },
    { x: 2800, y: 500, type: 'hazard' },
    { x: 3580, y: 480, type: 'arrow' },
    { x: 4180, y: 360, type: 'hazard' },
    { x: 4980, y: 520, type: 'arrow' },
    { x: 5740, y: 440, type: 'boost' },
    { x: 6600, y: 380, type: 'hazard' },
    { x: 6700, y: 380, type: 'boost' },
  ],

  scenicProps: [
    // Section 1: Jungle Gate
    { x: 80, y: 600, type: 'fence_checkered' },
    { x: 150, y: 600, type: 'critter_blue' },
    { x: 210, y: 600, type: 'balloon_bundle' },
    { x: 320, y: 600, type: 'flower_tuft' },
    { x: 700, y: 600, type: 'fence_checkered' },

    // Section 2: Vine Trail
    { x: 1120, y: 560, type: 'flower_tuft' },
    { x: 1780, y: 480, type: 'fence_checkered' },
    { x: 1880, y: 480, type: 'critter_pink' },

    // Section 3: Waterfall Run
    { x: 2180, y: 560, type: 'fence_checkered' },
    { x: 2860, y: 500, type: 'flower_tuft' },

    // Section 4: Ancient Ruins
    { x: 3580, y: 480, type: 'fence_checkered' },

    // Section 5: Jungle Checkpoint
    { x: 4800, y: 520, type: 'fence_checkered' },
    { x: 4920, y: 520, type: 'balloon_bundle' },
    { x: 4960, y: 520, type: 'critter_blue' },
    { x: 5100, y: 520, type: 'flower_tuft' },
    { x: 5320, y: 520, type: 'fence_checkered' },

    // Section 6: Canopy Rush
    { x: 6640, y: 380, type: 'flower_tuft' },

    // Section 7: Temple Finish
    { x: 7140, y: 500, type: 'fence_checkered' },
    { x: 7220, y: 500, type: 'critter_blue' },
    { x: 7260, y: 500, type: 'critter_pink' },
    { x: 7340, y: 500, type: 'flower_tuft' },
    { x: 7560, y: 500, type: 'balloon_bundle' },
    { x: 7640, y: 500, type: 'balloon_bundle' },
    { x: 7800, y: 500, type: 'critter_blue' },
    { x: 7860, y: 500, type: 'fence_checkered' },
  ],

  finishLine: {
    x: 7680,
    y: 400,
    width: 60,
    height: 120,
  },
};
