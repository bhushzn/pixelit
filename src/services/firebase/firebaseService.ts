/**
 * Firebase Social & Persistence Architecture
 * Designed for asynchronous profile storage, leaderboard ranks, friend lists, and party metadata.
 * Live gameplay synchronization remains on dedicated real-time networking.
 */

export interface FriendEntry {
  uid: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  statusText: string;
  currentRoomCode?: string;
}

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  displayName: string;
  bestTimeMs: number;
  trophies: number;
  tier: string;
}

export interface FirebaseSocialService {
  getFriends(uid: string): Promise<FriendEntry[]>;
  sendFriendInvite(friendUid: string): Promise<boolean>;
  getGlobalLeaderboard(mapId: string, limitCount?: number): Promise<LeaderboardEntry[]>;
  saveRaceResult(uid: string, mapId: string, timeMs: number, coins: number): Promise<void>;
}

class LocalMockFirebaseService implements FirebaseSocialService {
  async getFriends(): Promise<FriendEntry[]> {
    return [
      { uid: 'f1', displayName: 'Nova', avatar: '🐱', isOnline: true, statusText: 'In Lobby' },
      { uid: 'f2', displayName: 'Blaze', avatar: '🐰', isOnline: true, statusText: 'Speed Derby' },
      { uid: 'f3', displayName: 'Pixel', avatar: '🤖', isOnline: true, statusText: 'Ready' },
      { uid: 'f4', displayName: 'Cosmo', avatar: '🦊', isOnline: false, statusText: 'Offline 2h' },
    ];
  }

  async sendFriendInvite(): Promise<boolean> {
    return true;
  }

  async getGlobalLeaderboard(mapId: string, limitCount = 10): Promise<LeaderboardEntry[]> {
    return [
      { rank: 1, uid: 'p1', displayName: 'SkyDASH_01', bestTimeMs: 44120, trophies: 3200, tier: 'Grand Master' },
      { rank: 2, uid: 'p2', displayName: 'CloudRacer', bestTimeMs: 46890, trophies: 2850, tier: 'Master' },
      { rank: 3, uid: 'p3', displayName: 'Pip', bestTimeMs: 48240, trophies: 1420, tier: 'Speedster' },
      { rank: 4, uid: 'p4', displayName: 'BunnyHop', bestTimeMs: 49500, trophies: 1350, tier: 'Gold III' },
    ].slice(0, limitCount);
  }

  async saveRaceResult(): Promise<void> {
    // Persistent stats hook
  }
}

export const firebaseSocialService: FirebaseSocialService = new LocalMockFirebaseService();
