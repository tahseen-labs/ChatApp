import firestore from '@react-native-firebase/firestore';
import type { UserProfile } from '../types/index';
import { userDoc, usersRef } from '../firebase/refs';

export const userService = {
  subscribeToUser(uid: string, cb: (profile: UserProfile | null) => void) {
    return userDoc(uid).onSnapshot((snap) => {
      cb((snap.data() as UserProfile) ?? null);
    });
  },

  async getUser(uid: string): Promise<UserProfile | null> {
    const snap = await userDoc(uid).get();
    return (snap.data() as UserProfile) ?? null;
  },

  async updateProfile(
    uid: string,
    updates: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar'>>,
  ): Promise<void> {
    const payload: Record<string, unknown> = { ...updates };
    if (updates.name) payload.usernameLower = updates.name.trim().toLowerCase();
    await userDoc(uid).update(payload);
  },

  /**
   * Simple prefix search on the lowercased username field.
   * For production-scale fuzzy search, pair Firestore with Algolia/Typesense.
   */
  async searchUsers(queryText: string, excludeUid: string): Promise<UserProfile[]> {
    const q = queryText.trim().toLowerCase();
    if (!q) return [];
    const snap = await usersRef()
      .orderBy('usernameLower')
      .startAt(q)
      .endAt(q + '\uf8ff')
      .limit(20)
      .get();
    return snap.docs
      .map((d) => d.data() as UserProfile)
      .filter((u) => u.uid !== excludeUid);
  },

  async setPresence(uid: string, status: 'online' | 'offline'): Promise<void> {
    await userDoc(uid).update({
      status,
      lastSeen: firestore.FieldValue.serverTimestamp(),
    });
  },

  async addFcmToken(uid: string, token: string): Promise<void> {
    await userDoc(uid).update({
      fcmTokens: firestore.FieldValue.arrayUnion(token),
    });
  },

  async removeFcmToken(uid: string, token: string): Promise<void> {
    await userDoc(uid).update({
      fcmTokens: firestore.FieldValue.arrayRemove(token),
    });
  },
};
