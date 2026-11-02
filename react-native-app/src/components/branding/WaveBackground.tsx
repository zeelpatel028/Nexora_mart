import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const WaveBackground: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Deep Dark Base matching screenshot #111520 */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111520' }]} />

      {/* Top-Right Glowing Amber/Orange Aura */}
      <View
        style={[
          styles.waveBlob,
          {
            top: -70,
            right: -70,
            width: SCREEN_WIDTH * 0.85,
            height: SCREEN_WIDTH * 0.85,
            borderRadius: (SCREEN_WIDTH * 0.85) / 2,
            backgroundColor: 'rgba(255, 122, 26, 0.16)',
          },
        ]}
      />
      <View
        style={[
          styles.waveBlob,
          {
            top: -40,
            right: -40,
            width: SCREEN_WIDTH * 0.55,
            height: SCREEN_WIDTH * 0.55,
            borderRadius: (SCREEN_WIDTH * 0.55) / 2,
            backgroundColor: 'rgba(255, 90, 24, 0.14)',
          },
        ]}
      />

      {/* Mid-Left Subtle Warm Glow */}
      <View
        style={[
          styles.waveBlob,
          {
            top: SCREEN_HEIGHT * 0.32,
            left: -90,
            width: SCREEN_WIDTH * 0.65,
            height: SCREEN_WIDTH * 0.65,
            borderRadius: (SCREEN_WIDTH * 0.65) / 2,
            backgroundColor: 'rgba(217, 85, 16, 0.09)',
          },
        ]}
      />

      {/* Bottom-Right Prominent Glowing Orange Wave (Matches Screenshot Corner) */}
      <View
        style={[
          styles.waveBlob,
          {
            bottom: -90,
            right: -60,
            width: SCREEN_WIDTH * 0.85,
            height: SCREEN_WIDTH * 0.85,
            borderRadius: (SCREEN_WIDTH * 0.85) / 2,
            backgroundColor: 'rgba(255, 106, 26, 0.24)',
          },
        ]}
      />
      <View
        style={[
          styles.waveBlob,
          {
            bottom: -110,
            right: -40,
            width: SCREEN_WIDTH * 0.58,
            height: SCREEN_WIDTH * 0.58,
            borderRadius: (SCREEN_WIDTH * 0.58) / 2,
            backgroundColor: 'rgba(255, 161, 38, 0.32)',
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
