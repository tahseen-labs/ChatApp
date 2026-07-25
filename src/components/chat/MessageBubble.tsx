import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, spacing, radii } from '../../theme/index';
import { formatMessageTime } from '../../utils/formatters';
import { AudioMessagePlayer } from './AudioMessagePlayer';
import type { ChatMessage } from '../../types/index';

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  onImagePress: (uri: string) => void;
}

const StatusTicks: React.FC<{ status: ChatMessage['status'] }> = ({ status }) => {
  const { colors } = useTheme();
  if (status === 'sending') return <Icon name="time-outline" size={14} color={colors.textTertiary} />;
  const color = status === 'read' ? '#53BDEB' : colors.textTertiary;
  const iconName = status === 'sent' ? 'checkmark' : 'checkmark-done';
  return <Icon name={iconName} size={15} color={color} />;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMine, onImagePress }) => {
  const { colors } = useTheme();
  const bubbleColor = isMine ? colors.bubbleSent : colors.bubbleReceived;

  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <View style={[styles.bubble, { backgroundColor: bubbleColor }, isMine ? styles.mineTail : styles.theirTail]}>
        {message.type === 'image' && message.imageUrl && (
          <TouchableOpacity onPress={() => onImagePress(message.imageUrl as string)}>
            <Image source={{ uri: message.imageUrl }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}

        {message.type === 'audio' && message.audioUrl && (
          <AudioMessagePlayer uri={message.audioUrl} duration={message.audioDuration ?? 0} isMine={isMine} />
        )}

        {message.type === 'text' && message.text && (
          <Text style={[styles.text, { color: colors.text }]}>{message.text}</Text>
        )}

        <View style={styles.metaRow}>
          <Text style={[styles.time, { color: colors.textSecondary }]}>{formatMessageTime(message.createdAt)}</Text>
          {isMine && <StatusTicks status={message.status} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: spacing.md, marginBottom: 4, maxWidth: '78%' },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  bubble: { padding: 8, borderRadius: radii.md, minWidth: 60 },
  mineTail: { borderTopRightRadius: 2 },
  theirTail: { borderTopLeftRadius: 2 },
  text: { fontSize: 15.5, lineHeight: 20 },
  image: { width: 220, height: 220, borderRadius: radii.sm, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', marginTop: 2, gap: 4 },
  time: { fontSize: 11 },
});
