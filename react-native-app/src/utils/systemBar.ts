/**
 * System Bar Management Utility for Nexora Mart
 * Coordinates Android Status Bar (top) & System Navigation Bar (bottom)
 * with screen backgrounds, ensuring high contrast, correct insets,
 * and dynamic theme synchronization across React Navigation transitions.
 */
import { useCallback } from 'react';
import { NativeModules, Platform, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
  const { statusBg, statusLightIcons, navBg, navLightIcons, translucent = false } = config;

  // React Native built-in StatusBar API
  StatusBar.setBarStyle(statusLightIcons ? 'light-content' : 'dark-content', true);

  if (Platform.OS === 'android') {
    try {
      StatusBar.setBackgroundColor(statusBg, true);
      StatusBar.setTranslucent(translucent);
    } catch {
      // Ignore
    }

    // Native Android SystemBarModule (manages navigation bar & WindowInsetsController)
    if (SystemBarModule?.setBarColors) {
      SystemBarModule.setBarColors(statusBg, statusLightIcons, navBg, navLightIcons);
    } else {
      if (SystemBarModule?.setStatusBarColor) {
        SystemBarModule.setStatusBarColor(statusBg, statusLightIcons);
      }
      if (SystemBarModule?.setNavigationBarColor) {
        SystemBarModule.setNavigationBarColor(navBg, navLightIcons);
      }
    }
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
      let config: SystemBarConfig;

      const surfaceBg = isDark ? '#111520' : '#FFFFFF';
      const defaultNavBg = isDark ? '#111520' : '#FFFFFF';

      if (barTheme === 'orange') {
        config = {
          statusBg: brandColors.primary || '#FF6A1A',
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
    }, [barTheme, isDark, colors.surface, brandColors.primary])
  );
};

export default {
  applySystemBarConfig,
  useScreenSystemBar,
};

