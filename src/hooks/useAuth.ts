import { useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { presenceService } from '../services/presenceService';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

/**
 * Mount once near the root of the app. Subscribes to Firebase auth state,
 * then to the user's Firestore profile document, and manages presence +
 * push token registration for the lifetime of the session.
 */
export function useAuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = authService.onAuthStateChanged(async (uid) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (!uid) {
        setUser(null);
        setInitializing(false);
        return;
      }

      unsubProfile = userService.subscribeToUser(uid, (profile) => {
        setUser(profile);
        setInitializing(false);
      });

      await presenceService.goOnline(uid);
      const granted = await notificationService.requestPermission();
      if (granted) await notificationService.registerToken(uid);
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, [setUser, setInitializing]);
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);
  return { user, initializing, isAuthenticated: !!user };
}
