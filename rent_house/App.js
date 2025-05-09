import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Loading from './components/pages/Loading';
import Auth from './components/pages/Auth';
import Main from './components/pages/Main';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { theme, colors } = useTheme();

  return (
    <>
      {/* Tùy chỉnh StatusBar */}
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.backgroundPrimary}
      />
      {/* SafeAreaView để bao phủ toàn màn hình */}
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.backgroundPrimary }]}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Loading">
            <Stack.Screen name="Loading" component={Loading} />
            <Stack.Screen name="auth" component={Auth} />
            <Stack.Screen name="main" component={Main} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});