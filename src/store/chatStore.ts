import { create } from 'zustand';
import type { Chat } from '../types/index';

interface ChatStoreState {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  totalUnread: () => number;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  chats: [],
  setChats: (chats) => set({ chats }),
  totalUnread: () => {
    const { chats } = get();
    return chats.reduce((sum, c) => sum + Object.values(c.unreadCount ?? {}).reduce((a, b) => a + b, 0), 0);
  },
}));
