import { useEffect, useState } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './useAuth';
import { useChatStore } from '../store/chatStore';
import type { Chat } from '../types/index';

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const setGlobalChats = useChatStore((s) => s.setChats);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setGlobalChats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = chatService.subscribeToUserChats(user.uid, (list) => {
      setChats(list);
      setGlobalChats(list);
      setLoading(false);
    });
    return unsub;
  }, [user, setGlobalChats]);

  return { chats, loading };
}
