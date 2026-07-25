import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatListScreen } from '../screens/Chat/ChatListScreen';
import { ChatRoomScreen } from '../screens/Chat/ChatRoomScreen';
import { ImageViewerScreen } from '../screens/Chat/ImageViewerScreen';
import { useTheme } from '../theme/index';
import type { ChatStackParamList } from '../types/index';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleStyle: { color: colors.headerText },
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chats' }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ title: '' }} />
      <Stack.Screen
        name="ImageViewer"
        component={ImageViewerScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
};
