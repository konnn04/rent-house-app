import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ForgetPassword } from './ForgetPassword';
import { Login } from './Login';
import { Register } from './Register';

// Create stack navigator for authentication screens
const AuthStack = createNativeStackNavigator();

export const AuthStackScreen = () => {
  const { colors } = useTheme();

  return (
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
        name="ForgetPassword"
        component={ForgetPassword}
        options={{ title: 'Không thể đăng nhập' }}
      />
    </AuthStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});