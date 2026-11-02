import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface BrandLogoProps {
  size?: number;
  textSize?: number;
  showTitle?: boolean;
  showTagline?: boolean;
  tagline?: string;
  style?: object;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 84,
  textSize = 24,
  showTitle = true,
  showTagline = true,
  tagline = 'Smart Shopping, Delivered Fresh',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Ambient Orange Glow behind Logo */}
      <View
        style={[
          styles.glow,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
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
          <Text style={[styles.brandFirst, { fontSize: textSize }]}>NEXORA </Text>
          <Text style={[styles.brandSecond, { fontSize: textSize }]}>MART</Text>
        </View>
      )}

      {/* Tagline */}
      {showTagline && tagline ? (
        <Text style={styles.tagline}>{tagline}</Text>
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
    backgroundColor: 'rgba(255, 106, 26, 0.22)',
    top: 0,
    zIndex: -1,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
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
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandSecond: {
    color: '#FF6A1A',
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  tagline: {
    color: '#8E9CAE',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 3,
    letterSpacing: 0.3,
  },
});

export default BrandLogo;

