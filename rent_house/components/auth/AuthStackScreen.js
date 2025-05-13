import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CantLogin } from './CantLogin';
import { Login } from './Login';
import { Register } from './Register';
import { Verify } from './Verify';

// Create stack navigator for authentication screens
const AuthStack = createNativeStackNavigator();

export const AuthStackScreen = () => {
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
      </AuthStack.Navigator>
    </View>
  );
}