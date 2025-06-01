import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';

import { AboutAppScreen } from "../settings/AboutAppScreen";
import { LanguageSettingsScreen } from '../settings/LanguageSettingsScreen';
import { NotificationSettingsScreen } from '../settings/NotificationSettingsScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { ChangePasswordScreen } from './ChangePasswordScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { ProfileScreen } from './ProfileScreen';

const ProfileStack = createNativeStackNavigator();

export const ProfileStackScreen = () => {
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
      <ProfileStack.Screen
        name="AboutApp"
        component={AboutAppScreen}
        options={{ headerShown: false }} />
    </ProfileStack.Navigator>
  );
};