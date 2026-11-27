import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { EyeIcon, EyeOffIcon } from '../branding/Icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string | React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  isPassword = false,
  containerStyle,
  ...rest
}) => {
  const { colors, brandColors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? brandColors.error
              : isFocused
              ? brandColors.primary
              : colors.border,
            borderWidth: isFocused || error ? 1.5 : 1,
          },
        ]}
      >
        {icon ? (
          <View style={styles.iconWrap}>
            {typeof icon === 'string' ? (
              <Text style={styles.icon}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
            },
          ]}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={Boolean(isPassword && !showPassword)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOffIcon size={18} color={brandColors.primary} />
            ) : (
              <EyeIcon size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.errorText, { color: brandColors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  iconWrap: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    padding: 0,
  },
  eyeBtn: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Input;

