/**
 * Theme Context for Light / Dark Mode
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import storage from '../utils/storage';
import { Config } from '../constants/config';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
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
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    storage.getItem(Config.STORAGE_KEYS.THEME_MODE).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const activeColors = isDark ? Colors.dark : Colors.light;

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    await storage.setItem(Config.STORAGE_KEYS.THEME_MODE, newMode);
  };

  const toggleTheme = async () => {
    const nextMode = isDark ? 'light' : 'dark';
    await setMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        colors: activeColors,
        brandColors: Colors,
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;

