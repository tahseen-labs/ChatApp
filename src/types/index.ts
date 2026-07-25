import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type Timestamp = FirebaseFirestoreTypes.Timestamp;

export type UserStatus = 'online' | 'offline';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  status: UserStatus;
  lastSeen: Timestamp | null;
  fcmTokens: string[];
  createdAt: Timestamp | null;
  usernameLower: string; // for case-insensitive search
}

export type MessageType = 'text' | 'image' | 'audio';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  text: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  audioDuration: number | null;
  createdAt: Timestamp | null;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  readBy: string[];
}

export interface Chat {
  id: string;
  participants: string[];
  participantProfiles: Record<string, Pick<UserProfile, 'name' | 'avatar' | 'status'>>;
  lastMessage: {
    text: string;
    senderId: string;
    type: MessageType;
    createdAt: Timestamp | null;
  } | null;
  unreadCount: Record<string, number>;
  typing: Record<string, boolean>;
  updatedAt: Timestamp | null;
  createdAt: Timestamp | null;
}

export interface AuthState {
  user: UserProfile | null;
  initializing: boolean;
  isAuthenticated: boolean;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  ChatsTab: undefined;
  SearchTab: undefined;
  ProfileTab: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: { chatId: string; otherUserId: string; otherUserName: string };
  ImageViewer: { imageUrl: string };
};

export type SearchStackParamList = {
  SearchUsers: undefined;
  UserPreview: { userId: string };
};

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
};

export interface ApiError {
  code: string;
  message: string;
}
