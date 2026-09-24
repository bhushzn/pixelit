import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import { Friend, FriendRequest, PartyState, PlayerProfile } from './socialTypes';
import { SocialStorage } from './socialStorage';
import { FriendService } from './friendService';
import { PartyService } from './partyService';
import { FirebaseSocialService } from './firebaseSocialService';

export interface ISocialService {
  isOnlineMode(): boolean;
  getProfile(): PlayerProfile;
  updateProfile(updates: Partial<PlayerProfile>): Promise<PlayerProfile>;
  getFriends(): Promise<Friend[]>;
  getFriendRequests(): Promise<FriendRequest[]>;
  searchUsers(query: string): Promise<Friend[]>;
  sendFriendRequest(target: Friend): Promise<{ success: boolean; message: string }>;
  acceptFriendRequest(requestId: string): Promise<boolean>;
  declineFriendRequest(requestId: string): Promise<boolean>;
  removeFriend(friendId: string): Promise<boolean>;
  getPartyState(): PartyState | null;
  createParty(mode?: string, mapId?: string): Promise<PartyState>;
  inviteFriendToParty(friend: Friend): Promise<{ success: boolean; message: string }>;
  removePartyMember(memberId: string): Promise<boolean>;
  setReady(isReady: boolean): Promise<boolean>;
  setPartyMode(mode: string): Promise<boolean>;
  setPartyMap(mapId: string): Promise<boolean>;
  canStartRace(): { allowed: boolean; reason?: string };
  startRace(): Promise<PartyState | null>;
  leaveParty(): Promise<void>;
}

// Local Social Service (Phase 7 Implementation wrapped with Promise compatibility)
export class LocalSocialService implements ISocialService {
  private profile: PlayerProfile;
  private friendService: FriendService;
  private partyService: PartyService;

  constructor() {
    this.profile = SocialStorage.loadProfile();
    this.friendService = new FriendService();
    this.partyService = new PartyService();
  }

  public isOnlineMode(): boolean {
    return false;
  }

  public getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  public async updateProfile(updates: Partial<PlayerProfile>): Promise<PlayerProfile> {
    this.profile = {
      ...this.profile,
      ...updates,
    };
    SocialStorage.saveProfile(this.profile);
    return { ...this.profile };
  }

  public async getFriends(): Promise<Friend[]> {
    return this.friendService.getFriends();
  }

  public async getFriendRequests(): Promise<FriendRequest[]> {
    return this.friendService.getFriendRequests();
  }

  public async searchUsers(query: string): Promise<Friend[]> {
    return this.friendService.searchUsers(query, this.profile.id);
  }

  public async sendFriendRequest(target: Friend): Promise<{ success: boolean; message: string }> {
    return this.friendService.sendFriendRequest(target, this.profile.id);
  }

  public async acceptFriendRequest(requestId: string): Promise<boolean> {
    return this.friendService.acceptFriendRequest(requestId);
  }

  public async declineFriendRequest(requestId: string): Promise<boolean> {
    return this.friendService.declineFriendRequest(requestId);
  }

  public async removeFriend(friendId: string): Promise<boolean> {
    return this.friendService.removeFriend(friendId);
  }

  public getPartyState(): PartyState | null {
    return this.partyService.getPartyState();
  }

  public async createParty(mode = 'quick_race', mapId = 'cloud_climb'): Promise<PartyState> {
    return this.partyService.createParty(this.profile, mode, mapId);
  }

  public async inviteFriendToParty(friend: Friend): Promise<{ success: boolean; message: string }> {
    return this.partyService.inviteFriendToParty(friend);
  }

  public async removePartyMember(memberId: string): Promise<boolean> {
    return this.partyService.removeMember(memberId, this.profile.id);
  }

  public async setReady(isReady: boolean): Promise<boolean> {
    return this.partyService.setReady(this.profile.id, isReady);
  }

  public async setPartyMode(mode: string): Promise<boolean> {
    return this.partyService.setPartyMode(mode, this.profile.id);
  }

  public async setPartyMap(mapId: string): Promise<boolean> {
    return this.partyService.setPartyMap(mapId, this.profile.id);
  }

  public canStartRace(): { allowed: boolean; reason?: string } {
    return this.partyService.canStartRace(this.profile.id);
  }

  public async startRace(): Promise<PartyState | null> {
    return this.partyService.startRace(this.profile.id);
  }

  public async leaveParty(): Promise<void> {
    this.partyService.leaveParty();
  }
}

export const SocialService = LocalSocialService;

// Export singleton dynamically selecting Firebase or Local fallback
export const socialService: ISocialService = isFirebaseConfigured()
  ? new FirebaseSocialService()
  : new LocalSocialService();
