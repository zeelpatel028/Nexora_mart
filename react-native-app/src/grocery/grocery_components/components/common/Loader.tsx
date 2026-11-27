import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading Tulsi Mart...',
  size = 'large',
}) => {
  const { brandColors, colors } = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={brandColors.primary} />
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Loader;

