import React, { createContext, useState, useEffect } from 'react';

const THEME_PREF_KEY = 'nexora_theme_preference';

const ThemeContext = createContext({
  theme: 'system',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  setSystemTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
  // 'system' | 'light' | 'dark'
  const [themePreference, setThemePreference] = useState(() => {
    try {
      return localStorage.getItem(THEME_PREF_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  // Track system preference in real time
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemIsDark(e.matches);

    // Support modern and older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  // Compute active dark state
  const isDark = themePreference === 'system' ? systemIsDark : themePreference === 'dark';

  // Apply to DOM attribute
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.setAttribute('data-theme-preference', themePreference);
    root.classList.toggle('dark', isDark);
  }, [isDark, themePreference]);

  const toggleTheme = () => {
    // Toggles between light and dark
    const next = isDark ? 'light' : 'dark';
    setThemePreference(next);
    try {
      localStorage.setItem(THEME_PREF_KEY, next);
    } catch {
      // Ignore storage errors
    }
  };

  const setTheme = (pref) => {
    setThemePreference(pref);
    try {
      localStorage.setItem(THEME_PREF_KEY, pref);
    } catch {
      // Ignore storage errors
    }
  };

  const setSystemTheme = () => {
    setTheme('system');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themePreference,
        isDark,
        toggleTheme,
        setTheme,
        setSystemTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext };
export default ThemeContext;

