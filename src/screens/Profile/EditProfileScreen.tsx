import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar } from '../../components/common/Avatar';
import { InputField } from '../../components/common/InputField';
import { Button } from '../../components/common/Button';
import { useTheme, spacing, typography } from '../../theme/index';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { storageService } from '../../services/storageService';
import { isValidUsername } from '../../utils/validation';
import { VALIDATION } from '../../constants/index';
import type { ProfileStackParamList } from '../../types/index';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar ?? null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (!user) return null;

  const pickAvatar = async () => {
    const permission = Platform.select({ ios: PERMISSIONS.IOS.PHOTO_LIBRARY, android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES });
    if (permission) {
      const result = await request(permission);
      if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
        return Alert.alert('Permission required', 'Please allow photo library access.');
      }
    }
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setLocalImage(uri);
      setAvatarUri(uri);
    }
  };

  const handleSave = async () => {
    if (!isValidUsername(name)) {
      return setError(`Name must be ${VALIDATION.MIN_USERNAME_LENGTH}-${VALIDATION.MAX_USERNAME_LENGTH} characters.`);
    }
    setError(undefined);
    setSaving(true);
    try {
      let avatarUrl = user.avatar;
      if (localImage) {
        avatarUrl = await storageService.uploadAvatar(user.uid, localImage);
      }
      await userService.updateProfile(user.uid, { name: name.trim(), bio: bio.trim(), avatar: avatarUrl });
      navigation.goBack();
    } catch (e) {
      Alert.alert('Update failed', 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar}>
          <Avatar uri={avatarUri} name={name || user.name} size={120} />
          <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
            <Icon name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <InputField label="Name" value={name} onChangeText={setName} error={error} maxLength={VALIDATION.MAX_USERNAME_LENGTH} />
        <InputField
          label="About / Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={VALIDATION.MAX_BIO_LENGTH}
          style={{ height: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
        />
        <Text style={[styles.counter, { color: colors.textTertiary }]}>
          {bio.length}/{VALIDATION.MAX_BIO_LENGTH}
        </Text>

        <Button title="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl },
  avatarWrap: { alignSelf: 'center', marginBottom: spacing.xl },
  cameraBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  counter: { alignSelf: 'flex-end', ...typography.small, marginTop: -spacing.sm, marginBottom: spacing.md },
});
