/**
 * Remote Player Snapshot Interpolation & Local Prediction Buffer
 */

import { PlayerNetworkState } from "./networkTypes";

export interface SnapshotEntry {
  timestamp: number;
  state: PlayerNetworkState;
}

export class RemotePlayerInterpolator {
  private buffer: SnapshotEntry[] = [];
  public interpolationDelayMs = 100; // 100ms render buffer for jitter-free smoothing

  public pushSnapshot(state: PlayerNetworkState, timestamp: number = Date.now()): void {
    this.buffer.push({ timestamp, state: { ...state } });
    // Keep max 30 snapshots (~1.5s history at 20Hz)
    if (this.buffer.length > 30) {
      this.buffer.shift();
    }
  }

  public getInterpolatedState(renderTimestamp: number = Date.now()): PlayerNetworkState | null {
    if (this.buffer.length === 0) return null;
    if (this.buffer.length === 1) return this.buffer[0].state;

    const targetTime = renderTimestamp - this.interpolationDelayMs;

    // If target time is before oldest snapshot, return oldest
    if (targetTime <= this.buffer[0].timestamp) {
      return this.buffer[0].state;
    }

    // If target time is after newest snapshot, extrapolate smoothly
    const newest = this.buffer[this.buffer.length - 1];
    if (targetTime >= newest.timestamp) {
      return newest.state;
    }

    // Find bounding snapshots
    for (let i = 0; i < this.buffer.length - 1; i++) {
      const prev = this.buffer[i];
      const next = this.buffer[i + 1];

      if (targetTime >= prev.timestamp && targetTime <= next.timestamp) {
        const timeDiff = next.timestamp - prev.timestamp;
        const alpha = timeDiff > 0 ? (targetTime - prev.timestamp) / timeDiff : 1;

        return {
          ...next.state,
          x: prev.state.x + (next.state.x - prev.state.x) * alpha,
          y: prev.state.y + (next.state.y - prev.state.y) * alpha,
          vx: prev.state.vx + (next.state.vx - prev.state.vx) * alpha,
          vy: prev.state.vy + (next.state.vy - prev.state.vy) * alpha,
        };
      }
    }

    return newest.state;
  }

  public sample(renderTimestamp: number = Date.now()): PlayerNetworkState | null {
    return this.getInterpolatedState(renderTimestamp);
  }

  public clear(): void {
    this.buffer = [];
  }
}
