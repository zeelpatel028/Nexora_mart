import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useScreenSystemBar } from '../../utils/systemBar';
import { ChevronLeftIcon } from '../branding/Icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: string | React.ReactNode;
    onPress: () => void;
  };
  /**
   * Status bar theme override: defaults to 'white' (matching header background)
   */
  statusBarTheme?: 'white' | 'orange';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  statusBarTheme = 'white',
}) => {
  const navigation = useNavigation<any>();
  const { colors, brandColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Dynamic status bar and bottom navigation bar synchronization on screen focus
  useScreenSystemBar(statusBarTheme);

  // If onBack is not explicitly provided, fall back to navigation.goBack
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Safe area padding for top: insets.top handles notches/cutouts & Android 15/16 edge-to-edge
  const topPadding = insets.top > 0 ? insets.top + 6 : 12;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: topPadding,
        },
      ]}
    >
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }]}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <ChevronLeftIcon size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightAction ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: brandColors.primaryLight }]}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            {typeof rightAction.icon === 'string' ? (
              <Text style={[styles.rightActionIcon, { color: brandColors.primary }]}>
                {rightAction.icon}
              </Text>
            ) : (
              rightAction.icon
            )}
          </TouchableOpacity>
        ) : showBack ? (
          <View style={styles.iconButtonPlaceholder} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 38,
  },
  rightActionIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default Header;
