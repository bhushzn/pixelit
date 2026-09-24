import { Friend, PartyMember, PartyState, PlayerProfile } from './socialTypes';
import { SocialStorage } from './socialStorage';

export class PartyService {
  private party: PartyState | null = null;

  constructor() {
    this.party = SocialStorage.loadPartyState();
  }

  public getPartyState(): PartyState | null {
    return this.party;
  }

  public createParty(leader: PlayerProfile, mode = 'quick_race', mapId = 'cloud_climb'): PartyState {
    const leaderMember: PartyMember = {
      id: leader.id,
      displayName: leader.displayName,
      avatarId: leader.avatarId,
      level: leader.level,
      isLeader: true,
      isReady: true,
    };

    this.party = {
      partyId: 'party_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      leaderId: leader.id,
      members: [leaderMember],
      selectedMode: mode,
      selectedMapId: mapId,
      status: 'LOBBY',
      settings: {
        isPrivate: false,
        maxPlayers: 4,
      },
      roomCode: 'RUSH' + Math.floor(100 + Math.random() * 900),
    };

    SocialStorage.savePartyState(this.party);
    return this.party;
  }

  public inviteFriendToParty(friend: Friend): { success: boolean; message: string } {
    if (!this.party) {
      return { success: false, message: 'No active party lobby.' };
    }
    if (this.party.members.length >= this.party.settings.maxPlayers) {
      return { success: false, message: 'Party is already full (Max 4 players).' };
    }
    if (this.party.members.some((m) => m.id === friend.id)) {
      return { success: false, message: `${friend.displayName} is already in the party.` };
    }

    // Add friend as demo local party member
    const newMember: PartyMember = {
      id: friend.id,
      displayName: friend.displayName,
      avatarId: friend.avatarId,
      level: friend.level,
      isLeader: false,
      isReady: true, // Demo friend is ready
      isDemo: true,
    };

    this.party.members.push(newMember);
    this.party.status = 'READY_CHECK';
    SocialStorage.savePartyState(this.party);
    return { success: true, message: `${friend.displayName} joined the party!` };
  }

  public removeMember(memberId: string, currentUserId: string): boolean {
    if (!this.party) return false;
    if (this.party.leaderId !== currentUserId && memberId !== currentUserId) {
      return false; // Only leader can kick other members
    }

    this.party.members = this.party.members.filter((m) => m.id !== memberId);

    // If leader left or no members remain, dissolve party
    if (this.party.members.length === 0 || memberId === this.party.leaderId) {
      this.leaveParty();
      return true;
    }

    SocialStorage.savePartyState(this.party);
    return true;
  }

  public setReady(memberId: string, isReady: boolean): boolean {
    if (!this.party) return false;
    const member = this.party.members.find((m) => m.id === memberId);
    if (!member) return false;

    member.isReady = isReady;
    this.party.status = this.party.members.every((m) => m.isReady) ? 'READY_CHECK' : 'LOBBY';
    SocialStorage.savePartyState(this.party);
    return true;
  }

  public setPartyMode(mode: string, currentUserId: string): boolean {
    if (!this.party || this.party.leaderId !== currentUserId) return false;
    this.party.selectedMode = mode;
    SocialStorage.savePartyState(this.party);
    return true;
  }

  public setPartyMap(mapId: string, currentUserId: string): boolean {
    if (!this.party || this.party.leaderId !== currentUserId) return false;
    this.party.selectedMapId = mapId;
    SocialStorage.savePartyState(this.party);
    return true;
  }

  public canStartRace(currentUserId: string): { allowed: boolean; reason?: string } {
    if (!this.party) {
      return { allowed: false, reason: 'No party created.' };
    }
    if (this.party.leaderId !== currentUserId) {
      return { allowed: false, reason: 'Only the party leader can launch the race.' };
    }
    const notReady = this.party.members.filter((m) => !m.isReady);
    if (notReady.length > 0) {
      return { allowed: false, reason: `Waiting for ${notReady.map(m => m.displayName).join(', ')} to get ready.` };
    }
    return { allowed: true };
  }

  public startRace(currentUserId: string): PartyState | null {
    const check = this.canStartRace(currentUserId);
    if (!check.allowed || !this.party) {
      return null;
    }

    this.party.status = 'STARTING';
    SocialStorage.savePartyState(this.party);
    return this.party;
  }

  public leaveParty(): void {
    this.party = null;
    SocialStorage.clearParty();
  }
}
