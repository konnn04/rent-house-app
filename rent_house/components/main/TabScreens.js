import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { ChatListScreen } from './chat/ChatListScreen';
import { FeedScreen } from './feeds/FeedScreen';
import { ManageHouse } from './houses/manage/ManageHouse';
import { LookupScreen } from './lookup/LookupScreen';
import { NoticeScreen } from './notices/NoiceScreen';
import { ProfileScreen } from './profiles/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabScreens = () => {
  const { colors } = useTheme();
  const { userData } = useUser();
  const isOwner = userData?.role === 'owner'
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Notice':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Find':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Chats':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundPrimary,
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          height: 45,
          opacity: 1,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Notice"
        component={NoticeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Find"
        component={LookupScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{ headerShown: false }}
      />
      {isOwner && (
        <Tab.Screen
          name="Admin"
          component={ManageHouse}
          options={{ headerShown: false }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}