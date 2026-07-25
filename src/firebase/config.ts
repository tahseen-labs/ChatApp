/**
 * With @react-native-firebase, the native SDKs auto-initialize from:
 *  - android/app/google-services.json
 *  - ios/GoogleService-Info.plist
 *
 * So there is no JS-side `initializeApp(config)` call needed (unlike the
 * Firebase Web SDK). This file only centralizes the modular imports and
 * a small helper to fetch the default app instance for anywhere that needs
 * direct native app access (rare).
 */
import { getApp } from '@react-native-firebase/app';

export const firebaseApp = () => getApp();
