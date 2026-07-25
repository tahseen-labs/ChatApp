import storage from '@react-native-firebase/storage';
import { STORAGE_PATHS } from '../constants/index';

const uniqueName = (ext: string) => `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

async function uploadFile(
  localUri: string,
  remotePath: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const ref = storage().ref(remotePath);
  const task = ref.putFile(localUri);

  if (onProgress) {
    task.on('state_changed', (snap) => {
      const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
      onProgress(pct);
    });
  }

  await task;
  return ref.getDownloadURL();
}

export const storageService = {
  async uploadAvatar(uid: string, localUri: string, onProgress?: (pct: number) => void): Promise<string> {
    const ext = localUri.split('.').pop() ?? 'jpg';
    return uploadFile(localUri, `${STORAGE_PATHS.AVATARS}/${uid}/${uniqueName(ext)}`, onProgress);
  },

  async uploadChatImage(
    chatId: string,
    localUri: string,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    const ext = localUri.split('.').pop() ?? 'jpg';
    return uploadFile(localUri, `${STORAGE_PATHS.CHAT_IMAGES}/${chatId}/${uniqueName(ext)}`, onProgress);
  },

  async uploadChatAudio(
    chatId: string,
    localUri: string,
    onProgress?: (pct: number) => void,
  ): Promise<string> {
    return uploadFile(localUri, `${STORAGE_PATHS.CHAT_AUDIO}/${chatId}/${uniqueName('m4a')}`, onProgress);
  },
};
