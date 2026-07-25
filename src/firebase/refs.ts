import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/index';
import type { UserProfile, Chat, ChatMessage } from '../types/index';

export const usersRef = () =>
  firestore().collection<UserProfile>(COLLECTIONS.USERS);

export const userDoc = (uid: string) => usersRef().doc(uid);

export const chatsRef = () => firestore().collection<Chat>(COLLECTIONS.CHATS);

export const chatDoc = (chatId: string) => chatsRef().doc(chatId);

export const messagesRef = (chatId: string) =>
  chatDoc(chatId).collection<ChatMessage>('messages');

export const messageDoc = (chatId: string, messageId: string) =>
  messagesRef(chatId).doc(messageId);

/** Deterministic chat id for a 1-to-1 chat so we never create duplicates. */
export const buildChatId = (uidA: string, uidB: string): string =>
  [uidA, uidB].sort().join('_');
