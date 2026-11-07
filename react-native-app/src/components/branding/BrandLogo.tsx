import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface BrandLogoProps {
  size?: number;
  textSize?: number;
  showTitle?: boolean;
  showTagline?: boolean;
  tagline?: string;
  style?: object;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 88,
  textSize = 25,
  showTitle = true,
  showTagline = true,
  tagline = 'Smart Shopping, Delivered Fresh',
  style,
}) => {
  const { isDark, colors, brandColors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Ambient Orange Glow behind Logo */}
      <View
        style={[
          styles.glow,
          {
            width: size * 1.45,
            height: size * 1.45,
            borderRadius: (size * 1.45) / 2,
            backgroundColor: isDark
              ? 'rgba(255, 106, 26, 0.22)'
              : 'rgba(255, 122, 26, 0.16)',
          },
        ]}
      />

      {/* 3D M Logo Image */}
      <View style={[styles.imageWrapper, { width: size, height: size }]}>
        <Image
          source={require('../../assets/logo-m.png')}
          style={{ width: size, height: size, borderRadius: 22 }}
          resizeMode="contain"
        />
      </View>

      {/* NEXORA MART Wordmark */}
      {showTitle && (
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.brandFirst,
              {
                fontSize: textSize,
                color: isDark ? '#FFFFFF' : '#0B0B2B',
              },
            ]}
          >
            NEXORA{' '}
          </Text>
          <Text
            style={[
              styles.brandSecond,
              {
                fontSize: textSize,
                color: brandColors.primary,
              },
            ]}
          >
            MART
          </Text>
        </View>
      )}

      {/* Tagline */}
      {showTagline && tagline ? (
        <Text
          style={[
            styles.tagline,
            { color: isDark ? '#8E9CAE' : '#6B6F80' },
          ]}
        >
          {tagline}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -10,
    zIndex: -1,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  brandFirst: {
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandSecond: {
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});

export default BrandLogo;
