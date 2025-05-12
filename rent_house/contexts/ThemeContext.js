import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';
import { paperThemes } from '../styles/paperTheme';
import { ThemeManager } from '../utils/Theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    loadTheme();
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

  const value = {
    theme,
    toggleTheme,
    colors: Colors[theme],
    paperTheme: paperThemes[theme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);