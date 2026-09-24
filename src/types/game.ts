export interface RaceStats {
  finishPosition: number;
  totalRacers: number;
  finishTimeMs: number;
  coinsCollected: number;
  checkpointsPassed: number;
  totalCheckpoints: number;
  xpEarned: number;
}

export type GameScreen = 'title' | 'lobby' | 'modes' | 'race' | 'results' | 'friends' | 'party';

export type GameModeId = 'quick_race' | 'team_rush' | 'time_trial' | 'custom_room';

export interface GameModeInfo {
  id: GameModeId;
  title: string;
  subtitle: string;
  tag: string;
  maxPlayers: number;
  description: string;
  rewardMultiplier: string;
}

export interface PlayerCustomization {
  name: string;
  level: number;
  title: string;
  coins: number;
  gems: number;
  equippedSkin: string;
  equippedSneakers: string;
}
