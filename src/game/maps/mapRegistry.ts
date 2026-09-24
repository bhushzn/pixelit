import { MapDefinition } from './types';
import { CLOUD_CLIMB_MAP } from './cloudClimb';

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
    subtitle: 'High-speed straightaways and windy gaps',
    theme: 'rainbow',
    isPlayable: false,
    unlockedLevel: 3,
    previewColor: '#fea619',
  },
  candy_canyon: {
    id: 'candy_canyon',
    name: 'Candy Canyon',
    subtitle: 'Sugar-sprinkled slopes and gummy trampolines',
    theme: 'candy',
    isPlayable: false,
    unlockedLevel: 5,
    previewColor: '#f43f5e',
  },
  jungle_jump: {
    id: 'jungle_jump',
    name: 'Jungle Jump',
    subtitle: 'Vibrant canopy branches and swinging vines',
    theme: 'jungle',
    isPlayable: false,
    unlockedLevel: 8,
    previewColor: '#00b17b',
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
