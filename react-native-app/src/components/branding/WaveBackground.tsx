import React from 'react';
import { View, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';

export const WaveBackground: React.FC = () => {
  const { isDark } = useTheme();
  const { width, height } = useWindowDimensions();

  // Top-left wave size
  const tlWidth = Math.min(width * 0.45, 190);
  const tlHeight = Math.min(height * 0.22, 190);

  // Bottom-right wave size
  const brWidth = Math.min(width * 0.38, 160);
  const brHeight = Math.min(height * 0.18, 160);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base Background Color */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: isDark ? '#121316' : '#FFFFFF' },
        ]}
      />

      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Top-Left Gradient for Dark Mode (glowing orange to transparent dark) */}
          <LinearGradient id="tlGradDark" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF7A1A" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#E65100" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#121316" stopOpacity="0.0" />
          </LinearGradient>

          {/* Top-Left Gradient for Light Mode */}
          <LinearGradient id="tlGradLight" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF7A1A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FF8F33" stopOpacity="0.95" />
          </LinearGradient>

          {/* Bottom-Right Gradient */}
          <LinearGradient id="brGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFA048" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#FF6A1A" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Top-Left Corner Wave Swoop */}
        <Path
          d={`M 0 0 L ${tlWidth} 0 C ${tlWidth * 0.8} ${tlHeight * 0.35}, ${tlWidth * 0.35} ${tlHeight * 0.8}, 0 ${tlHeight} Z`}
          fill={isDark ? 'url(#tlGradDark)' : 'url(#tlGradLight)'}
        />

        {/* Bottom-Right Corner Wave Swoop */}
        <Path
          d={`M ${width} ${height - brHeight} C ${width - brWidth * 0.35} ${height - brHeight * 0.8}, ${width - brWidth * 0.8} ${height - brHeight * 0.35}, ${width - brWidth} ${height} L ${width} ${height} Z`}
          fill="url(#brGrad)"
        />
      </Svg>
    </View>
  );
};

export default WaveBackground;
