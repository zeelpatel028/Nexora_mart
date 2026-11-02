import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
}

export const MailIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size - 1, color, fontWeight: '700', lineHeight: size + 2 }}>✉</Text>
  </View>
);

export const LockIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size - 2, color, fontWeight: '700', lineHeight: size + 2 }}>🔒</Text>
  </View>
);

export const EyeIcon: React.FC<IconProps> = ({ size = 18, color = '#768499' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size, color, fontWeight: '600' }}>👁</Text>
  </View>
);

export const EyeOffIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size, color, fontWeight: '600' }}>⊘</Text>
  </View>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size + 2, color, fontWeight: '900', lineHeight: size + 2 }}>→</Text>
  </View>
);

export const GoogleIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <View style={[styles.googleBadge, { width: size + 2, height: size + 2, borderRadius: (size + 2) / 2 }]}>
    <Text style={{ fontSize: size - 4, fontWeight: '900', color: '#4285F4' }}>G</Text>
  </View>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 12, color = '#FFFFFF' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size, color, fontWeight: '900', lineHeight: size }}>✓</Text>
  </View>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 16, color = '#768499' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size, color, fontWeight: '700', lineHeight: size }}>✕</Text>
  </View>
);

export const UserIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size - 1, color, fontWeight: '700' }}>👤</Text>
  </View>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size - 2, color, fontWeight: '700' }}>📞</Text>
  </View>
);

export const StoreIcon: React.FC<IconProps> = ({ size = 18, color = '#FF6A1A' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size - 2, color, fontWeight: '700' }}>🏪</Text>
  </View>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, color = '#768499' }) => (
  <View style={[styles.center, { width: size, height: size }]}>
    <Text style={{ fontSize: size - 4, color, fontWeight: '700' }}>▼</Text>
  </View>
);

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBadge: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
