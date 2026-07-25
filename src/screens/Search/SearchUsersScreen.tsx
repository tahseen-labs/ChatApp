import React, { useCallback, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/common/Avatar';
import { EmptyState } from '../../components/common/EmptyState';
import { useTheme, spacing, radii, typography } from '../../theme/index';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import type { SearchStackParamList, UserProfile } from '../../types/index';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchUsers'>;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const SearchUsersScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(
    (text: string) => {
      if (!user) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        if (!text.trim()) {
          setResults([]);
          setSearched(false);
          return;
        }
        setLoading(true);
        setSearched(true);
        try {
          const found = await userService.searchUsers(text, user.uid);
          setResults(found);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    [user],
  );

  const handleChange = (text: string) => {
    setQuery(text);
    runSearch(text);
  };

  const openChatWith = async (otherUser: UserProfile) => {
    if (!user) return;
    const chatId = await chatService.getOrCreateChat(
      { uid: user.uid, name: user.name, avatar: user.avatar, status: user.status },
      { uid: otherUser.uid, name: otherUser.name, avatar: otherUser.avatar, status: otherUser.status },
    );
    // ChatRoom lives in the Chats tab's stack; using getParent lets us hop tabs.
    navigation.getParent()?.navigate('ChatsTab', {
      screen: 'ChatRoom',
      params: { chatId, otherUserId: otherUser.uid, otherUserName: otherUser.name },
    } as never);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.inputBackground }]}>
        <Icon name="search" size={20} color={colors.textTertiary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Search by username"
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={handleChange}
          autoCapitalize="none"
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {!searched ? (
        <EmptyState icon="people-outline" title="Find people to chat with" subtitle="Search by their username above" />
      ) : results.length === 0 && !loading ? (
        <EmptyState icon="person-remove-outline" title="No users found" subtitle="Try a different search term" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openChatWith(item)}>
              <Avatar uri={item.avatar} name={item.name} size={48} showOnlineDot isOnline={item.status === 'online'} />
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.bio}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 15.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  info: { marginLeft: spacing.md, flex: 1 },
  name: { ...typography.h3, fontSize: 16 },
  bio: { ...typography.caption, marginTop: 2 },
});
