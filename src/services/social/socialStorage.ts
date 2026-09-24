import { Friend, FriendRequest, PartyState, PlayerProfile } from './socialTypes';

const NAMESPACE = 'pixel_rush_social_';

export class SocialStorage {
  private static getKey(key: string): string {
    return NAMESPACE + key;
  }

  public static loadProfile(): PlayerProfile {
    try {
      const raw = localStorage.getItem(this.getKey('profile'));
      if (raw) return JSON.parse(raw);
    } catch {}
    
    // Default Prototype Profile
    return {
      id: 'local_player_1',
      username: 'Pip',
      displayName: 'Pip',
      avatarId: 'pixel_runner_01',
      level: 12,
      xp: 1420,
      coins: 4850,
      status: 'online',
      createdAt: Date.now(),
    };
  }

  public static saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(this.getKey('profile'), JSON.stringify(profile));
    } catch {}
  }

  public static loadFriends(): Friend[] {
    try {
      const raw = localStorage.getItem(this.getKey('friends'));
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  public static saveFriends(friends: Friend[]): void {
    try {
      localStorage.setItem(this.getKey('friends'), JSON.stringify(friends));
    } catch {}
  }

  public static loadFriendRequests(): FriendRequest[] {
    try {
      const raw = localStorage.getItem(this.getKey('friend_requests'));
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }

  public static saveFriendRequests(requests: FriendRequest[]): void {
    try {
      localStorage.setItem(this.getKey('friend_requests'), JSON.stringify(requests));
    } catch {}
  }

  public static loadPartyState(): PartyState | null {
    try {
      const raw = localStorage.getItem(this.getKey('party_state'));
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  public static savePartyState(party: PartyState | null): void {
    try {
      if (party) {
        localStorage.setItem(this.getKey('party_state'), JSON.stringify(party));
      } else {
        localStorage.removeItem(this.getKey('party_state'));
      }
    } catch {}
  }

  public static clearParty(): void {
    try {
      localStorage.removeItem(this.getKey('party_state'));
    } catch {}
  }
}
