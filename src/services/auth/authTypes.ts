export type AuthState = 'LOADING' | 'AUTHENTICATED' | 'SIGNED_OUT' | 'ERROR';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  avatarId: string;
  isGuest: boolean;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  createdAt: number;
  email?: string;
}

export interface AuthService {
  getCurrentUser(): UserProfile | null;
  getAuthState(): AuthState;
  signInAsGuest(customName?: string): Promise<UserProfile>;
  signInWithGoogle(): Promise<UserProfile>;
  signOut(): Promise<void>;
  updateProfile(profile: Partial<UserProfile>): Promise<UserProfile>;
  subscribeAuthState(callback: (user: UserProfile | null, state: AuthState) => void): () => void;
  isOnlineMode(): boolean;
}
