import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavProp>();
  const { isAuthenticated, isLoading } = useAuth();
  const { brandColors } = useTheme();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <View style={[styles.container, { backgroundColor: brandColors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={brandColors.primary} />
      
      <View style={styles.centerBox}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🛍️</Text>
        </View>

        <Text style={styles.brandTitle}>NEXORA MART</Text>
        <Text style={styles.brandTagline}>Cloud Retail Commerce & Merchant Platform</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator color="#FFFFFF" size="small" />
        <Text style={styles.versionText}>Version 1.0.0 • Multi-Category ERP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  icon: {
    fontSize: 48,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
  },
});

export default SplashScreen;

