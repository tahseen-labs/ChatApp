import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import type { Timestamp } from '../types/index';

const toDate = (ts: Timestamp | null): Date | null => {
  if (!ts) return null;
  return ts.toDate();
};

export const formatMessageTime = (ts: Timestamp | null): string => {
  const date = toDate(ts);
  if (!date) return '';
  return format(date, 'HH:mm');
};

export const formatChatListTime = (ts: Timestamp | null): string => {
  const date = toDate(ts);
  if (!date) return '';
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yyyy');
};

export const formatLastSeen = (ts: Timestamp | null, status: 'online' | 'offline'): string => {
  if (status === 'online') return 'online';
  const date = toDate(ts);
  if (!date) return 'offline';
  return `last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
};

export const formatAudioDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
