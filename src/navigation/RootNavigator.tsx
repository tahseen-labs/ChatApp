import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuth, useAuthListener } from '../hooks/useAuth';
import { useChats } from '../hooks/useChats';
import { notificationService } from '../services/notificationService';
import { useTheme } from '../theme/index';
import type { RootStackParamList } from '../types/index';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Keeps the global chat store populated for the unread tab badge regardless
 * of which tab the user currently has open. */
const ChatsSync: React.FC = () => {
  useChats();
  return null;
};

export const RootNavigator: React.FC = () => {
  const { colors } = useTheme();
  useAuthListener();
  const { user, initializing } = useAuth();

  useEffect(() => {
    const unsubscribe = notificationService.init();
    notificationService.registerNavigationHandler(({ chatId, otherUserId, otherUserName }) => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'ChatsTab',
          params: { screen: 'ChatRoom', params: { chatId, otherUserId, otherUserName } },
        } as never);
      }
    });
    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user && <ChatsSync />}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
