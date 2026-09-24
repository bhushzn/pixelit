import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '../firebase/firebaseConfig';
import { AuthService, AuthState, UserProfile } from './authTypes';

export class FirebaseAuthService implements AuthService {
  private user: UserProfile | null = null;
  private authState: AuthState = 'LOADING';
  private listeners: Set<(user: UserProfile | null, state: AuthState) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    const auth = getFirebaseAuth();
    if (!auth) {
      this.authState = 'SIGNED_OUT';
      this.notify();
      return;
    }

    onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          this.user = await this.loadOrCreateProfile(fbUser);
          this.authState = 'AUTHENTICATED';
        } catch (err) {
          console.error('[FirebaseAuthService] Error syncing user profile:', err);
          this.user = null;
          this.authState = 'ERROR';
        }
      } else {
        this.user = null;
        this.authState = 'SIGNED_OUT';
      }
      this.notify();
    });
  }

  public isOnlineMode(): boolean {
    return true; // Active Firebase backend
  }

  public getCurrentUser(): UserProfile | null {
    return this.user ? { ...this.user } : null;
  }

  public getAuthState(): AuthState {
    return this.authState;
  }

  private async loadOrCreateProfile(fbUser: FirebaseUser): Promise<UserProfile> {
    const db = getFirestoreDb();
    if (!db) throw new Error('Firestore not initialized');

    const userDocRef = doc(db, 'players', fbUser.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: fbUser.uid,
        username: data.username || 'runner_' + fbUser.uid.substring(0, 6),
        displayName: data.displayName || fbUser.displayName || 'Pixel Runner',
        avatarId: data.avatarId || 'pixel_runner_01',
        isGuest: fbUser.isAnonymous,
        level: data.level ?? 1,
        xp: data.xp ?? 0,
        coins: data.coins ?? 1000,
        gems: data.gems ?? 50,
        email: fbUser.email || undefined,
        createdAt: data.createdAt ?? Date.now(),
      };
    }

    // Create Initial Profile
    const defaultName = fbUser.displayName || (fbUser.isAnonymous ? 'Guest ' + fbUser.uid.substring(0, 4).toUpperCase() : 'Runner');
    const newProfile: UserProfile = {
      uid: fbUser.uid,
      username: defaultName.toLowerCase().replace(/\s+/g, '_') + '_' + fbUser.uid.substring(0, 4),
      displayName: defaultName,
      avatarId: 'pixel_runner_01',
      isGuest: fbUser.isAnonymous,
      level: 1,
      xp: 0,
      coins: 1000,
      gems: 50,
      email: fbUser.email || undefined,
      createdAt: Date.now(),
    };

    await setDoc(userDocRef, {
      ...newProfile,
      updatedAt: Date.now(),
    });

    return newProfile;
  }

  public async signInAsGuest(customName?: string): Promise<UserProfile> {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth not available');

    this.authState = 'LOADING';
    this.notify();

    const cred = await signInAnonymously(auth);
    const profile = await this.loadOrCreateProfile(cred.user);
    if (customName && customName !== profile.displayName) {
      await this.updateProfile({ displayName: customName });
    }
    return this.user!;
  }

  public async signInWithGoogle(): Promise<UserProfile> {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase Auth not available');

    this.authState = 'LOADING';
    this.notify();

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return await this.loadOrCreateProfile(cred.user);
    } catch (err: any) {
      this.authState = 'SIGNED_OUT';
      this.notify();
      if (err?.code === 'auth/configuration-not-found' || err?.code === 'auth/operation-not-allowed') {
        throw new Error('Google Sign-In is not configured in this Firebase project.');
      }
      throw new Error(err?.message || 'Failed to sign in with Google');
    }
  }

  public async signOut(): Promise<void> {
    const auth = getFirebaseAuth();
    if (auth) {
      await fbSignOut(auth);
    }
    this.user = null;
    this.authState = 'SIGNED_OUT';
    this.notify();
  }

  public async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.user) throw new Error('Not authenticated');
    const db = getFirestoreDb();
    if (!db) throw new Error('Firestore not initialized');

    const userDocRef = doc(db, 'players', this.user.uid);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: Date.now(),
    });

    this.user = {
      ...this.user,
      ...updates,
    };
    this.notify();
    return { ...this.user };
  }

  public subscribeAuthState(callback: (user: UserProfile | null, state: AuthState) => void): () => void {
    this.listeners.add(callback);
    callback(this.getCurrentUser(), this.authState);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    const current = this.getCurrentUser();
    this.listeners.forEach((cb) => cb(current, this.authState));
  }
}
