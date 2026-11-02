import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, bordered = true }) => {
  const { colors, isDark } = useTheme();

  const containerStyles = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderColor: bordered ? colors.border : 'transparent',
      borderWidth: bordered ? 1 : 0,
      shadowColor: isDark ? '#000000' : '#FF6A1A',
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
});

export default Card;

