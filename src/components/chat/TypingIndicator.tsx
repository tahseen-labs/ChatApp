import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme, spacing, radii } from '../../theme/index';

const Dot: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(300),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  return <Animated.View style={[styles.dot, { backgroundColor: color, transform: [{ translateY }] }]} />;
};

export const TypingIndicator: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { colors } = useTheme();
  if (!visible) return null;

  return (
    <View style={[styles.bubble, { backgroundColor: colors.bubbleReceived }]}>
      <Dot delay={0} color={colors.textSecondary} />
      <Dot delay={150} color={colors.textSecondary} />
      <Dot delay={300} color={colors.textSecondary} />
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.lg,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 2 },
});
