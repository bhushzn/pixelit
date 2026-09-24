import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import { AuthService } from './authTypes';
import { LocalAuthService } from './localAuthService';
import { FirebaseAuthService } from './firebaseAuthService';

export * from './authTypes';

// Singleton service choosing between Firebase and Local Development Mode
export const authService: AuthService = isFirebaseConfigured()
  ? new FirebaseAuthService()
  : new LocalAuthService();
