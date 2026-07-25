import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { useTheme, spacing, typography } from '../../theme/index';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import type { ProfileStackParamList } from '../../types/index';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

export const MyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await notificationService.unregisterToken(user.uid).catch(() => {});
          await authService.logout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Avatar uri={user.avatar} name={user.name} size={110} />
        <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>About</Text>
        <Text style={[styles.value, { color: colors.text }]}>{user.bio}</Text>
      </View>

      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Icon name="create-outline" size={22} color={colors.text} />
        <Text style={[styles.rowText, { color: colors.text }]}>Edit Profile</Text>
        <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, { backgroundColor: colors.surface }]} onPress={toggleTheme}>
        <Icon name={isDark ? 'moon' : 'sunny-outline'} size={22} color={colors.text} />
        <Text style={[styles.rowText, { color: colors.text }]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
        <Text style={{ color: colors.textSecondary }}>Tap to toggle</Text>
      </TouchableOpacity>

      <Button title="Log Out" variant="outline" onPress={handleLogout} style={{ margin: spacing.lg }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: spacing.xl },
  name: { ...typography.h2, marginTop: spacing.md },
  email: { ...typography.body, marginTop: 2 },
  card: { margin: spacing.lg, padding: spacing.lg, borderRadius: 12 },
  label: { ...typography.caption, marginBottom: spacing.xs },
  value: { ...typography.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  rowText: { ...typography.body, flex: 1 },
});
