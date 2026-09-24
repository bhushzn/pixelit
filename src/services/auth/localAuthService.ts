import { AuthService, AuthState, UserProfile } from './authTypes';

const LOCAL_AUTH_STORAGE_KEY = 'pixel_rush_local_auth_profile';

export class LocalAuthService implements AuthService {
  private user: UserProfile | null = null;
  private authState: AuthState = 'SIGNED_OUT';
  private listeners: Set<(user: UserProfile | null, state: AuthState) => void> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      const saved = localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
      if (saved) {
        this.user = JSON.parse(saved);
        this.authState = 'AUTHENTICATED';
      }
    } catch {
      this.user = null;
      this.authState = 'SIGNED_OUT';
    }
  }

  public isOnlineMode(): boolean {
    return false; // Local development mode fallback
  }

  public getCurrentUser(): UserProfile | null {
    return this.user ? { ...this.user } : null;
  }

  public getAuthState(): AuthState {
    return this.authState;
  }

  public async signInAsGuest(customName?: string): Promise<UserProfile> {
    const profile: UserProfile = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      username: (customName || 'Pip').toLowerCase().replace(/\s+/g, '_'),
      displayName: customName || 'Pip',
      avatarId: 'pixel_runner_01',
      isGuest: true,
      level: 12,
      xp: 1420,
      coins: 4850,
      gems: 120,
      createdAt: Date.now(),
    };

    this.user = profile;
    this.authState = 'AUTHENTICATED';
    this.save();
    this.notify();
    return { ...this.user };
  }

  public async signInWithGoogle(): Promise<UserProfile> {
    // In local dev mode, simulate Google authentication
    const profile: UserProfile = {
      uid: 'google_user_' + Math.random().toString(36).substring(2, 9),
      username: 'pixel_champion',
      displayName: 'Pip Champion',
      avatarId: 'pixel_runner_02',
      isGuest: false,
      level: 15,
      xp: 2200,
      coins: 6000,
      gems: 250,
      email: 'champion@pixelrush.dev',
      createdAt: Date.now(),
    };

    this.user = profile;
    this.authState = 'AUTHENTICATED';
    this.save();
    this.notify();
    return { ...this.user };
  }

  public async signOut(): Promise<void> {
    this.user = null;
    this.authState = 'SIGNED_OUT';
    try {
      localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    } catch {}
    this.notify();
  }

  public async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.user) {
      throw new Error('Cannot update profile when not authenticated');
    }

    this.user = {
      ...this.user,
      ...updates,
    };
    this.save();
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

  private save(): void {
    try {
      if (this.user) {
        localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(this.user));
      } else {
        localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
      }
    } catch {}
  }

  private notify(): void {
    const current = this.getCurrentUser();
    this.listeners.forEach((cb) => cb(current, this.authState));
  }
}
