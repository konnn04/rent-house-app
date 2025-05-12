import React, { Fragment } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { styles } from '../../styles/style';

import HomeScreen from './MainPage/HomeScreen';
import ChatScreen from './MainPage/ChatScreen';
import FindHouseScreen from './MainPage/FindHouseScreen';
import ProfileScreen from './MainPage/ProfileScreen';
import Notices from './MainPage/Notices';
import { useTheme } from '../../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

export default function Main() {
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
          opacity: 0.97,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Notice" component={Notices} options={{ headerShown: false }}/>
      <Tab.Screen name="Find" component={FindHouseScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}