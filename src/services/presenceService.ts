import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { userDoc } from '../firebase/refs';

/**
 * Firebase Realtime Database is the only Firebase product with reliable
 * server-side "onDisconnect" hooks, so presence is tracked there and then
 * mirrored into Firestore (which the rest of the app reads from) via a
 * client-side listener. For production hardening, move the mirroring step
 * into a Cloud Function trigger on the RTDB path so a killed app/crashed
 * client can't skip the mirror step.
 */
let unsubscribeMirror: (() => void) | null = null;

export const presenceService = {
  /** Call once after login. Sets up onDisconnect + online status. */
  async goOnline(uid: string): Promise<void> {
    const statusRef = database().ref(`/status/${uid}`);
    const connectedRef = database().ref('.info/connected');

    connectedRef.on('value', async (snap) => {
      if (snap.val() === false) return;

      await statusRef.onDisconnect().set({
        state: 'offline',
        lastChanged: database.ServerValue.TIMESTAMP,
      });

      await statusRef.set({
        state: 'online',
        lastChanged: database.ServerValue.TIMESTAMP,
      });
    });

    // Mirror RTDB status -> Firestore user doc so chat list / profile screens
    // (which already subscribe to Firestore) reflect presence in real time.
    unsubscribeMirror = statusRef.on('value', async (snap) => {
      const val = snap.val() as { state: 'online' | 'offline'; lastChanged: number } | null;
      if (!val) return;
      await userDoc(uid).update({
        status: val.state,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      });
    }) as unknown as () => void;
  },

  async goOffline(uid: string): Promise<void> {
    const statusRef = database().ref(`/status/${uid}`);
    await statusRef.set({ state: 'offline', lastChanged: database.ServerValue.TIMESTAMP });
    statusRef.off('value');
    if (unsubscribeMirror) {
      unsubscribeMirror();
      unsubscribeMirror = null;
    }
    await userDoc(uid).update({ status: 'offline', lastSeen: firestore.FieldValue.serverTimestamp() });
  },
};
