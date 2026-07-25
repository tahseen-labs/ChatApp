export const COLLECTIONS = {
  USERS: 'users',
  CHATS: 'chats',
  MESSAGES: 'messages', // subcollection under chats/{chatId}/messages
} as const;

export const STORAGE_PATHS = {
  AVATARS: 'avatars',
  CHAT_IMAGES: 'chatImages',
  CHAT_AUDIO: 'chatAudio',
} as const;

export const TYPING_TIMEOUT_MS = 3000;
export const MESSAGE_PAGE_SIZE = 30;
export const PRESENCE_HEARTBEAT_MS = 30000;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  MAX_BIO_LENGTH: 150,
};

export const FCM_TOPIC_ALL = 'all_users';
