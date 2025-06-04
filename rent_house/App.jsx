import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContent } from './components/AppContent';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationCountProvider } from './contexts/NotificationCountContext';
import { SettingsProvider } from './contexts/SettingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <NotificationCountProvider>
              <SettingsProvider>
                <AppContent />
              </SettingsProvider>
            </NotificationCountProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}