import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchUsersScreen } from '../screens/Search/SearchUsersScreen';
import { useTheme } from '../theme/index';
import type { SearchStackParamList } from '../types/index';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export const SearchNavigator: React.FC = () => {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText,
        headerTitleStyle: { color: colors.headerText },
      }}
    >
      <Stack.Screen name="SearchUsers" component={SearchUsersScreen} options={{ title: 'New Chat' }} />
    </Stack.Navigator>
  );
};
