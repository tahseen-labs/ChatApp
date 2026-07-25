import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme, spacing, typography } from '../../theme';
import { formatChatListTime } from '../../utils/formatters';
import type { Chat } from '../../types/index';
import { Avatar } from '../common/Avatar';

interface ChatListItemProps {
  chat: Chat;
  currentUid: string;
  onPress: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, currentUid, onPress }) => {
  const { colors } = useTheme();
  const otherUid = chat.participants.find((p) => p !== currentUid) ?? '';
  const other = chat.participantProfiles[otherUid];
  const unread = chat.unreadCount?.[currentUid] ?? 0;
  const isMine = chat.lastMessage?.senderId === currentUid;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <Avatar uri={other?.avatar} name={other?.name ?? '?'} size={54} showOnlineDot isOnline={other?.status === 'online'} />
      <View style={styles.middle}>
        <View style={styles.topLine}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {other?.name ?? 'Unknown'}
          </Text>
          <Text style={[styles.time, { color: unread > 0 ? colors.primary : colors.textSecondary }]}>
            {formatChatListTime(chat.lastMessage?.createdAt ?? chat.updatedAt)}
          </Text>
        </View>
        <View style={styles.bottomLine}>
          <Text style={[styles.preview, { color: unread > 0 ? colors.text : colors.textSecondary }]} numberOfLines={1}>
            {isMine ? 'You: ' : ''}
            {chat.lastMessage?.text ?? 'Say hi 👋'}
          </Text>
          {unread > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.unreadBadge }]}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  middle: { flex: 1, marginLeft: spacing.md },
  topLine: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { ...typography.h3, fontSize: 16, flex: 1, marginRight: spacing.sm },
  time: { ...typography.small },
  bottomLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' },
  preview: { ...typography.caption, flex: 1, marginRight: spacing.sm },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
