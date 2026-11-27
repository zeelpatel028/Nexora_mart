import React from 'react';
import { View, Text, Switch, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface ToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const { colors, brandColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E2E8F0', true: brandColors.primary + '80' }}
        thumbColor={value ? brandColors.primary : '#94A3B8'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default Toggle;
