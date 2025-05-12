import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import HomeScreen from './MainPage/HomeScreen';
import ChatScreen from './MainPage/ChatScreen';
import FindHouseScreen from './MainPage/FindHouseScreen';
import ProfileScreen from './MainPage/ProfileScreen';
import Notices from './MainPage/Notices';
import { useTheme } from '../../contexts/ThemeContext';
import ChatScreen from './main/ChatScreen';
import FindHouseScreen from './main/FindHouseScreen';
import HomeScreen from './main/home/HomeScreen';
import ProfileScreen from './main/profile/ProfileScreen';

import LanguageSettingsScreen from '../settings/LanguageSettingsScreen';
import NotificationSettingsScreen from '../settings/NotificationSettingsScreen';
import SettingsScreen from '../settings/SettingsScreen';
import ChangePasswordScreen from './main/profile/ChangePasswordScreen';
import EditProfileScreen from './main/profile/EditProfileScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => {
  const { colors } = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundPrimary,
        },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Cập nhật thông tin', headerShown: false }} />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }} />
      <ProfileStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ headerShown: false }} />
      <ProfileStack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{ headerShown: false }} />
      <ProfileStack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
};

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