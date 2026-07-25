import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { createSound } from 'react-native-nitro-sound';
import { useTheme, spacing, radii } from '../../theme';

interface ChatInputToolbarProps {
  onSendText: (text: string) => void;
  onSendImage: (localUri: string) => void;
  onSendAudio: (localUri: string, durationSec: number) => void;
  onTextChange: (text: string) => void;
}

const audioRecorder = createSound()

export const ChatInputToolbar: React.FC<ChatInputToolbarProps> = ({
  onSendText,
  onSendImage,
  onSendAudio,
  onTextChange,
}) => {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recordStartRef = useRef<number>(0);

  const handleChangeText = (value: string) => {
    setText(value);
    onTextChange(value);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
    onTextChange('');
  };

  const requestMediaPermission = async (type: 'camera' | 'photo'): Promise<boolean> => {
    const permission =
      type === 'camera'
        ? Platform.select({ ios: PERMISSIONS.IOS.CAMERA, android: PERMISSIONS.ANDROID.CAMERA })
        : Platform.select({
            ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
            android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          });
    if (!permission) return true;
    const result = await request(permission);
    return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
  };

  const pickFromGallery = async () => {
    const granted = await requestMediaPermission('photo');
    if (!granted) return Alert.alert('Permission required', 'Please allow photo library access.');
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    const uri = result.assets?.[0]?.uri;
    if (uri) onSendImage(uri);
  };

  const captureFromCamera = async () => {
    const granted = await requestMediaPermission('camera');
    if (!granted) return Alert.alert('Permission required', 'Please allow camera access.');
    const result = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true });
    const uri = result.assets?.[0]?.uri;
    if (uri) onSendImage(uri);
  };

  const startRecording = async () => {
    const permission = Platform.select({ ios: PERMISSIONS.IOS.MICROPHONE, android: PERMISSIONS.ANDROID.RECORD_AUDIO });
    if (permission) {
      const result = await request(permission);
      if (result !== RESULTS.GRANTED) {
        return Alert.alert('Permission required', 'Please allow microphone access to record voice messages.');
      }
    }
    recordStartRef.current = Date.now();
    await audioRecorder.startRecorder();
    setIsRecording(true);
  };

  const stopRecording = async (send: boolean) => {
    const uri = await audioRecorder.stopRecorder();
    audioRecorder.removeRecordBackListener();
    setIsRecording(false);
    const durationSec = (Date.now() - recordStartRef.current) / 1000;
    if (send && durationSec >= 1) onSendAudio(uri, durationSec);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TouchableOpacity onPress={pickFromGallery} style={styles.iconButton}>
        <Icon name="image-outline" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={captureFromCamera} style={styles.iconButton}>
        <Icon name="camera-outline" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
        placeholder="Message"
        placeholderTextColor={colors.textTertiary}
        value={text}
        onChangeText={handleChangeText}
        multiline
      />

      {text.trim().length > 0 ? (
        <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
          <Icon name="send" size={18} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPressIn={startRecording}
          onPressOut={() => stopRecording(true)}
          onLongPress={() => {}}
          style={[styles.sendButton, { backgroundColor: isRecording ? colors.danger : colors.primary }]}
        >
          <Icon name="mic" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconButton: { padding: 8 },
  input: {
    flex: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 100,
    marginHorizontal: spacing.xs,
    fontSize: 15.5,
  },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
