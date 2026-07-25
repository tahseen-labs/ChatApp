import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatNavigator } from './ChatNavigator';
import { SearchNavigator } from './SearchNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useTheme } from '../theme/index';
import { useChatStore } from '../store/chatStore';
import type { MainTabParamList } from '../types/index';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const totalUnread = useChatStore((s) => s.totalUnread());

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'ChatsTab' ? 'chatbubbles' : route.name === 'SearchTab' ? 'search' : 'person';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="ChatsTab"
        component={ChatNavigator}
        options={{ title: 'Chats', tabBarBadge: totalUnread > 0 ? totalUnread : undefined }}
      />
      <Tab.Screen name="SearchTab" component={SearchNavigator} options={{ title: 'Search' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
