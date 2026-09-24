import { Friend, FriendRequest, PlayerProfile } from './socialTypes';
import { SocialStorage } from './socialStorage';

export const DEMO_FRIENDS: Friend[] = [
  { id: 'demo_1', username: 'PixelFox', displayName: 'PixelFox', avatarId: 'pixel_runner_02', level: 14, status: 'online', isDemo: true },
  { id: 'demo_2', username: 'CloudNova', displayName: 'CloudNova', avatarId: 'pixel_runner_03', level: 16, status: 'online', isDemo: true },
  { id: 'demo_3', username: 'JungleByte', displayName: 'JungleByte', avatarId: 'pixel_runner_04', level: 9, status: 'away', isDemo: true },
  { id: 'demo_4', username: 'CandyDash', displayName: 'CandyDash', avatarId: 'pixel_runner_05', level: 11, status: 'online', isDemo: true },
  { id: 'demo_5', username: 'SkyRunner', displayName: 'SkyRunner', avatarId: 'pixel_runner_06', level: 20, status: 'offline', isDemo: true },
  { id: 'demo_6', username: 'VoltPixel', displayName: 'VoltPixel', avatarId: 'pixel_runner_01', level: 15, status: 'offline', isDemo: true },
];

export class FriendService {
  private friends: Friend[] = [];
  private requests: FriendRequest[] = [];

  constructor() {
    this.init();
  }

  private init(): void {
    const savedFriends = SocialStorage.loadFriends();
    if (savedFriends && savedFriends.length > 0) {
      this.friends = savedFriends;
    } else {
      // Default sample friends from local demo list
      this.friends = [DEMO_FRIENDS[0], DEMO_FRIENDS[1], DEMO_FRIENDS[2]];
      SocialStorage.saveFriends(this.friends);
    }

    const savedRequests = SocialStorage.loadFriendRequests();
    if (savedRequests && savedRequests.length > 0) {
      this.requests = savedRequests;
    } else {
      // Sample incoming request
      this.requests = [
        {
          id: 'req_demo_candy',
          fromPlayer: DEMO_FRIENDS[3],
          toPlayerId: 'local_player_1',
          createdAt: Date.now() - 3600000,
          type: 'incoming',
        },
      ];
      SocialStorage.saveFriendRequests(this.requests);
    }
  }

  public getFriends(): Friend[] {
    return [...this.friends];
  }

  public getFriendRequests(): FriendRequest[] {
    return [...this.requests];
  }

  public searchUsers(query: string, currentUserId: string): Friend[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DEMO_FRIENDS.filter((u) => {
      if (u.id === currentUserId) return false;
      return (
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q)
      );
    });
  }

  public sendFriendRequest(target: Friend, currentUserId: string): { success: boolean; message: string } {
    if (target.id === currentUserId) {
      return { success: false, message: 'You cannot send a friend request to yourself.' };
    }
    if (this.friends.some((f) => f.id === target.id)) {
      return { success: false, message: `${target.displayName} is already in your friends list.` };
    }
    if (this.requests.some((r) => r.fromPlayer.id === target.id)) {
      return { success: false, message: 'A request with this player is already pending.' };
    }

    const newReq: FriendRequest = {
      id: 'req_' + Date.now(),
      fromPlayer: target,
      toPlayerId: currentUserId,
      createdAt: Date.now(),
      type: 'outgoing',
    };

    this.requests.push(newReq);
    SocialStorage.saveFriendRequests(this.requests);
    return { success: true, message: `Friend request sent to ${target.displayName}!` };
  }

  public acceptFriendRequest(requestId: string): boolean {
    const idx = this.requests.findIndex((r) => r.id === requestId);
    if (idx === -1) return false;

    const req = this.requests[idx];
    if (!this.friends.some((f) => f.id === req.fromPlayer.id)) {
      this.friends.push(req.fromPlayer);
      SocialStorage.saveFriends(this.friends);
    }

    this.requests.splice(idx, 1);
    SocialStorage.saveFriendRequests(this.requests);
    return true;
  }

  public declineFriendRequest(requestId: string): boolean {
    const idx = this.requests.findIndex((r) => r.id === requestId);
    if (idx === -1) return false;

    this.requests.splice(idx, 1);
    SocialStorage.saveFriendRequests(this.requests);
    return true;
  }

  public removeFriend(friendId: string): boolean {
    const idx = this.friends.findIndex((f) => f.id === friendId);
    if (idx === -1) return false;

    this.friends.splice(idx, 1);
    SocialStorage.saveFriends(this.friends);
    return true;
  }
}
