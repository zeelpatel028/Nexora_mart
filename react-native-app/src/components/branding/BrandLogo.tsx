import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface BrandLogoProps {
  size?: number;
  textSize?: number;
  showTitle?: boolean;
  showTagline?: boolean;
  tagline?: string;
  variant?: 'standard' | '3d';
  style?: object;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 50,
  textSize = 26,
  showTitle = true,
  showTagline = true,
  tagline = 'All-in-One Store Management',
  variant = 'standard',
  style,
}) => {
  const { isDark, brandColors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {variant === '3d' ? (
        <View style={[styles.imageWrapper, { width: size * 1.5, height: size * 1.5 }]}>
          <Image
            source={require('../../assets/logo-3d.png')}
            style={{ width: size * 1.5, height: size * 1.5 }}
            resizeMode="contain"
          />
        </View>
      ) : (
        /* Reference UI Match: 3 Speed Lines + Orange Rounded M Badge */
        <View style={styles.iconRow}>
          {/* 3 Horizontal Speed/Motion Lines */}
          <View style={styles.speedLinesCol}>
            <View
              style={[
                styles.speedLine,
                {
                  width: size * 0.32,
                  height: Math.max(3, size * 0.07),
                  backgroundColor: brandColors.primary,
                },
              ]}
            />
            <View
              style={[
                styles.speedLine,
                {
                  width: size * 0.48,
                  height: Math.max(3, size * 0.07),
                  backgroundColor: brandColors.primary,
                },
              ]}
            />
            <View
              style={[
                styles.speedLine,
                {
                  width: size * 0.32,
                  height: Math.max(3, size * 0.07),
                  backgroundColor: brandColors.primary,
                },
              ]}
            />
          </View>

          {/* Orange Rounded Badge with Stylized "M" */}
          <View
            style={[
              styles.badge,
              {
                width: size,
                height: size,
                borderRadius: size * 0.3,
                backgroundColor: brandColors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.mLetter,
                {
                  fontSize: size * 0.62,
                  lineHeight: size * 0.72,
                },
              ]}
            >
              M
            </Text>
          </View>
        </View>
      )}

      {/* NEXORA MART Wordmark */}
      {showTitle && (
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.brandNexora,
              {
                fontSize: textSize,
                color: isDark ? '#FFFFFF' : '#111827',
              },
            ]}
          >
            Nexora{' '}
          </Text>
          <Text
            style={[
              styles.brandMart,
              {
                fontSize: textSize,
                color: brandColors.primary,
              },
            ]}
          >
            Mart
          </Text>
        </View>
      )}

      {/* Tagline */}
      {showTagline && tagline ? (
        <Text
          style={[
            styles.tagline,
            { color: isDark ? '#9CA3AF' : '#6B7280' },
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
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  speedLinesCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 28,
    marginRight: 6,
  },
  speedLine: {
    borderRadius: 3,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  mLetter: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandNexora: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandMart: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13.5,
    fontWeight: '400',
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});

export default BrandLogo;
