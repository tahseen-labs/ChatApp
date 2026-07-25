import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '../services/chatService';
import { TYPING_TIMEOUT_MS } from '../constants/index';

export function useTyping(chatId: string, uid: string, otherUserId: string) {
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const unsub = chatService.subscribeToTyping(chatId, (typingMap) => {
      setOtherIsTyping(!!typingMap[otherUserId]);
    });
    return () => {
      unsub();
      if (isTypingRef.current) chatService.setTyping(chatId, uid, false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, otherUserId]);

  const onInputChange = useCallback(
    (text: string) => {
      const shouldBeTyping = text.length > 0;

      if (shouldBeTyping && !isTypingRef.current) {
        isTypingRef.current = true;
        chatService.setTyping(chatId, uid, true);
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (shouldBeTyping) {
        timeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          chatService.setTyping(chatId, uid, false);
        }, TYPING_TIMEOUT_MS);
      } else if (isTypingRef.current) {
        isTypingRef.current = false;
        chatService.setTyping(chatId, uid, false);
      }
    },
    [chatId, uid],
  );

  return { otherIsTyping, onInputChange };
}
