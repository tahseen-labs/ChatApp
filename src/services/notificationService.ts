import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { userService } from './userService';

export interface ChatNotificationData {
  chatId: string;
  otherUserId: string;
  otherUserName: string;
}

let navigateToChatRef: ((data: ChatNotificationData) => void) | null = null;

export const notificationService = {
  /** Wire up a navigation callback so notification taps can deep-link into a chat. */
  registerNavigationHandler(handler: (data: ChatNotificationData) => void) {
    navigateToChatRef = handler;
  },

  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await notifee.requestPermission();
    }
    return enabled;
  },

  async registerToken(uid: string): Promise<void> {
    const token = await messaging().getToken();
    await userService.addFcmToken(uid, token);

    messaging().onTokenRefresh(async (newToken) => {
      await userService.addFcmToken(uid, newToken);
    });
  },

  async unregisterToken(uid: string): Promise<void> {
    const token = await messaging().getToken();
    await userService.removeFcmToken(uid, token);
  },

  /** Call once at app startup (e.g. in App.tsx) to wire all listeners. */
  init(): () => void {
    // Android needs a notification channel for local display.
    if (Platform.OS === 'android') {
      notifee.createChannel({
        id: 'chat_messages',
        name: 'Chat Messages',
        importance: AndroidImportance.HIGH,
      });
    }

    // Foreground messages: FCM does NOT show a system notification automatically
    // while the app is in the foreground, so we display one via Notifee.
    const unsubForeground = messaging().onMessage(async (remoteMessage) => {
      const { notification, data } = remoteMessage;
      await notifee.displayNotification({
        title: notification?.title ?? data?.senderName as string,
        body: notification?.body ?? (data?.body as string),
        android: { channelId: 'chat_messages', pressAction: { id: 'default' } },
        data,
      });
    });

    // Notification tapped while app was backgrounded/quit and opened from tray.
    const unsubOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
      handleOpen(remoteMessage.data);
    });

    // App opened from a completely killed state via notification tap.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) handleOpen(remoteMessage.data);
      });

    // Notifee foreground event (covers the locally-displayed notification tap).
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        handleOpen(detail.notification?.data as Record<string, string> | undefined);
      }
    });

    return () => {
      unsubForeground();
      unsubOpened();
      unsubNotifee();
    };
  },
};

function handleOpen(data: Record<string, unknown> | undefined) {
  if (!data || !navigateToChatRef) return;
  navigateToChatRef({
    chatId: data.chatId as string,
    otherUserId: data.otherUserId as string,
    otherUserName: data.otherUserName as string,
  });
}

/**
 * Background handler must be registered at the top level of index.js
 * (outside the App component). See index.js in this project.
 */
export async function backgroundMessageHandler(
  remoteMessage: Awaited<ReturnType<ReturnType<typeof messaging>['getInitialNotification']>>,
) {
  // Data-only background messages can trigger local display here if needed.
  // With notification+data payloads (recommended), the OS shows the system
  // tray notification automatically in background/quit state — no action needed.
  console.log('Background FCM message:', remoteMessage);
}
