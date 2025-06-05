import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const THEME_KEY = '@theme_mode';

export const ThemeManager = {
  getTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme === null) {
        return Appearance.getColorScheme();
      }
      return savedTheme;
    } catch (error) {
      console.error('Error reading theme:', error);
      return Appearance.getColorScheme();
    }
  },

  setTheme: async (theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  },

  listenToSystemThemeChanges: (callback) => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      callback(colorScheme);
    });
    return subscription;
  }
};