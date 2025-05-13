import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthStackScreen } from './components/auth/AuthStackScreen';
import { Loading } from './components/common/Loading';
import { Main } from './components/Main';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

// Stack cho tất cả các màn hình
const RootStack = createNativeStackNavigator();

// Component chính của app
const AppContent = () => {
  const { theme, colors, paperTheme } = useTheme();
  const { isLoading, userToken } = useAuth();

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={paperTheme.custom.statusBarStyle}
        backgroundColor={paperTheme.colors.background}
      />
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
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
      </View>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <SettingsProvider>
              <AppContent />
            </SettingsProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});