import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContent } from './components/AppContent';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

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