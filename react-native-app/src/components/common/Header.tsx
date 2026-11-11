import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
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
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { colors, brandColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          paddingTop: topInset + 8,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
        translucent={Platform.OS === 'android'}
      />
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' }]}
            onPress={onBack}
            activeOpacity={0.7}
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
    paddingTop: 12,
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
  backText: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
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

