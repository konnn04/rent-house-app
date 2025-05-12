import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState('vi');
  const [notifications, setNotifications] = useState({
    newMessages: true,
    newPosts: true,
    appUpdates: true,
  });
  
  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@settings_language');
        if (savedLanguage) setLanguage(savedLanguage);
        
        const savedNotifications = await AsyncStorage.getItem('@settings_notifications');
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings to storage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('@settings_language', language);
        await AsyncStorage.setItem('@settings_notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    
    saveSettings();
  }, [language, notifications]);
  
  // Update language setting
  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
  };
  
  // Update notification settings
  const updateNotificationSettings = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <SettingsContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        changeLanguage,
        notifications,
        updateNotificationSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;