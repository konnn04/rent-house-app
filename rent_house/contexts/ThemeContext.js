import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeManager } from '../utils/theme';
import Colors from '../constants/Colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await ThemeManager.getTheme();
    setTheme(savedTheme);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await ThemeManager.setTheme(newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    colors: Colors[theme]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);