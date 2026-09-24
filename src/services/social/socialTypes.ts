export type OnlineStatus = 'online' | 'away' | 'offline';

export interface PlayerProfile {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  level: number;
  xp: number;
  coins: number;
  status: OnlineStatus;
  createdAt: number;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarId: string;
  level: number;
  status: OnlineStatus;
  lastSeen?: string;
  isDemo?: boolean;
}

export interface FriendRequest {
  id: string;
  fromPlayer: Friend;
  toPlayerId: string;
  createdAt: number;
  type: 'incoming' | 'outgoing';
}

export interface PartyMember {
  id: string;
  displayName: string;
  avatarId: string;
  level: number;
  isLeader: boolean;
  isReady: boolean;
  isDemo?: boolean;
}

export type PartyStateStatus = 'EMPTY' | 'LOBBY' | 'READY_CHECK' | 'STARTING' | 'IN_GAME' | 'RESULTS';

export interface PartySettings {
  isPrivate: boolean;
  maxPlayers: number;
}

export interface PartyState {
  partyId: string;
  leaderId: string;
  members: PartyMember[];
  selectedMode: string;
  selectedMapId: string;
  status: PartyStateStatus;
  settings: PartySettings;
  roomCode?: string;
}

export interface PartyInvite {
  inviteId: string;
  partyId: string;
  fromPlayer: Friend;
  selectedMapId: string;
  selectedMode: string;
  createdAt: number;
}
