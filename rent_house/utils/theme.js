import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@theme_mode';

export const ThemeManager = {
  // Lấy theme từ storage hoặc hệ thống
  getTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme === null) {
        // Nếu chưa có theme được lưu, lấy theo hệ thống
        return Appearance.getColorScheme();
      }
      return savedTheme;
    } catch (error) {
      console.error('Error reading theme:', error);
      return Appearance.getColorScheme();
    }
  },

  // Lưu theme mới
  setTheme: async (theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  },

  // Theo dõi sự thay đổi theme của hệ thống
  listenToSystemThemeChanges: (callback) => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      callback(colorScheme);
    });
    return subscription;
  }
};