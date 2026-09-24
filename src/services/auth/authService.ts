export interface UserProfile {
  uid: string;
  displayName: string;
  isGuest: boolean;
  avatarUrl?: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
}

export interface AuthService {
  getCurrentUser(): UserProfile | null;
  signInAsGuest(customName?: string): Promise<UserProfile>;
  signInWithGoogle(): Promise<UserProfile>;
  signOut(): Promise<void>;
  updateProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
}

// Default initial guest player profile (Pip)
const GUEST_STORAGE_KEY = 'pixel_rush_player_profile';

class LocalAuthServiceImpl implements AuthService {
  private user: UserProfile;

  constructor() {
    const saved = localStorage.getItem(GUEST_STORAGE_KEY);
    if (saved) {
      try {
        this.user = JSON.parse(saved);
        return;
      } catch {
        // Fall back to default
      }
    }

    this.user = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Pip',
      isGuest: true,
      level: 12,
      xp: 1420,
      coins: 4850,
      gems: 120,
    };
  }

  getCurrentUser(): UserProfile | null {
    return this.user;
  }

  async signInAsGuest(customName?: string): Promise<UserProfile> {
    this.user = {
      ...this.user,
      displayName: customName || 'Pip',
      isGuest: true,
    };
    this.save();
    return this.user;
  }

  async signInWithGoogle(): Promise<UserProfile> {
    // Architecture hook for future Google OAuth integration
    this.user = {
      ...this.user,
      displayName: 'Pip Champion',
      isGuest: false,
    };
    this.save();
    return this.user;
  }

  async signOut(): Promise<void> {
    this.user = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: 'Pip',
      isGuest: true,
      level: 1,
      xp: 0,
      coins: 500,
      gems: 10,
    };
    this.save();
  }

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    this.user = {
      ...this.user,
      ...profile,
    };
    this.save();
    return this.user;
  }

  private save(): void {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(this.user));
    } catch {
      // Ignore storage errors
    }
  }
}

export const authService: AuthService = new LocalAuthServiceImpl();
