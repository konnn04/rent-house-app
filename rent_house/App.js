import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native';
import { ThemeProvider } from './contexts/ThemeContext';
import Loading from './components/pages/Loading';
import Auth from './components/pages/Auth';
import Main from './components/pages/Main';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Loading">
            <Stack.Screen name="Loading" component={Loading} />
            <Stack.Screen name="auth" component={Auth} />
            <Stack.Screen name="main" component={Main} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </ThemeProvider>
  );
}