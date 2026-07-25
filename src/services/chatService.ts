import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { Chat, ChatMessage, MessageType, UserProfile } from '../types/index';
import { chatsRef, chatDoc, messagesRef, buildChatId } from '../firebase/refs';

export const chatService = {
  /** Gets an existing 1:1 chat or creates it. Returns the chat id. */
  async getOrCreateChat(
    currentUser: Pick<UserProfile, 'uid' | 'name' | 'avatar' | 'status'>,
    otherUser: Pick<UserProfile, 'uid' | 'name' | 'avatar' | 'status'>,
  ): Promise<string> {
    const chatId = buildChatId(currentUser.uid, otherUser.uid);
    const ref = chatDoc(chatId);
    const snap = await ref.get();
    if (!snap.exists) {
      const newChat: Chat = {
        id: chatId,
        participants: [currentUser.uid, otherUser.uid],
        participantProfiles: {
          [currentUser.uid]: { name: currentUser.name, avatar: currentUser.avatar, status: currentUser.status },
          [otherUser.uid]: { name: otherUser.name, avatar: otherUser.avatar, status: otherUser.status },
        },
        lastMessage: null,
        unreadCount: { [currentUser.uid]: 0, [otherUser.uid]: 0 },
        typing: { [currentUser.uid]: false, [otherUser.uid]: false },
        updatedAt: firestore.FieldValue.serverTimestamp() as any,
        createdAt: firestore.FieldValue.serverTimestamp() as any,
      };
      await ref.set(newChat);
    }
    return chatId;
  },

  subscribeToUserChats(uid: string, cb: (chats: Chat[]) => void) {
    return chatsRef()
      .where('participants', 'array-contains', uid)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(
        (snap) => cb(snap.docs.map((d) => d.data() as Chat)),
        (err) => console.warn('subscribeToUserChats error', err),
      );
  },

  subscribeToMessages(chatId: string, cb: (messages: ChatMessage[]) => void, pageSize = 30) {
    return messagesRef(chatId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize)
      .onSnapshot(
        (snap) => cb(snap.docs.map((d) => ({ ...(d.data() as ChatMessage), id: d.id }))),
        (err) => console.warn('subscribeToMessages error', err),
      );
  },

  async loadOlderMessages(chatId: string, beforeCreatedAt: FirebaseFirestoreTypes.Timestamp, pageSize = 30) {
    const snap = await messagesRef(chatId)
      .orderBy('createdAt', 'desc')
      .startAfter(beforeCreatedAt)
      .limit(pageSize)
      .get();
    return snap.docs.map((d) => ({ ...(d.data() as ChatMessage), id: d.id }));
  },

  async sendMessage(
    chatId: string,
    senderId: string,
    otherUserId: string,
    payload: { type: MessageType; text?: string; imageUrl?: string; audioUrl?: string; audioDuration?: number },
  ): Promise<void> {
    const batch = firestore().batch();
    const msgRef = messagesRef(chatId).doc();

    const message: ChatMessage = {
      id: msgRef.id,
      chatId,
      senderId,
      type: payload.type,
      text: payload.text ?? null,
      imageUrl: payload.imageUrl ?? null,
      audioUrl: payload.audioUrl ?? null,
      audioDuration: payload.audioDuration ?? null,
      createdAt: firestore.FieldValue.serverTimestamp() as any,
      status: 'sent',
      readBy: [senderId],
    };
    batch.set(msgRef, message);

    const previewText =
      payload.type === 'text' ? payload.text ?? '' : payload.type === 'image' ? '📷 Photo' : '🎤 Voice message';

    batch.update(chatDoc(chatId), {
      lastMessage: {
        text: previewText,
        senderId,
        type: payload.type,
        createdAt: firestore.FieldValue.serverTimestamp(),
      },
      updatedAt: firestore.FieldValue.serverTimestamp(),
      [`unreadCount.${otherUserId}`]: firestore.FieldValue.increment(1),
    });

    await batch.commit();
  },

  async markMessagesAsRead(chatId: string, readerUid: string): Promise<void> {
    const snap = await messagesRef(chatId).where('senderId', '!=', readerUid).get();
    const batch = firestore().batch();
    let hasChanges = false;
    snap.docs.forEach((doc) => {
      const msg = doc.data() as ChatMessage;
      if (!msg.readBy.includes(readerUid)) {
        hasChanges = true;
        batch.update(doc.ref, {
          readBy: firestore.FieldValue.arrayUnion(readerUid),
          status: 'read',
        });
      }
    });
    batch.update(chatDoc(chatId), { [`unreadCount.${readerUid}`]: 0 });
    if (hasChanges) await batch.commit();
    else await chatDoc(chatId).update({ [`unreadCount.${readerUid}`]: 0 });
  },

  async setTyping(chatId: string, uid: string, isTyping: boolean): Promise<void> {
    await chatDoc(chatId).update({ [`typing.${uid}`]: isTyping });
  },

  subscribeToTyping(chatId: string, cb: (typingMap: Record<string, boolean>) => void) {
    return chatDoc(chatId).onSnapshot((snap) => {
      const chat = snap.data() as Chat | undefined;
      cb(chat?.typing ?? {});
    });
  },
};
