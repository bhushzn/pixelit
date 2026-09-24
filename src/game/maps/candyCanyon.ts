import { MapDefinition } from './types';

export const CANDY_CANYON_MAP: MapDefinition = {
  id: 'candy_canyon',
  name: 'Candy Canyon',
  subtitle: 'Sugar-Sprinkled Slopes & Gummy Trampolines',
  theme: 'candy',
  worldWidth: 7600,
  worldHeight: 920,
  killPlaneY: 840,
  xpReward: 200,

  startSpawn: { x: 180, y: 500 },
  checkpointSpawn: { x: 4620, y: 420 },
  playerSpawn: { x: 180, y: 500 },

  platforms: [
    // ----------------------------------------------------
    // SECTION 1: CANDY GATE (Safe Starting Island)
    // ----------------------------------------------------
    { x: 60, y: 580, width: 720, height: 260, type: 'grass' },
    { x: 520, y: 520, width: 160, height: 60, type: 'grass' },
    { x: 800, y: 500, width: 180, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 2: COOKIE CROSSING (Biscuit Platforms & Gaps)
    // ----------------------------------------------------
    // Lower standard route
    { x: 1060, y: 540, width: 200, height: 48, type: 'grass' },
    { x: 1360, y: 560, width: 220, height: 48, type: 'grass' },
    // Upper risky biscuit shortcut route
    { x: 1180, y: 420, width: 160, height: 44, type: 'cloud' },
    { x: 1460, y: 380, width: 170, height: 44, type: 'cloud' },
    { x: 1720, y: 460, width: 280, height: 260, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 3: JELLY JUMP (Bouncing Jelly Trampolines)
    // ----------------------------------------------------
    { x: 2120, y: 540, width: 200, height: 240, type: 'grass' },
    { x: 2400, y: 540, width: 140, height: 44, type: 'bounce' },
    { x: 2580, y: 360, width: 170, height: 44, type: 'cloud' },
    { x: 2820, y: 480, width: 190, height: 48, type: 'grass' },
    { x: 3080, y: 520, width: 140, height: 44, type: 'bounce' },
    { x: 3260, y: 340, width: 180, height: 44, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 4: CHOCOLATE RUN (Moving Sliders & Hazards)
    // ----------------------------------------------------
    { x: 3520, y: 460, width: 240, height: 260, type: 'grass' },
    { x: 4140, y: 440, width: 220, height: 48, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 5: CANDY CHECKPOINT (Safe Haven Island)
    // ----------------------------------------------------
    { x: 4580, y: 500, width: 580, height: 280, type: 'grass' },
    { x: 5220, y: 460, width: 190, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 6: SUGAR RUSH (Fast Gauntlet & High Altitude)
    // ----------------------------------------------------
    { x: 5460, y: 420, width: 260, height: 260, type: 'grass' },
    { x: 5800, y: 340, width: 160, height: 44, type: 'cloud' },
    { x: 6300, y: 380, width: 240, height: 48, type: 'grass' },
    { x: 6600, y: 300, width: 170, height: 44, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 7: SWEET FINISH (Grand Confectionary Finish)
    // ----------------------------------------------------
    { x: 6760, y: 480, width: 840, height: 320, type: 'grass' },
  ],

  movingPlatforms: [
    // Section 4: Chocolate slider shuttle
    {
      x: 3820,
      y: 440,
      width: 170,
      height: 44,
      distanceX: 260,
      distanceY: 0,
      speed: 110,
      type: 'hover',
    },
    // Section 4: Marshmallow vertical lift
    {
      x: 4420,
      y: 520,
      width: 160,
      height: 44,
      distanceX: 0,
      distanceY: -160,
      speed: 100,
      type: 'cloud',
    },
    // Section 6: Sugar Rush diagonal hover shuttle
    {
      x: 6020,
      y: 440,
      width: 160,
      height: 44,
      distanceX: 220,
      distanceY: -80,
      speed: 115,
      type: 'hover',
    },
  ],

  boostPads: [
    // Section 6: Island conveyor launch
    { x: 5540, y: 408, width: 120, height: 16 },
    // Section 6: Final speed gap launch
    { x: 6420, y: 368, width: 110, height: 16 },
  ],

  hazards: [
    // Section 4: Chocolate crag spike trap
    { x: 4220, y: 412, width: 50, height: 28, type: 'spike' },
    // Section 6: Sugar rush spike trap
    { x: 6340, y: 352, width: 50, height: 28, type: 'spike' },
  ],

  coins: [
    // Section 1: Candy Gate
    { x: 240, y: 520 },
    { x: 300, y: 490 },
    { x: 360, y: 520 },
    { x: 480, y: 460 },
    { x: 560, y: 460 },
    { x: 860, y: 440 },
    { x: 920, y: 440 },

    // Section 2: Cookie Crossing
    { x: 1120, y: 480 },
    { x: 1240, y: 360 },
    { x: 1300, y: 360 },
    { x: 1420, y: 500 },
    { x: 1520, y: 320 },
    { x: 1580, y: 320 },
    { x: 1800, y: 400 },
    { x: 1880, y: 400 },

    // Section 3: Jelly Jump
    { x: 2460, y: 460 },
    { x: 2460, y: 380 },
    { x: 2640, y: 300 },
    { x: 2880, y: 420 },
    { x: 3140, y: 440 },
    { x: 3140, y: 360 },
    { x: 3320, y: 280 },

    // Section 4: Chocolate Run
    { x: 3580, y: 400 },
    { x: 3880, y: 380 },
    { x: 3960, y: 380 },
    { x: 4180, y: 380 },
    { x: 4280, y: 380 },
    { x: 4480, y: 420 },
    { x: 4480, y: 340 },

    // Section 5: Candy Checkpoint
    { x: 4760, y: 440 },
    { x: 4840, y: 440 },
    { x: 4920, y: 440 },
    { x: 5000, y: 440 },
    { x: 5280, y: 400 },

    // Section 6: Sugar Rush
    { x: 5500, y: 360 },
    { x: 5600, y: 360 },
    { x: 5840, y: 280 },
    { x: 6080, y: 380 },
    { x: 6160, y: 340 },
    { x: 6380, y: 320 },
    { x: 6460, y: 320 },
    { x: 6660, y: 240 },

    // Section 7: Sweet Finish
    { x: 6840, y: 420 },
    { x: 6920, y: 420 },
    { x: 7000, y: 420 },
    { x: 7080, y: 420 },
    { x: 7160, y: 420 },
    { x: 7240, y: 420 },
    { x: 7280, y: 420 },
  ],

  checkpoints: [
    { id: 1, x: 4680, y: 500, width: 48, height: 80 },
  ],

  powerUps: [
    { x: 1720, y: 380 },
    { x: 4900, y: 420 },
  ],

  finishTrigger: {
    x: 7300,
    y: 380,
    width: 60,
    height: 120,
  },

  decorativeFinishArch: {
    x: 7360,
    y: 480,
  },

  decorativeStartArch: {
    x: 120,
    y: 580,
  },

  decorativeSigns: [
    { x: 620, y: 580, type: 'arrow' },
    { x: 1080, y: 540, type: 'arrow' },
    { x: 2140, y: 540, type: 'boost' },
    { x: 2840, y: 480, type: 'arrow' },
    { x: 3540, y: 460, type: 'arrow' },
    { x: 4160, y: 440, type: 'hazard' },
    { x: 4780, y: 500, type: 'arrow' },
    { x: 5480, y: 420, type: 'boost' },
    { x: 6280, y: 380, type: 'hazard' },
    { x: 6380, y: 380, type: 'boost' },
  ],

  scenicProps: [
    // Section 1: Candy Gate
    { x: 80, y: 580, type: 'fence_checkered' },
    { x: 150, y: 580, type: 'critter_pink' },
    { x: 210, y: 580, type: 'balloon_bundle' },
    { x: 320, y: 580, type: 'flower_tuft' },
    { x: 680, y: 580, type: 'fence_checkered' },

    // Section 2: Cookie Crossing
    { x: 1100, y: 540, type: 'flower_tuft' },
    { x: 1740, y: 460, type: 'fence_checkered' },
    { x: 1840, y: 460, type: 'critter_blue' },

    // Section 3: Jelly Jump
    { x: 2140, y: 540, type: 'fence_checkered' },
    { x: 2840, y: 480, type: 'flower_tuft' },

    // Section 4: Chocolate Run
    { x: 3540, y: 460, type: 'fence_checkered' },

    // Section 5: Candy Checkpoint
    { x: 4600, y: 500, type: 'fence_checkered' },
    { x: 4720, y: 500, type: 'balloon_bundle' },
    { x: 4760, y: 500, type: 'critter_pink' },
    { x: 4900, y: 500, type: 'flower_tuft' },
    { x: 5120, y: 500, type: 'fence_checkered' },

    // Section 6: Sugar Rush
    { x: 6320, y: 380, type: 'flower_tuft' },

    // Section 7: Sweet Finish
    { x: 6780, y: 480, type: 'fence_checkered' },
    { x: 6860, y: 480, type: 'critter_blue' },
    { x: 6900, y: 480, type: 'critter_pink' },
    { x: 6980, y: 480, type: 'flower_tuft' },
    { x: 7180, y: 480, type: 'balloon_bundle' },
    { x: 7260, y: 480, type: 'balloon_bundle' },
    { x: 7420, y: 480, type: 'critter_pink' },
    { x: 7480, y: 480, type: 'fence_checkered' },
  ],

  finishLine: {
    x: 7300,
    y: 380,
    width: 60,
    height: 120,
  },
};
