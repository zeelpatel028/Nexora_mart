import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const { colors, brandColors, isDark } = useTheme();

  const getButtonStyle = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: isDark ? colors.badgeOrangeBg : brandColors.lightOrange,
          borderWidth: 1,
          borderColor: isDark ? brandColors.darkOrange : '#FFE0B2',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: brandColors.primaryOrange,
        };
      case 'danger':
        return {
          backgroundColor: brandColors.error,
          shadowColor: brandColors.error,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 2,
        };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      case 'primary':
      default:
        return {
          backgroundColor: brandColors.primaryOrange,
          shadowColor: brandColors.primaryOrange,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.28,
          shadowRadius: 8,
          elevation: 3,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'secondary':
        return isDark ? colors.badgeOrangeText : brandColors.darkOrange;
      case 'outline':
        return brandColors.primaryOrange;
      case 'ghost':
        return colors.textPrimary;
      case 'danger':
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseBtn,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabledBtn,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? brandColors.primaryOrange : '#FFFFFF'}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              { color: getTextColor() },
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  fullWidth: {
    width: '100%',
  },
  disabledBtn: {
    opacity: 0.55,
  },
  baseText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default AppButton;
