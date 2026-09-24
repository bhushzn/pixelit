export interface PowerUpPickupDef {
  x: number;
  y: number;
  id?: string;
  pool?: string;
}

export interface PlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'grass' | 'cloud' | 'bounce' | 'boost' | 'wood';
}

export interface MovingPlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  distanceX: number;
  distanceY: number;
  speed: number;
  type?: 'cloud' | 'hover';
}

export interface HazardDef {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'spinner' | 'bumper';
}

export interface CoinDef {
  x: number;
  y: number;
  value?: number;
}

export interface CheckpointDef {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FinishLineDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignDef {
  x: number;
  y: number;
  type: 'arrow' | 'start' | 'hazard' | 'boost';
}

export interface ScenicPropDef {
  x: number;
  y: number;
  type: 'flower_tuft' | 'fence_checkered' | 'critter_blue' | 'critter_pink' | 'balloon_bundle' | 'windmill';
}

export interface BoostPadDef {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapDefinition {
  id: string;
  name: string;
  subtitle: string;
  theme: 'cloud_sky' | 'candy' | 'jungle' | 'rainbow';
  worldWidth: number;
  worldHeight: number;
  killPlaneY: number;
  startSpawn: { x: number; y: number };
  checkpointSpawn: { x: number; y: number };
  playerSpawn: { x: number; y: number };
  platforms: PlatformDef[];
  movingPlatforms: MovingPlatformDef[];
  boostPads: BoostPadDef[];
  hazards: HazardDef[];
  coins: CoinDef[];
  checkpoints: CheckpointDef[];
  finishTrigger: FinishLineDef;
  decorativeFinishArch: { x: number; y: number };
  decorativeStartArch: { x: number; y: number };
  decorativeSigns: SignDef[];
  scenicProps?: ScenicPropDef[];
  finishLine: FinishLineDef;
  powerUps?: PowerUpPickupDef[];
  xpReward?: number;
}
