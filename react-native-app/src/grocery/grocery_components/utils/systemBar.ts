
/**
 * System Bar Management Utility for Nexora Mart
 * Coordinates Android Status Bar (top) & System Navigation Bar (bottom)
 * with screen backgrounds, ensuring high contrast, correct insets,
 * and dynamic theme synchronization across React Navigation transitions.
 */
import { useCallback } from 'react';
import { NativeModules, Platform, StatusBar } from 'react-native';
import { useFocusEffect } from '../hooks/useFocusEffect';
import { useTheme } from '../hooks/useTheme';

const { SystemBarModule } = NativeModules;

export interface SystemBarConfig {
  statusBg: string;
  statusLightIcons: boolean;
  navBg: string;
  navLightIcons: boolean;
  translucent?: boolean;
}

/**
 * Directly updates system status and navigation bars.
 */
export const applySystemBarConfig = (config: SystemBarConfig) => {
  try {
    const { statusBg, statusLightIcons, navBg, navLightIcons, translucent = false } = config;

    // React Native built-in StatusBar API
    try {
      StatusBar.setBarStyle(statusLightIcons ? 'light-content' : 'dark-content', true);
    } catch {
      // Ignore
    }

    if (Platform.OS === 'android') {
      try {
        StatusBar.setBackgroundColor(statusBg, true);
        StatusBar.setTranslucent(translucent);
      } catch {
        // Ignore
      }

      // Native Android SystemBarModule (manages navigation bar & WindowInsetsController)
      try {
        if (SystemBarModule && typeof SystemBarModule.setBarColors === 'function') {
          SystemBarModule.setBarColors(statusBg, statusLightIcons, navBg, navLightIcons);
        } else if (SystemBarModule && typeof SystemBarModule.setStatusBarColor === 'function') {
          SystemBarModule.setStatusBarColor(statusBg, statusLightIcons);
          if (typeof SystemBarModule.setNavigationBarColor === 'function') {
            SystemBarModule.setNavigationBarColor(navBg, navLightIcons);
          }
        }
      } catch {
        // Ignore
      }
    }
  } catch (err) {
    console.warn('applySystemBarConfig error:', err);
  }
};

/**
 * Hook to dynamically bind Status Bar & Bottom Navigation Bar to a screen.
 * Automatically activates whenever the screen gains focus.
 *
 * @param barTheme 'orange' (for orange top header screens) | 'white' (for standard white/theme header screens) | custom config
 */
export const useScreenSystemBar = (
  barTheme: 'orange' | 'white' | Partial<SystemBarConfig> = 'white'
) => {
  const { isDark, colors, brandColors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      try {
        let config: SystemBarConfig;

        const surfaceBg = isDark ? '#121212' : '#FFFFFF';
        const defaultNavBg = isDark ? '#1E1E1E' : '#FFFFFF';
        const primaryOrange = brandColors?.primary || '#F57C00';

        if (barTheme === 'orange') {
          config = {
            statusBg: primaryOrange,
            statusLightIcons: true, // White status icons over orange
            navBg: defaultNavBg,
            navLightIcons: isDark, // Dark nav buttons over white nav bar in light mode
            translucent: false,
          };
        } else if (barTheme === 'white') {
          config = {
            statusBg: surfaceBg,
            statusLightIcons: isDark, // Dark status icons over white in light mode
            navBg: defaultNavBg,
            navLightIcons: isDark, // Dark nav buttons over white nav bar in light mode
            translucent: false,
          };
        } else {
          config = {
            statusBg: barTheme.statusBg || surfaceBg,
            statusLightIcons: barTheme.statusLightIcons ?? isDark,
            navBg: barTheme.navBg || defaultNavBg,
            navLightIcons: barTheme.navLightIcons ?? isDark,
            translucent: barTheme.translucent ?? false,
          };
        }

        applySystemBarConfig(config);
      } catch (err) {
        console.warn('useScreenSystemBar callback error:', err);
      }
    }, [barTheme, isDark, colors?.surface, brandColors?.primary])
  );
};

export default {
  applySystemBarConfig,
  useScreenSystemBar,
};

