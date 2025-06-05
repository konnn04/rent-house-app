import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useNotificationCount } from '../../contexts/NotificationCountContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { ChatListScreen } from './chat/ChatListScreen';
import { FeedScreen } from './feeds/FeedScreen';
import { ManageHouse } from './houses/manage/ManageHouse';
import { LookupScreen } from './lookup/LookupScreen';
import { NoticeScreen } from './notices/NoticeScreen';
import { ProfileScreen } from './profiles/ProfileScreen';

const Tab = createBottomTabNavigator();

// Tab configuration object
const TAB_CONFIG = {
  'Trang chủ': {
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
    component: FeedScreen,
    showBadge: false
  },
  'Thông báo': {
    activeIcon: 'notifications',
    inactiveIcon: 'notifications-outline',
    component: NoticeScreen,
    showBadge: true,
    badgeType: 'notifications'
  },
  'Tìm nhà': {
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
    component: LookupScreen,
    showBadge: false
  },
  'Tin nhắn': {
    activeIcon: 'chatbubble',
    inactiveIcon: 'chatbubble-outline',
    component: ChatListScreen,
    showBadge: true,
    badgeType: 'messages'
  },
  'Quản lý nhà': {
    activeIcon: 'business',
    inactiveIcon: 'business-outline',
    component: ManageHouse,
    showBadge: false,
    ownerOnly: true
  },
  'Hồ sơ': {
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
    component: ProfileScreen,
    showBadge: false
  }
};

// Badge component
const TabBadge = ({ count }) => {
  const { colors } = useTheme();
  
  if (!count || count <= 0) return null;
  
  return (
    <View style={{
      position: 'absolute',
      right: -6,
      top: -3,
      backgroundColor: colors.accentColor,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
      borderWidth: 1,
      borderColor: colors.backgroundPrimary,
    }}>
      <Text style={{
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

// Tab screens with notification count integration
export const TabScreens = () => {
  const { colors } = useTheme();
  const { userData } = useUser();
  const isOwner = userData?.role === 'owner';
  const { 
    unreadNotifications, 
    unreadMessages, 
    refreshCounts 
  } = useNotificationCount();
  
  // Refresh counts periodically
  useEffect(() => {
    // Initial fetch
    refreshCounts();
    
    // Set up interval to refresh counts
    const intervalId = setInterval(() => {
      refreshCounts();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [refreshCounts]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Get icon configuration for this route
          const config = TAB_CONFIG[route.name] || TAB_CONFIG['Trang chủ'];
          const iconName = focused ? config.activeIcon : config.inactiveIcon;

          return (
            <View style={{ width: 24, height: 24, alignItems: 'center' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {config.showBadge && config.badgeType === 'notifications' && 
                <TabBadge count={unreadNotifications} />
              }
              {config.showBadge && config.badgeType === 'messages' && 
                <TabBadge count={unreadMessages} />
              }
            </View>
          );
        },
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.backgroundPrimary,
          borderTopWidth: 0,
          elevation: 0,
          height: 50,
          opacity: 1,
        },
      })}
    >
      {/* Dynamically render tabs based on configuration */}
      {Object.entries(TAB_CONFIG).map(([name, config]) => {
        // Skip owner-only tabs for non-owners
        if (config.ownerOnly && !isOwner) return null;
        
        return (
          <Tab.Screen
            key={name}
            name={name}
            component={config.component}
            options={{ headerShown: false }}
            listeners={({ navigation }) => ({
              tabPress: () => {
                // Refresh counts when notification/message tabs are pressed
                if (config.badgeType) {
                  refreshCounts();
                }
              },
            })}
          />
        );
      })}
    </Tab.Navigator>
  );
}