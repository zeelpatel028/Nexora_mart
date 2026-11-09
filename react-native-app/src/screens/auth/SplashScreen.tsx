import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { WaveBackground } from '../../components/branding/WaveBackground';
import { BrandLogo } from '../../components/branding/BrandLogo';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavProp>();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, colors, brandColors } = useTheme();

  // Declarative navigation in AppNavigator automatically handles screen transition
  // once authentication loading completes.

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <WaveBackground />

      <View style={styles.centerBox}>
        <BrandLogo
          size={110}
          textSize={30}
          showTagline={true}
          tagline="Smart Shopping, Delivered Fresh"
        />
      </View>

      <View style={styles.footer}>
        <ActivityIndicator color={brandColors.primary} size="small" />
        <Text style={[styles.versionText, { color: isDark ? '#8E9CAE' : '#6B6F80' }]}>
          Version 1.0.0 • Cloud Retail Platform
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 56,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
});

export default SplashScreen;
