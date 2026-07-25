import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InputField } from '../../components/common/InputField';
import { Button } from '../../components/common/Button';
import { useTheme, spacing, typography } from '../../theme/index';
import { authService } from '../../services/authService';
import { isValidEmail } from '../../utils/validation';
import type { AuthStackParamList } from '../../types/index';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    setError(undefined);
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (e) {
      const err = e as { message: string };
      Alert.alert('Reset failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Reset password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {sent
          ? 'Check your inbox for a password reset link.'
          : "Enter your email and we'll send you a reset link."}
      </Text>

      {!sent && (
        <>
          <InputField
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={error}
          />
          <Button title="Send Reset Link" onPress={handleReset} loading={loading} />
        </>
      )}

      <Button title="Back to Login" variant="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, marginTop: spacing.xs, marginBottom: spacing.xl },
});
