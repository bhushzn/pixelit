import { RaceStats } from '../../types/game';
import { PowerUpDefinition } from '../powerups/types';

export type RaceState = 'READY' | 'RACING' | 'RESPAWNING' | 'FINISHED' | 'RESULTS';

export interface RaceUpdateEvent {
  timeMs: number;
  coins: number;
  checkpointReached: boolean;
  showCheckpointToast: boolean;
  progressPercent: number;
  position: number;
  totalRacers: number;
  state: RaceState;
  heldPowerUp?: PowerUpDefinition | null;
  isPowerUpActive?: boolean;
}

export type RaceUpdateListener = (data: RaceUpdateEvent) => void;
export type RaceFinishListener = (stats: RaceStats) => void;

export interface RaceManagerConfig {
  startX: number;
  finishX: number;
  totalCheckpoints?: number;
  xpEarned?: number;
  mapId?: string;
  mapTitle?: string;
}

export class RaceManager {
  private startTime = 0;
  private elapsedMs = 0;
  public state: RaceState = 'READY';

  private startX = 0;
  private finishX = 1000;
  public totalCheckpoints = 1;
  public xpEarned = 100;
  public mapId = 'cloud_climb';
  public mapTitle = 'Cloud Climb';

  private coins = 0;
  private checkpointsPassed = 0;
  private passedCheckpointIds = new Set<number>();
  private checkpointReached = false;
  private showCheckpointToast = false;
  private checkpointToastTimer = 0;
  private heldPowerUp: PowerUpDefinition | null = null;
  private isPowerUpActive = false;

  private updateListeners: RaceUpdateListener[] = [];
  private finishListeners: RaceFinishListener[] = [];

  constructor(configOrStartX: RaceManagerConfig | number, finishX?: number) {
    if (typeof configOrStartX === 'object') {
      this.startX = configOrStartX.startX;
      this.finishX = configOrStartX.finishX;
      this.totalCheckpoints = configOrStartX.totalCheckpoints ?? 1;
      this.xpEarned = configOrStartX.xpEarned ?? 100;
      this.mapId = configOrStartX.mapId ?? 'cloud_climb';
      this.mapTitle = configOrStartX.mapTitle ?? 'Cloud Climb';
    } else {
      this.startX = configOrStartX;
      this.finishX = finishX ?? 1000;
      this.totalCheckpoints = 1;
      this.xpEarned = 100;
      this.mapId = 'cloud_climb';
      this.mapTitle = 'Cloud Climb';
    }
  }

  
  public setPowerUpState(held: PowerUpDefinition | null, isActive: boolean): void {
    this.heldPowerUp = held;
    this.isPowerUpActive = isActive;
  }

  public startRace(): void {
    this.startTime = performance.now();
    this.elapsedMs = 0;
    this.state = 'RACING';
    this.coins = 0;
    this.checkpointsPassed = 0;
    this.passedCheckpointIds.clear();
    this.checkpointReached = false;
    this.showCheckpointToast = false;
    this.checkpointToastTimer = 0;
    this.notifyUpdate(this.startX);
  }

  public update(playerX: number): void {
    if (this.state !== 'RACING') return;

    this.elapsedMs = performance.now() - this.startTime;

    if (this.showCheckpointToast && performance.now() > this.checkpointToastTimer) {
      this.showCheckpointToast = false;
    }

    this.notifyUpdate(playerX);
  }

  private notifyUpdate(playerX: number): void {
    const totalDist = Math.max(1, this.finishX - this.startX);
    const playerDist = Math.max(0, playerX - this.startX);
    const progressPercent = Math.min(100, Math.floor((playerDist / totalDist) * 100));

    const eventData: RaceUpdateEvent = {
      timeMs: this.elapsedMs,
      coins: this.coins,
      checkpointReached: this.checkpointReached,
      showCheckpointToast: this.showCheckpointToast,
      progressPercent,
      position: 1, // Single player Level 1
      totalRacers: 1,
      state: this.state,
      heldPowerUp: this.heldPowerUp,
      isPowerUpActive: this.isPowerUpActive,
    };

    for (const listener of this.updateListeners) {
      listener(eventData);
    }
  }

  public addCoin(amount = 1): number {
    if (this.state !== 'RACING') return this.coins;
    this.coins += amount;
    return this.coins;
  }

  public passCheckpoint(checkpointId = 1): boolean {
    if (this.passedCheckpointIds.has(checkpointId)) {
      return false;
    }
    this.passedCheckpointIds.add(checkpointId);
    this.checkpointsPassed += 1;
    this.checkpointReached = true;
    this.showCheckpointToast = true;
    this.checkpointToastTimer = performance.now() + 2500;
    return true;
  }

  public finishRace(): RaceStats | null {
    // Only allow finishing once
    if (this.state === 'FINISHED' || this.state === 'RESULTS') {
      return null;
    }

    this.state = 'FINISHED';
    this.elapsedMs = performance.now() - this.startTime;

    const stats: RaceStats = {
      finishPosition: 1,
      totalRacers: 1,
      finishTimeMs: this.elapsedMs,
      coinsCollected: this.coins,
      checkpointsPassed: this.checkpointsPassed,
      totalCheckpoints: this.totalCheckpoints,
      xpEarned: this.xpEarned,
    };

    for (const listener of this.finishListeners) {
      listener(stats);
    }

    return stats;
  }

  public getStats(): RaceStats {
    return {
      finishPosition: 1,
      totalRacers: 1,
      finishTimeMs: this.elapsedMs,
      coinsCollected: this.coins,
      checkpointsPassed: this.checkpointsPassed,
      totalCheckpoints: this.totalCheckpoints,
      xpEarned: this.xpEarned,
    };
  }

  public onUpdate(listener: RaceUpdateListener): () => void {
    this.updateListeners.push(listener);
    return () => {
      this.updateListeners = this.updateListeners.filter((l) => l !== listener);
    };
  }

  public onFinish(listener: RaceFinishListener): () => void {
    this.finishListeners.push(listener);
    return () => {
      this.finishListeners = this.finishListeners.filter((l) => l !== listener);
    };
  }
}
