import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { useTheme } from '../contexts/ThemeContext';
import { ChatStackScreen } from './chat/ChatStackScreen';
import { FeedStackScreen } from './feeds/FeedStackScreen';
import { LookupStackScreen } from './lookup/LookupStackScreen';
import { Notices } from './notices/Notices';
import { ProfileStackScreen } from './profiles/ProfileStackScreen';

const Tab = createBottomTabNavigator();

export const Main = () => {
  const { colors } = useTheme();
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
            case 'Chat':
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
        component={FeedStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Notice"
        component={Notices}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Find"
        component={LookupStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}