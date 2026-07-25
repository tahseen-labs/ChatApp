import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../theme/index';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showOnlineDot?: boolean;
  isOnline?: boolean;
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 48, showOnlineDot = false, isOnline = false }) => {
  const { colors } = useTheme();

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name) || '?'}</Text>
        </View>
      )}
      {showOnlineDot && (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              backgroundColor: isOnline ? colors.online : colors.offline,
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: { backgroundColor: '#ccc' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2 },
});
