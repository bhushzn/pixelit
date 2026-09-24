import { Friend, FriendRequest, PartyState, PlayerProfile } from './socialTypes';
import { SocialStorage } from './socialStorage';
import { FriendService } from './friendService';
import { PartyService } from './partyService';

export class SocialService {
  private profile: PlayerProfile;
  private friendService: FriendService;
  private partyService: PartyService;

  constructor() {
    this.profile = SocialStorage.loadProfile();
    this.friendService = new FriendService();
    this.partyService = new PartyService();
  }

  // Profile Methods
  public getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  public updateProfile(updates: Partial<PlayerProfile>): PlayerProfile {
    this.profile = {
      ...this.profile,
      ...updates,
    };
    SocialStorage.saveProfile(this.profile);
    return { ...this.profile };
  }

  // Friends Methods
  public getFriends(): Friend[] {
    return this.friendService.getFriends();
  }

  public getFriendRequests(): FriendRequest[] {
    return this.friendService.getFriendRequests();
  }

  public searchUsers(query: string): Friend[] {
    return this.friendService.searchUsers(query, this.profile.id);
  }

  public sendFriendRequest(target: Friend): { success: boolean; message: string } {
    return this.friendService.sendFriendRequest(target, this.profile.id);
  }

  public acceptFriendRequest(requestId: string): boolean {
    return this.friendService.acceptFriendRequest(requestId);
  }

  public declineFriendRequest(requestId: string): boolean {
    return this.friendService.declineFriendRequest(requestId);
  }

  public removeFriend(friendId: string): boolean {
    return this.friendService.removeFriend(friendId);
  }

  // Party Methods
  public getPartyState(): PartyState | null {
    return this.partyService.getPartyState();
  }

  public createParty(mode = 'quick_race', mapId = 'cloud_climb'): PartyState {
    return this.partyService.createParty(this.profile, mode, mapId);
  }

  public inviteFriendToParty(friend: Friend): { success: boolean; message: string } {
    return this.partyService.inviteFriendToParty(friend);
  }

  public removePartyMember(memberId: string): boolean {
    return this.partyService.removeMember(memberId, this.profile.id);
  }

  public setReady(isReady: boolean): boolean {
    return this.partyService.setReady(this.profile.id, isReady);
  }

  public setPartyMode(mode: string): boolean {
    return this.partyService.setPartyMode(mode, this.profile.id);
  }

  public setPartyMap(mapId: string): boolean {
    return this.partyService.setPartyMap(mapId, this.profile.id);
  }

  public canStartRace(): { allowed: boolean; reason?: string } {
    return this.partyService.canStartRace(this.profile.id);
  }

  public startRace(): PartyState | null {
    return this.partyService.startRace(this.profile.id);
  }

  public leaveParty(): void {
    this.partyService.leaveParty();
  }
}

export const socialService = new SocialService();
