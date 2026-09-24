import { MapDefinition } from './types';
import { CLOUD_CLIMB_MAP } from './cloudClimb';
import { SKY_BRIDGE_MAP } from './skyBridge';
import { CANDY_CANYON_MAP } from './candyCanyon';
import { JUNGLE_JUMP_MAP } from './jungleJump';

export interface MapRegistryEntry {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  isPlayable: boolean;
  unlockedLevel: number;
  previewColor: string;
  mapData?: MapDefinition;
}

export const MAP_REGISTRY: Record<string, MapRegistryEntry> = {
  cloud_climb: {
    id: 'cloud_climb',
    name: 'Cloud Climb',
    subtitle: 'Sunny sky floating islands & bounce pads',
    theme: 'cloud_sky',
    isPlayable: true,
    unlockedLevel: 1,
    previewColor: '#0ea5e9',
    mapData: CLOUD_CLIMB_MAP,
  },
  sky_bridge: {
    id: 'sky_bridge',
    name: 'Sky Bridge',
    subtitle: 'High-Speed Straightaways & Windy Gaps',
    theme: 'cloud_sky',
    isPlayable: true,
    unlockedLevel: 1,
    previewColor: '#fea619',
    mapData: SKY_BRIDGE_MAP,
  },
  candy_canyon: {
    id: 'candy_canyon',
    name: 'Candy Canyon',
    subtitle: 'Sugar-Sprinkled Slopes & Gummy Trampolines',
    theme: 'candy',
    isPlayable: true,
    unlockedLevel: 1,
    previewColor: '#f43f5e',
    mapData: CANDY_CANYON_MAP,
  },
  jungle_jump: {
    id: 'jungle_jump',
    name: 'Jungle Jump',
    subtitle: 'Vibrant Canopy Branches & Ancient Ruins',
    theme: 'jungle',
    isPlayable: true,
    unlockedLevel: 1,
    previewColor: '#00b17b',
    mapData: JUNGLE_JUMP_MAP,
  },
};

export function getMapById(id: string): MapDefinition {
  const entry = MAP_REGISTRY[id];
  if (entry && entry.mapData) {
    return entry.mapData;
  }
  console.warn(`[MapRegistry] Map with id "${id}" not found or has no mapData. Falling back to Cloud Climb.`);
  return CLOUD_CLIMB_MAP;
}
