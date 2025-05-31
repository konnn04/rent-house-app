import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { styles } from '../styles/style';
import { AuthStackScreen } from './auth/AuthStackScreen';
import { Loading } from './common/Loading';
import { Main } from './main/Main';

const RootStack = createNativeStackNavigator();

export const AppContent = () => {
  const { colors, paperTheme } = useTheme();
  const { isLoading, userToken } = useAuth();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={paperTheme.custom.statusBarStyle}
        backgroundColor={paperTheme.colors.background}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <NavigationContainer theme={paperTheme}>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isLoading ? (
              <RootStack.Screen name="Loading" component={Loading} />
            ) : userToken ? (
              <RootStack.Screen name="Main" component={Main} />
            ) : (
              <RootStack.Screen name="AuthScreen" component={AuthStackScreen} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </PaperProvider>
  );
};