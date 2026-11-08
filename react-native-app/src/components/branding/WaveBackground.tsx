import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export const WaveBackground: React.FC = () => {
  const { isDark } = useTheme();
  const primaryOrange = '#FF6A1A';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base Background (#FFFFFF in Light, #121316 in Dark) */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? '#121316' : '#FFFFFF' },
        ]}
      />

      {/* Top-Left Prominent Orange Curved Wave */}
      <View
        style={[
          styles.topLeftWave,
          {
            backgroundColor: primaryOrange,
            opacity: isDark ? 0.95 : 0.9,
          },
        ]}
      />
      {isDark && (
        <View
          style={[
            styles.topLeftWaveGlow,
            { backgroundColor: 'rgba(255, 106, 26, 0.25)' },
          ]}
        />
      )}

      {/* Bottom-Right Prominent Orange Curved Wave */}
      <View
        style={[
          styles.bottomRightWave,
          {
            backgroundColor: primaryOrange,
            opacity: isDark ? 0.9 : 0.85,
          },
        ]}
      />
      {isDark && (
        <View
          style={[
            styles.bottomRightWaveGlow,
            { backgroundColor: 'rgba(255, 106, 26, 0.22)' },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topLeftWave: {
    position: 'absolute',
    top: -160,
    left: -130,
    width: 380,
    height: 380,
    borderRadius: 190,
    transform: [{ scaleX: 1.15 }],
  },
  topLeftWaveGlow: {
    position: 'absolute',
    top: -150,
    left: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  bottomRightWave: {
    position: 'absolute',
    bottom: -180,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    transform: [{ scaleY: 0.95 }],
  },
  bottomRightWaveGlow: {
    position: 'absolute',
    bottom: -190,
    right: -150,
    width: 380,
    height: 380,
    borderRadius: 190,
  },
});

export default WaveBackground;
