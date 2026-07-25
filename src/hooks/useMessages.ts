import { useEffect, useState, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { MESSAGE_PAGE_SIZE } from '../constants/index';
import type { ChatMessage } from '../types/index';

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = chatService.subscribeToMessages(chatId, (list) => {
      setMessages(list);
      setLoading(false);
    }, MESSAGE_PAGE_SIZE);
    return unsub;
  }, [chatId]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;
    const oldest = messages[messages.length - 1];
    if (!oldest.createdAt) return;
    setLoadingMore(true);
    try {
      const older = await chatService.loadOlderMessages(chatId, oldest.createdAt, MESSAGE_PAGE_SIZE);
      if (older.length < MESSAGE_PAGE_SIZE) setHasMore(false);
      setMessages((prev) => [...prev, ...older]);
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, messages, loadingMore, hasMore]);

  return { messages, loading, loadingMore, hasMore, loadMore };
}
