import React, { useEffect, useLayoutEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, spacing, typography } from '../../theme/index';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import { useTyping } from '../../hooks/useTyping';
import { chatService } from '../../services/chatService';
import { storageService } from '../../services/storageService';
import { userService } from '../../services/userService';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInputToolbar } from '../../components/chat/ChatInputToolbar';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { Avatar } from '../../components/common/Avatar';
import { formatLastSeen } from '../../utils/formatters';
import type { ChatStackParamList, UserProfile } from '../../types/index';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

export const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { chatId, otherUserId, otherUserName } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const { messages, loadMore, loadingMore } = useMessages(chatId);
  const { otherIsTyping, onInputChange } = useTyping(chatId, user?.uid ?? '', otherUserId);
  const [otherUser, setOtherUser] = React.useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = userService.subscribeToUser(otherUserId, setOtherUser);
    return unsub;
  }, [otherUserId]);

  useEffect(() => {
    if (user) chatService.markMessagesAsRead(chatId, user.uid);
  }, [chatId, user, messages.length]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity style={styles.headerTitle} activeOpacity={0.7}>
          <Avatar uri={otherUser?.avatar} name={otherUserName} size={36} />
          <View style={{ marginLeft: spacing.sm }}>
            <Text style={[styles.headerName, { color: colors.headerText }]}>{otherUserName}</Text>
            <Text style={[styles.headerStatus, { color: colors.headerText }]}>
              {otherIsTyping ? 'typing...' : otherUser ? formatLastSeen(otherUser.lastSeen, otherUser.status) : ''}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, otherUser, otherUserName, otherIsTyping, colors]);

  const handleSendText = useCallback(
    (text: string) => {
      if (!user) return;
      chatService.sendMessage(chatId, user.uid, otherUserId, { type: 'text', text });
    },
    [chatId, user, otherUserId],
  );

  const handleSendImage = useCallback(
    async (localUri: string) => {
      if (!user) return;
      const imageUrl = await storageService.uploadChatImage(chatId, localUri);
      await chatService.sendMessage(chatId, user.uid, otherUserId, { type: 'image', imageUrl });
    },
    [chatId, user, otherUserId],
  );

  const handleSendAudio = useCallback(
    async (localUri: string, durationSec: number) => {
      if (!user) return;
      const audioUrl = await storageService.uploadChatAudio(chatId, localUri);
      await chatService.sendMessage(chatId, user.uid, otherUserId, {
        type: 'audio',
        audioUrl,
        audioDuration: durationSec,
      });
    },
    [chatId, user, otherUserId],
  );

  const openImageViewer = (uri: string) => navigation.navigate('ImageViewer', { imageUrl: uri });

  if (!user) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.chatBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        renderItem={({ item }) => (
          <MessageBubble message={item} isMine={item.senderId === user.uid} onImagePress={openImageViewer} />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={<TypingIndicator visible={otherIsTyping} />}
        contentContainerStyle={styles.listContent}
      />
      <ChatInputToolbar
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        onSendAudio={handleSendAudio}
        onTextChange={onInputChange}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: spacing.md, flexDirection: 'column-reverse' },
  headerTitle: { flexDirection: 'row', alignItems: 'center' },
  headerName: { ...typography.h3, fontSize: 16 },
  headerStatus: { ...typography.small, opacity: 0.85 },
});
