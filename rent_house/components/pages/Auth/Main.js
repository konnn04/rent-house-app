import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import LanguageSettingsScreen from '../../settings/LanguageSettingsScreen';
import NotificationSettingsScreen from '../../settings/NotificationSettingsScreen';
import SettingsScreen from '../../settings/SettingsScreen';
import ChangePasswordScreen from '../main/profile/ChangePasswordScreen';
import EditProfileScreen from '../main/profile/EditProfileScreen';
import ProfileScreen from '../main/profile/ProfileScreen';
import CantLogin from './CantLogin';
import Login from './Login';
import Register from './Register';
import Verify from './Verify';

// Create stack navigator for authentication screens
const AuthStack = createNativeStackNavigator();

// Create Profile Stack
const ProfileStack = createNativeStackNavigator();

// Component for Profile tab
const ProfileStackScreen = () => {
  const { colors } = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.backgroundPrimary }
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <ProfileStack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
    </ProfileStack.Navigator>
  );
};

export default function AuthMain() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <AuthStack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.backgroundPrimary,
          },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <AuthStack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        <AuthStack.Screen
          name="Register"
          component={Register}
          options={{ title: 'Đăng ký tài khoản' }}
        />

        <AuthStack.Screen
          name="Verify"
          component={Verify}
          options={{ title: 'Xác thực tài khoản' }}
        />

        <AuthStack.Screen
          name="CantLogin"
          component={CantLogin}
          options={{ title: 'Không thể đăng nhập' }}
        />

        <ProfileStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
      </AuthStack.Navigator>
    </View>
  );
}