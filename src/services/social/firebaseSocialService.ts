import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb } from '../firebase/firebaseConfig';
import { authService } from '../auth/authService';
import { Friend, FriendRequest, PartyMember, PartyState, PlayerProfile } from './socialTypes';

export class FirebaseSocialService {
  private activeParty: PartyState | null = null;
  private partyUnsub: (() => void) | null = null;

  public isOnlineMode(): boolean {
    return true;
  }

  public getProfile(): PlayerProfile {
    const user = authService.getCurrentUser();
    if (!user) {
      return {
        id: 'anonymous',
        username: 'Anonymous',
        displayName: 'Anonymous Runner',
        avatarId: 'pixel_runner_01',
        level: 1,
        xp: 0,
        coins: 0,
        status: 'offline',
        createdAt: Date.now(),
      };
    }

    return {
      id: user.uid,
      username: user.username,
      displayName: user.displayName,
      avatarId: user.avatarId,
      level: user.level,
      xp: user.xp,
      coins: user.coins,
      status: 'online',
      createdAt: user.createdAt,
    };
  }

  public async updateProfile(updates: Partial<PlayerProfile>): Promise<PlayerProfile> {
    await authService.updateProfile({
      displayName: updates.displayName,
      avatarId: updates.avatarId,
    });
    return this.getProfile();
  }

