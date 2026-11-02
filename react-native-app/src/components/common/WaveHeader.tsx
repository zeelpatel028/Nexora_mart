import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface WaveHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const WaveHeader: React.FC<WaveHeaderProps> = ({
  title = 'NEXORA MART',
  subtitle = 'Store Management Platform',
  showLogo = true,
}) => {
  const { brandColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: brandColors.primary }]}>
      {/* Background visual curve */}
      <View style={[styles.waveAccent, { backgroundColor: brandColors.secondary }]} />
      
      <View style={styles.content}>
        {showLogo && (
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛍️</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 48,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    position: 'relative',
  },
  waveAccent: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.25,
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  logoIcon: {
    fontSize: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default WaveHeader;

