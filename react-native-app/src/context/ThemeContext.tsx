/**
 * Theme Context for System-Based Light / Dark Mode
 * Automatically follows device appearance with manual override support.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme, Appearance, ColorSchemeName } from 'react-native';
import { Colors } from '../constants/colors';
import storage from '../utils/storage';
import { Config } from '../constants/config';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof Colors.light;
  brandColors: typeof Colors;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [deviceScheme, setDeviceScheme] = useState<ColorSchemeName>(
    systemScheme || Appearance.getColorScheme() || 'light'
  );
  // Default to 'system' so the app automatically follows device light/dark mode
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load saved theme preference from storage
  useEffect(() => {
    storage.getItem(Config.STORAGE_KEYS.THEME_MODE).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  // Subscribe to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDeviceScheme(colorScheme);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Update deviceScheme whenever useColorScheme hook updates
  useEffect(() => {
    if (systemScheme) {
      setDeviceScheme(systemScheme);
    }
  }, [systemScheme]);

  // Determine active theme (follows system if mode is 'system')
  const isDark = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return deviceScheme === 'dark';
  }, [mode, deviceScheme]);

  const activeColors = useMemo(() => {
    return isDark ? Colors.dark : Colors.light;
  }, [isDark]);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    await storage.setItem(Config.STORAGE_KEYS.THEME_MODE, newMode);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = isDark ? 'light' : 'dark';
    await setMode(nextMode);
  }, [isDark, setMode]);

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors: activeColors,
      brandColors: Colors,
      setMode,
      toggleTheme,
    }),
    [mode, isDark, activeColors, setMode, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
