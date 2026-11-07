import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WaveBackground: React.FC = () => {
  const { isDark, colors } = useTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base Background (Cream #FFF9F3 in Light, #111520 in Dark) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? '#111520' : '#FFF9F3' },
        ]}
      />

      {/* Top-Right Glowing Amber/Orange Aura */}
      <View
        style={[
          styles.waveBlob,
          {
            top: -80,
            right: -80,
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            borderRadius: (SCREEN_WIDTH * 0.9) / 2,
            backgroundColor: isDark
              ? 'rgba(255, 122, 26, 0.18)'
              : 'rgba(255, 180, 102, 0.45)',
          },
        ]}
      />
      <View
        style={[
          styles.waveBlob,
          {
            top: -40,
            right: -40,
            width: SCREEN_WIDTH * 0.58,
            height: SCREEN_WIDTH * 0.58,
            borderRadius: (SCREEN_WIDTH * 0.58) / 2,
            backgroundColor: isDark
              ? 'rgba(255, 90, 24, 0.16)'
              : 'rgba(255, 150, 60, 0.35)',
          },
        ]}
      />

      {/* Mid-Left Subtle Warm Glow */}
      <View
        style={[
          styles.waveBlob,
          {
            top: SCREEN_HEIGHT * 0.3,
            left: -100,
            width: SCREEN_WIDTH * 0.7,
            height: SCREEN_WIDTH * 0.7,
            borderRadius: (SCREEN_WIDTH * 0.7) / 2,
            backgroundColor: isDark
              ? 'rgba(217, 85, 16, 0.11)'
              : 'rgba(255, 210, 160, 0.40)',
          },
        ]}
      />

      {/* Bottom-Right Prominent Glowing Orange Wave (Matches Website Corner) */}
      <View
        style={[
          styles.waveBlob,
          {
            bottom: -90,
            right: -60,
            width: SCREEN_WIDTH * 0.88,
            height: SCREEN_WIDTH * 0.88,
            borderRadius: (SCREEN_WIDTH * 0.88) / 2,
            backgroundColor: isDark
              ? 'rgba(255, 106, 26, 0.26)'
              : 'rgba(255, 179, 71, 0.50)',
          },
        ]}
      />
      <View
        style={[
          styles.waveBlob,
          {
            bottom: -110,
            right: -40,
            width: SCREEN_WIDTH * 0.6,
            height: SCREEN_WIDTH * 0.6,
            borderRadius: (SCREEN_WIDTH * 0.6) / 2,
            backgroundColor: isDark
              ? 'rgba(255, 161, 38, 0.32)'
              : 'rgba(255, 140, 50, 0.30)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  waveBlob: {
    position: 'absolute',
  },
});

export default WaveBackground;
