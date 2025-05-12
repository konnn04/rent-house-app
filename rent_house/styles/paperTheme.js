import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import Colors from '../constants/Colors';

// Adapt navigation theme to work with react-native-paper
const { LightTheme: NavigationLightThemeAdapted, DarkTheme: NavigationDarkThemeAdapted } 
  = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

// Define custom fonts with all required variants
const customFonts = {
  regular: {
    fontFamily: 'System',
    fontWeight: 'normal',
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
  },
  bold: {
    fontFamily: 'System',
    fontWeight: 'bold',
  },
  heavy: {
    fontFamily: 'System',
    fontWeight: '900',
  },
};

// Create combined themes for React Navigation + React Native Paper
export const paperThemes = {
  light: {
    ...MD3LightTheme,
    ...NavigationLightThemeAdapted,
    colors: {
      ...MD3LightTheme.colors,
      ...NavigationLightThemeAdapted.colors,
      primary: Colors.light.accentColor,
      onPrimary: '#ffffff',
      primaryContainer: Colors.light.accentColorLight,
      onPrimaryContainer: Colors.light.accentColor,
      secondary: Colors.light.textSecondary,
      onSecondary: '#ffffff',
      secondaryContainer: '#e3dfd8',
      onSecondaryContainer: Colors.light.textSecondary,
      tertiary: Colors.light.infoColor,
      onTertiary: '#ffffff',
      tertiaryContainer: '#c8e6ff',
      onTertiaryContainer: Colors.light.infoColor,
      error: Colors.light.dangerColor,
      onError: '#ffffff',
      errorContainer: '#ffedea',
      onErrorContainer: Colors.light.dangerColor,
      background: Colors.light.backgroundPrimary,
      onBackground: Colors.light.textPrimary,
      surface: Colors.light.backgroundSecondary,
      onSurface: Colors.light.textPrimary,
      surfaceVariant: '#f5f5f5',
      onSurfaceVariant: Colors.light.textSecondary,
      outline: Colors.light.borderColor,
      outlineVariant: '#dadce0',
      // Custom colors that can be used with components directly
      text: Colors.light.textPrimary,
      textSecondary: Colors.light.textSecondary,
      accent: Colors.light.accentColor,
      border: Colors.light.borderColor,
      success: Colors.light.successColor,
      warning: Colors.light.warningColor,
      info: Colors.light.infoColor,
    },
    // Fix for typography variants
    fonts: {
      ...MD3LightTheme.fonts,
      ...customFonts,
      // Add missing Paper typography variants
      displayLarge: { ...customFonts.regular, fontSize: 57, lineHeight: 64 },
      displayMedium: { ...customFonts.regular, fontSize: 45, lineHeight: 52 },
      displaySmall: { ...customFonts.regular, fontSize: 36, lineHeight: 44 },
      headlineLarge: { ...customFonts.regular, fontSize: 32, lineHeight: 40 },
      headlineMedium: { ...customFonts.regular, fontSize: 28, lineHeight: 36 },
      headlineSmall: { ...customFonts.regular, fontSize: 24, lineHeight: 32 },
      titleLarge: { ...customFonts.regular, fontSize: 22, lineHeight: 28 },
      titleMedium: { ...customFonts.medium, fontSize: 16, lineHeight: 24 },
      titleSmall: { ...customFonts.medium, fontSize: 14, lineHeight: 20 },
      bodyLarge: { ...customFonts.regular, fontSize: 16, lineHeight: 24 },
      bodyMedium: { ...customFonts.regular, fontSize: 14, lineHeight: 20 },
      bodySmall: { ...customFonts.regular, fontSize: 12, lineHeight: 16 },
      labelLarge: { ...customFonts.medium, fontSize: 14, lineHeight: 20 },
      labelMedium: { ...customFonts.medium, fontSize: 12, lineHeight: 16 },
      labelSmall: { ...customFonts.medium, fontSize: 11, lineHeight: 16 },
    },
    // Add custom properties for your app's specific needs
    custom: {
      statusBarStyle: 'dark-content',
    }
  },
  dark: {
    ...MD3DarkTheme,
    ...NavigationDarkThemeAdapted,
    colors: {
      ...MD3DarkTheme.colors,
      ...NavigationDarkThemeAdapted.colors,
      primary: Colors.dark.accentColor,
      onPrimary: '#ffffff',
      primaryContainer: Colors.dark.accentColorLight,
      onPrimaryContainer: '#ffffff',
      secondary: Colors.dark.textSecondary,
      onSecondary: '#ffffff',
      secondaryContainer: '#333340',
      onSecondaryContainer: Colors.dark.textSecondary,
      tertiary: Colors.dark.infoColor,
      onTertiary: '#ffffff',
      tertiaryContainer: '#003548',
      onTertiaryContainer: '#c8e6ff',
      error: Colors.dark.dangerColor,
      onError: '#ffffff',
      errorContainer: '#5c160e',
      onErrorContainer: '#ffedea',
      background: Colors.dark.backgroundPrimary,
      onBackground: Colors.dark.textPrimary,
      surface: Colors.dark.backgroundSecondary,
      onSurface: Colors.dark.textPrimary,
      surfaceVariant: '#2c2c35',
      onSurfaceVariant: Colors.dark.textSecondary,
      outline: Colors.dark.borderColor,
      outlineVariant: '#444450',
      // Custom colors
      text: Colors.dark.textPrimary,
      textSecondary: Colors.dark.textSecondary,
      accent: Colors.dark.accentColor,
      border: Colors.dark.borderColor,
      success: Colors.dark.successColor,
      warning: Colors.dark.warningColor,
      info: Colors.dark.infoColor,
    },
    // Fix for typography variants
    fonts: {
      ...MD3DarkTheme.fonts,
      ...customFonts,
      // Add missing Paper typography variants
      displayLarge: { ...customFonts.regular, fontSize: 57, lineHeight: 64 },
      displayMedium: { ...customFonts.regular, fontSize: 45, lineHeight: 52 },
      displaySmall: { ...customFonts.regular, fontSize: 36, lineHeight: 44 },
      headlineLarge: { ...customFonts.regular, fontSize: 32, lineHeight: 40 },
      headlineMedium: { ...customFonts.regular, fontSize: 28, lineHeight: 36 },
      headlineSmall: { ...customFonts.regular, fontSize: 24, lineHeight: 32 },
      titleLarge: { ...customFonts.regular, fontSize: 22, lineHeight: 28 },
      titleMedium: { ...customFonts.medium, fontSize: 16, lineHeight: 24 },
      titleSmall: { ...customFonts.medium, fontSize: 14, lineHeight: 20 },
      bodyLarge: { ...customFonts.regular, fontSize: 16, lineHeight: 24 },
      bodyMedium: { ...customFonts.regular, fontSize: 14, lineHeight: 20 },
      bodySmall: { ...customFonts.regular, fontSize: 12, lineHeight: 16 },
      labelLarge: { ...customFonts.medium, fontSize: 14, lineHeight: 20 },
      labelMedium: { ...customFonts.medium, fontSize: 12, lineHeight: 16 },
      labelSmall: { ...customFonts.medium, fontSize: 11, lineHeight: 16 },
    },
    // Add custom properties for your app's specific needs
    custom: {
      statusBarStyle: 'light-content',
    }
  },
};