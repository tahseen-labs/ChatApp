import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { ApiError, UserProfile } from '../types/index';
import { userDoc } from '../firebase/refs';

const toApiError = (e: unknown): ApiError => {
  const err = e as { code?: string; message?: string };
  return { code: err.code ?? 'unknown', message: mapAuthError(err.code) ?? err.message ?? 'Something went wrong' };
};

const mapAuthError = (code?: string): string | undefined => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return undefined;
  }
};

export const authService = {
  async register(email: string, password: string, name: string): Promise<void> {
    try {
      const cred = await auth().createUserWithEmailAndPassword(email.trim(), password);
      await cred.user.updateProfile({ displayName: name.trim() });

      const profile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: null,
        bio: 'Hey there! I am using ChatApp.',
        status: 'online',
        lastSeen: firestore.FieldValue.serverTimestamp() as any,
        fcmTokens: [],
        createdAt: firestore.FieldValue.serverTimestamp() as any,
        usernameLower: name.trim().toLowerCase(),
      };
      await userDoc(cred.user.uid).set(profile);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async login(email: string, password: string): Promise<void> {
    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
    } catch (e) {
      throw toApiError(e);
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email.trim());
    } catch (e) {
      throw toApiError(e);
    }
  },

  async logout(): Promise<void> {
    const uid = auth().currentUser?.uid;
    try {
      if (uid) {
        await userDoc(uid).update({
          status: 'offline',
          lastSeen: firestore.FieldValue.serverTimestamp(),
        });
      }
    } finally {
      await auth().signOut();
    }
  },

  currentUid(): string | null {
    return auth().currentUser?.uid ?? null;
  },

  onAuthStateChanged(cb: (uid: string | null) => void) {
    return auth().onAuthStateChanged((user) => cb(user?.uid ?? null));
  },
};
