import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { paperThemes } from '../styles/paperTheme';
import { ThemeManager } from '../utils/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  const [userPreferSystemTheme, setUserPreferSystemTheme] = useState(true); // Mặc định là true
  
  useEffect(() => {
    loadTheme();
  }, []);

  // Consider listening to system theme changes
  useEffect(() => {
    const subscription = ThemeManager.listenToSystemThemeChanges(newTheme => {
      // Optional: automatically follow system theme changes
      if (userPreferSystemTheme) {
        setTheme(newTheme);
        ThemeManager.setTheme(newTheme);
      }
    });
    
    return () => subscription?.remove?.();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await ThemeManager.getTheme();
    setTheme(savedTheme || systemTheme || 'light');
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await ThemeManager.setTheme(newTheme);
    setTheme(newTheme);
  };
  
  // Use useMemo to optimize re-renders
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    colors: Colors[theme],
    paperTheme: paperThemes[theme],
    isDark: theme === 'dark',
    getComponentTheme: (lightStyle, darkStyle) => theme === 'dark' ? darkStyle : lightStyle
  }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);