import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ForgetPassword } from './ForgetPassword';
import { Login } from './Login';
import { Register } from './Register';

// Create stack navigator for authentication screens
const AuthStack = createNativeStackNavigator();

// KeyboardAvoidingView wrapper component
const KeyboardAvoidingWrapper = ({ children, colors }) => {
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      enabled
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export const AuthStackScreen = () => {
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingWrapper colors={colors}>
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
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});