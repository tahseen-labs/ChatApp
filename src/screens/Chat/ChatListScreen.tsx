import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/index';
import { useAuth } from '../../hooks/useAuth';
import { useChats } from '../../hooks/useChats';
import { ChatListItem } from '../../components/chat/ChatListItem';
import { ChatListSkeleton } from '../../components/common/ChatListSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import type { ChatStackParamList, Chat } from '../../types/index';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatList'>;

export const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { chats, loading } = useChats();

  if (!user) return null;

  const openChat = (chat: Chat) => {
    const otherUid = chat.participants.find((p) => p !== user.uid) ?? '';
    const other = chat.participantProfiles[otherUid];
    navigation.navigate('ChatRoom', { chatId: chat.id, otherUserId: otherUid, otherUserName: other?.name ?? 'Chat' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ChatListSkeleton />
      ) : chats.length === 0 ? (
        <EmptyState icon="chatbubbles-outline" title="No conversations yet" subtitle="Search for a user to start chatting" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatListItem chat={item} currentUid={user.uid} onPress={() => openChat(item)} />}
          ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 82 },
});
