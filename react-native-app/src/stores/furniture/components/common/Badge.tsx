import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', style }) => {
  const { brandColors, colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: brandColors.successLight, text: brandColors.success };
      case 'danger':
        return { bg: brandColors.errorLight, text: brandColors.error };
      case 'warning':
        return { bg: brandColors.warningLight, text: brandColors.warning };
      case 'info':
        return { bg: brandColors.infoLight, text: brandColors.info };
      case 'neutral':
        return { bg: colors.surfaceSubtle, text: colors.textSecondary };
      case 'primary':
      default:
        return { bg: brandColors.primaryLight, text: brandColors.primary };
    }
  };

  const c = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

export default Badge;

