import { MapDefinition } from './types';

export const CLOUD_CLIMB_MAP: MapDefinition = {
  id: 'cloud_climb',
  name: 'Cloud Climb',
  subtitle: 'Level 1: Sky Sprint',
  theme: 'cloud_sky',
  worldWidth: 6800,
  worldHeight: 850,
  killPlaneY: 760,

  startSpawn: { x: 180, y: 460 },
  checkpointSpawn: { x: 4220, y: 400 },
  playerSpawn: { x: 180, y: 460 },

  platforms: [
    // ----------------------------------------------------
    // SECTION 1: START (Safe Starting Island)
    // ----------------------------------------------------
    { x: 60, y: 540, width: 680, height: 260, type: 'grass' },
    { x: 440, y: 480, width: 140, height: 60, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 2: EASY PLATFORMING (Stepping Clouds & Boost)
    // ----------------------------------------------------
    { x: 820, y: 510, width: 220, height: 48, type: 'cloud' },
    { x: 1120, y: 470, width: 220, height: 48, type: 'cloud' },
    { x: 1420, y: 520, width: 440, height: 260, type: 'grass' },
    { x: 1960, y: 500, width: 200, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 3: MOVING PLATFORM (Scenic Cloud Canyon)
    // ----------------------------------------------------
    { x: 2240, y: 520, width: 240, height: 260, type: 'grass' },
    { x: 2980, y: 520, width: 320, height: 260, type: 'grass' },

    // ----------------------------------------------------
    // SECTION 4: HAZARD SECTION (Cartoon Spikes & Trampoline)
    // ----------------------------------------------------
    { x: 3380, y: 510, width: 440, height: 260, type: 'grass' },
    { x: 3500, y: 390, width: 130, height: 44, type: 'cloud' },
    { x: 3900, y: 520, width: 150, height: 44, type: 'bounce' },

    // ----------------------------------------------------
    // SECTION 5: CHECKPOINT (Safe Haven Island)
    // ----------------------------------------------------
    { x: 4120, y: 480, width: 520, height: 280, type: 'grass' },
    { x: 4720, y: 450, width: 200, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 6: FINAL CLIMB (High Aerial Steps)
    // ----------------------------------------------------
    { x: 5260, y: 300, width: 200, height: 48, type: 'cloud' },
    { x: 5540, y: 340, width: 240, height: 48, type: 'cloud' },
    { x: 5860, y: 400, width: 240, height: 48, type: 'cloud' },

    // ----------------------------------------------------
    // SECTION 7: FINISH (Grand Victory Podium Island)
    // ----------------------------------------------------
    { x: 6180, y: 460, width: 620, height: 320, type: 'grass' },
  ],

  movingPlatforms: [
    // Moving Platform 1: Horizontal shuttle across wide cloud canyon
    {
      x: 2540,
      y: 520,
      width: 190,
      height: 48,
      distanceX: 360,
      distanceY: 0,
      speed: 100,
      type: 'hover',
    },
    // Moving Platform 2: Vertical elevator cloud up to High Steps
    {
      x: 5000,
      y: 460,
      width: 180,
      height: 48,
      distanceX: 0,
      distanceY: -160,
      speed: 85,
      type: 'cloud',
    },
  ],

  boostPads: [
    { x: 1540, y: 508, width: 120, height: 16 },
    { x: 5600, y: 328, width: 120, height: 16 },
  ],

  hazards: [
    // Playful cartoon coral spike in hazard section
    { x: 3540, y: 482, width: 50, height: 28, type: 'spike' },
  ],

  coins: [
    // Section 1: Starting Guide Coins
    { x: 260, y: 480 },
    { x: 320, y: 450 },
    { x: 380, y: 480 },
    { x: 510, y: 420 },

    // Section 2: Stepping Clouds & Island
    { x: 890, y: 450 },
    { x: 970, y: 450 },
    { x: 1190, y: 410 },
    { x: 1270, y: 410 },
    { x: 1520, y: 460 },
    { x: 1600, y: 460 },
    { x: 1680, y: 460 },
    { x: 1760, y: 460 },
    { x: 2030, y: 440 },
    { x: 2090, y: 440 },

    // Section 3: Over the Shuttle Canyon
    { x: 2620, y: 440 },
    { x: 2720, y: 420 },
    { x: 2820, y: 440 },
    { x: 3060, y: 460 },
    { x: 3160, y: 460 },

    // Section 4: Hazard and Bounce Pad
    { x: 3560, y: 330 },
    { x: 3640, y: 450 },
    { x: 3970, y: 360 },
    { x: 3970, y: 280 },
    { x: 4050, y: 310 },

    // Section 5: Checkpoint Haven & Approach
    { x: 4380, y: 420 },
    { x: 4460, y: 420 },
    { x: 4790, y: 390 },
    { x: 4850, y: 390 },

    // Section 6: Elevator & High Cloud Sprint
    { x: 5090, y: 380 },
    { x: 5090, y: 290 },
    { x: 5320, y: 240 },
    { x: 5390, y: 240 },
    { x: 5590, y: 280 },
    { x: 5670, y: 280 },
    { x: 5740, y: 280 },
    { x: 5940, y: 340 },
    { x: 6020, y: 340 },

    // Section 7: Grand Finish Victory Run
    { x: 6260, y: 400 },
    { x: 6340, y: 400 },
    { x: 6420, y: 400 },
  ],

  // Checkpoint: single clear checkpoint for Level 1 midway
  checkpoints: [
    { id: 1, x: 4260, y: 480, width: 48, height: 80 },
  ],

  // Separate invisible finish trigger (does NOT block player, triggers once)
  finishTrigger: {
    x: 6460,
    y: 360,
    width: 60,
    height: 120,
  },

  // Grand decorative finish banner location
  decorativeFinishArch: {
    x: 6520,
    y: 460,
  },

  decorativeStartArch: {
    x: 120,
    y: 540,
  },

  decorativeSigns: [
    { x: 620, y: 540, type: 'arrow' },
    { x: 1480, y: 520, type: 'boost' },
    { x: 2380, y: 520, type: 'arrow' },
    { x: 3460, y: 510, type: 'hazard' },
    { x: 4560, y: 480, type: 'arrow' },
    { x: 5540, y: 340, type: 'boost' },
  ],

  scenicProps: [
    // Starting Island (Festive atmosphere)
    { x: 80, y: 540, type: 'fence_checkered' },
    { x: 150, y: 540, type: 'critter_blue' },
    { x: 210, y: 540, type: 'critter_pink' },
    { x: 240, y: 540, type: 'balloon_bundle' },
    { x: 340, y: 540, type: 'flower_tuft' },
    { x: 470, y: 480, type: 'flower_tuft' },
    { x: 670, y: 540, type: 'fence_checkered' },

    // Section 2: Stepping Island
    { x: 1440, y: 520, type: 'flower_tuft' },
    { x: 1780, y: 520, type: 'flower_tuft' },
    { x: 1820, y: 520, type: 'fence_checkered' },

    // Section 3: Shuttle Overlook
    { x: 2260, y: 520, type: 'fence_checkered' },
    { x: 3000, y: 520, type: 'flower_tuft' },
    { x: 3220, y: 520, type: 'flower_tuft' },

    // Section 4: Before Hazards
    { x: 3410, y: 510, type: 'flower_tuft' },

    // Section 5: Checkpoint Haven
    { x: 4140, y: 480, type: 'fence_checkered' },
    { x: 4320, y: 480, type: 'balloon_bundle' },
    { x: 4360, y: 480, type: 'critter_blue' },
    { x: 4480, y: 480, type: 'flower_tuft' },
    { x: 4610, y: 480, type: 'fence_checkered' },

    // Section 7: Grand Victory Podium Island
    { x: 6200, y: 460, type: 'fence_checkered' },
    { x: 6240, y: 460, type: 'critter_blue' },
    { x: 6270, y: 460, type: 'critter_pink' },
    { x: 6310, y: 460, type: 'flower_tuft' },
    { x: 6480, y: 460, type: 'balloon_bundle' },
    { x: 6580, y: 460, type: 'balloon_bundle' },
    { x: 6610, y: 460, type: 'critter_pink' },
    { x: 6640, y: 460, type: 'critter_blue' },
    { x: 6710, y: 460, type: 'fence_checkered' },
  ],

  finishLine: {
    x: 6460,
    y: 360,
    width: 60,
    height: 120,
  },
};