  public async getFriends(): Promise<Friend[]> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !user) return [];

    const friendsRef = collection(db, 'players', user.uid, 'friends');
    const snap = await getDocs(friendsRef);
    return snap.docs.map((d) => d.data() as Friend);
  }

  public async getFriendRequests(): Promise<FriendRequest[]> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !user) return [];

    const incomingQ = query(
      collection(db, 'friendRequests'),
      where('toUid', '==', user.uid),
      where('status', '==', 'PENDING'),
      limit(20)
    );

    const outgoingQ = query(
      collection(db, 'friendRequests'),
      where('fromUid', '==', user.uid),
      where('status', '==', 'PENDING'),
      limit(20)
    );

    const [incSnap, outSnap] = await Promise.all([getDocs(incomingQ), getDocs(outgoingQ)]);

    const incoming: FriendRequest[] = incSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        fromPlayer: data.fromPlayer,
        toPlayerId: data.toUid,
        createdAt: data.createdAt,
        type: 'incoming',
      };
    });

    const outgoing: FriendRequest[] = outSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        fromPlayer: data.fromPlayer,
        toPlayerId: data.toUid,
        createdAt: data.createdAt,
        type: 'outgoing',
      };
    });

    return [...incoming, ...outgoing];
  }

  public async searchUsers(queryStr: string): Promise<Friend[]> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !queryStr.trim()) return [];

    const qLower = queryStr.trim().toLowerCase();
    const playersRef = collection(db, 'players');
    const q = query(
      playersRef,
      where('username', '>=', qLower),
      where('username', '<=', qLower + '\uf8ff'),
      limit(10)
    );

    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          username: data.username || 'runner',
          displayName: data.displayName || 'Runner',
          avatarId: data.avatarId || 'pixel_runner_01',
          level: data.level || 1,
          status: 'online' as const,
          isDemo: false,
        };
      })
      .filter((u) => u.id !== user?.uid);
  }

  public async sendFriendRequest(target: Friend): Promise<{ success: boolean; message: string }> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !user) return { success: false, message: 'Must be authenticated to send friend requests.' };
    if (target.id === user.uid) return { success: false, message: 'You cannot send a friend request to yourself.' };

    const reqId = `req_${user.uid}_${target.id}`;
    const reqRef = doc(db, 'friendRequests', reqId);
    const existing = await getDoc(reqRef);
    if (existing.exists() && existing.data()?.status === 'PENDING') {
      return { success: false, message: 'Friend request already pending.' };
    }

    await setDoc(reqRef, {
      fromUid: user.uid,
      toUid: target.id,
      fromPlayer: {
        id: user.uid,
        username: user.username,
        displayName: user.displayName,
        avatarId: user.avatarId,
        level: user.level,
        status: 'online',
      },
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, message: `Friend request sent to ${target.displayName}!` };
  }

  public async acceptFriendRequest(requestId: string): Promise<boolean> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !user) return false;

    const reqRef = doc(db, 'friendRequests', requestId);
    const snap = await getDoc(reqRef);
    if (!snap.exists()) return false;

    const reqData = snap.data();
    if (reqData.toUid !== user.uid) return false;

    // Save friend in recipient's subcollection
    const friendDocRef = doc(db, 'players', user.uid, 'friends', reqData.fromUid);
    await setDoc(friendDocRef, {
      ...reqData.fromPlayer,
      addedAt: Date.now(),
    });

    // Update request status
    await updateDoc(reqRef, {
      status: 'ACCEPTED',
      updatedAt: Date.now(),
    });

    return true;
  }

  public async declineFriendRequest(requestId: string): Promise<boolean> {
    const db = getFirestoreDb();
    if (!db) return false;
    const reqRef = doc(db, 'friendRequests', requestId);
    await updateDoc(reqRef, {
      status: 'DECLINED',
      updatedAt: Date.now(),
    });
    return true;
  }

  public async removeFriend(friendId: string): Promise<boolean> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !user) return false;

    const friendDocRef = doc(db, 'players', user.uid, 'friends', friendId);
    await deleteDoc(friendDocRef);
    return true;
  }

  // Party Methods
  public getPartyState(): PartyState | null {
    return this.activeParty;
  }

  public async createParty(mode = 'quick_race', mapId = 'cloud_climb'): Promise<PartyState> {
    const db = getFirestoreDb();
    const user = authService.getCurrentUser();
    if (!db || !user) throw new Error('Must be authenticated to create a party');

    const partyId = 'party_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const leaderMember: PartyMember = {
      id: user.uid,
      displayName: user.displayName,
      avatarId: user.avatarId,
      level: user.level,
      isLeader: true,
      isReady: true,
    };

    const newParty: PartyState = {
      partyId,
      leaderId: user.uid,
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

    const partyRef = doc(db, 'parties', partyId);
    await setDoc(partyRef, {
      ...newParty,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    this.activeParty = newParty;
    this.subscribeParty(partyId);
    return newParty;
  }

  private subscribeParty(partyId: string): void {
    if (this.partyUnsub) this.partyUnsub();
    const db = getFirestoreDb();
    if (!db) return;

    const partyRef = doc(db, 'parties', partyId);
    this.partyUnsub = onSnapshot(partyRef, (snap) => {
      if (snap.exists()) {
        this.activeParty = snap.data() as PartyState;
      } else {
        this.activeParty = null;
      }
    });
  }

  public async inviteFriendToParty(friend: Friend): Promise<{ success: boolean; message: string }> {
    if (!this.activeParty) return { success: false, message: 'No active party.' };
    if (this.activeParty.members.length >= 4) return { success: false, message: 'Party is already full.' };
    if (this.activeParty.members.some((m) => m.id === friend.id)) {
      return { success: false, message: `${friend.displayName} is already in the party.` };
    }

    const db = getFirestoreDb();
    if (!db) return { success: false, message: 'Database unavailable.' };

    const newMember: PartyMember = {
      id: friend.id,
      displayName: friend.displayName,
      avatarId: friend.avatarId,
      level: friend.level,
      isLeader: false,
      isReady: true,
      isDemo: friend.isDemo,
    };

    const updatedMembers = [...this.activeParty.members, newMember];
    const partyRef = doc(db, 'parties', this.activeParty.partyId);
    await updateDoc(partyRef, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });

    return { success: true, message: `${friend.displayName} joined the party!` };
  }

  public async removePartyMember(memberId: string): Promise<boolean> {
    if (!this.activeParty) return false;
    const user = authService.getCurrentUser();
    if (!user) return false;

    const db = getFirestoreDb();
    if (!db) return false;

    const updatedMembers = this.activeParty.members.filter((m) => m.id !== memberId);
    const partyRef = doc(db, 'parties', this.activeParty.partyId);

    if (updatedMembers.length === 0 || memberId === this.activeParty.leaderId) {
      await deleteDoc(partyRef);
      this.activeParty = null;
      return true;
    }

    await updateDoc(partyRef, {
      members: updatedMembers,
      updatedAt: Date.now(),
    });
    return true;
  }

  public async setReady(isReady: boolean): Promise<boolean> {
    if (!this.activeParty) return false;
    const user = authService.getCurrentUser();
    if (!user) return false;

    const db = getFirestoreDb();
    if (!db) return false;

    const updatedMembers = this.activeParty.members.map((m) => {
      if (m.id === user.uid) return { ...m, isReady };
      return m;
    });

    const partyRef = doc(db, 'parties', this.activeParty.partyId);
    await updateDoc(partyRef, {
      members: updatedMembers,
      status: updatedMembers.every((m) => m.isReady) ? 'READY_CHECK' : 'LOBBY',
      updatedAt: Date.now(),
    });
    return true;
  }

  public async setPartyMode(mode: string): Promise<boolean> {
    if (!this.activeParty) return false;
    const db = getFirestoreDb();
    if (!db) return false;

    const partyRef = doc(db, 'parties', this.activeParty.partyId);
    await updateDoc(partyRef, {
      selectedMode: mode,
      updatedAt: Date.now(),
    });
    return true;
  }

  public async setPartyMap(mapId: string): Promise<boolean> {
    if (!this.activeParty) return false;
    const db = getFirestoreDb();
    if (!db) return false;

    const partyRef = doc(db, 'parties', this.activeParty.partyId);
    await updateDoc(partyRef, {
      selectedMapId: mapId,
      updatedAt: Date.now(),
    });
    return true;
  }

  public canStartRace(): { allowed: boolean; reason?: string } {
    if (!this.activeParty) return { allowed: false, reason: 'No party created.' };
    const user = authService.getCurrentUser();
    if (this.activeParty.leaderId !== user?.uid) {
      return { allowed: false, reason: 'Only the party leader can launch the race.' };
    }
    const notReady = this.activeParty.members.filter((m) => !m.isReady);
    if (notReady.length > 0) {
      return { allowed: false, reason: `Waiting for ${notReady.map(m => m.displayName).join(', ')} to get ready.` };
    }
    return { allowed: true };
  }

  public async startRace(): Promise<PartyState | null> {
    const check = this.canStartRace();
    if (!check.allowed || !this.activeParty) return null;

    const db = getFirestoreDb();
    if (db) {
      const partyRef = doc(db, 'parties', this.activeParty.partyId);
      await updateDoc(partyRef, {
        status: 'STARTING',
        updatedAt: Date.now(),
      });
    }
    return this.activeParty;
  }

  public async leaveParty(): Promise<void> {
    if (this.partyUnsub) {
      this.partyUnsub();
      this.partyUnsub = null;
    }
    if (this.activeParty) {
      const user = authService.getCurrentUser();
      if (user) {
        await this.removePartyMember(user.uid);
      }
      this.activeParty = null;
    }
  }
}
