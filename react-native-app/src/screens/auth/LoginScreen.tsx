import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { WaveBackground } from '../../components/branding/WaveBackground';
import { BrandLogo } from '../../components/branding/BrandLogo';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  GoogleIcon,
  CheckIcon,
  CloseIcon,
} from '../../components/branding/Icons';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();
  const { isDark, colors, brandColors } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    setErrorMsg('');
    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your email or mobile number');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login({ email: trimmed, password });
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier('demo@nmart.com');
    setPassword('password123');
    setErrorMsg('');
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Connecting to Google authentication service...',
      [
        {
          text: 'Use Demo Store',
          onPress: fillDemoCredentials,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* 1. Organic Multi-Layer Wave Background (Dynamic Light / Dark) */}
      <WaveBackground />

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ==========================================
              TOP SECTION: Centered Logo + NEXORA MART
             ========================================== */}
          <View style={styles.topSection}>
            <BrandLogo size={88} textSize={26} />
          </View>

          {/* ==========================================
              BOTTOM CARD: Rounded Frosted Card
             ========================================== */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
                borderColor: isDark ? colors.border : '#E8ECEF',
                shadowColor: isDark ? '#000000' : brandColors.primary,
              },
            ]}
          >
            {/* Header: Title & Subtitle */}
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.welcomeTitle,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
              >
                Welcome Back
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  { color: isDark ? '#8E9CAE' : '#5F6375' },
                ]}
              >
                Sign in to continue to Nmart
              </Text>
            </View>

            {/* Quick Demo Pill */}
            <TouchableOpacity
              style={[
                styles.demoPill,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 106, 26, 0.12)'
                    : 'rgba(255, 106, 26, 0.08)',
                  borderColor: isDark
                    ? 'rgba(255, 106, 26, 0.35)'
                    : 'rgba(255, 106, 26, 0.25)',
                },
              ]}
              onPress={fillDemoCredentials}
              activeOpacity={0.8}
            >
              <Text style={styles.demoPillText}>
                ⚡ Tap for Demo:{' '}
                <Text style={styles.demoPillBold}>Alex Morgan</Text> (demo@nmart.com)
              </Text>
            </TouchableOpacity>

            {/* Global Error Alert Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 1. Email / Mobile Number Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
                  borderColor: identifierFocused
                    ? brandColors.primary
                    : isDark
                    ? colors.inputBorder
                    : '#E8ECEF',
                  borderWidth: identifierFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <MailIcon size={19} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Email or Mobile Number"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                value={identifier}
                onChangeText={(text) => {
                  setIdentifier(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setIdentifierFocused(true)}
                onBlur={() => setIdentifierFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {identifier ? (
                <TouchableOpacity
                  onPress={() => setIdentifier('')}
                  style={styles.clearBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <CloseIcon size={16} color={isDark ? '#768499' : '#94A3B8'} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* 2. Password Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
                  borderColor: passwordFocused
                    ? brandColors.primary
                    : isDark
                    ? colors.inputBorder
                    : '#E8ECEF',
                  borderWidth: passwordFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <LockIcon size={19} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOffIcon size={19} color={brandColors.primary} />
                ) : (
                  <EyeIcon size={19} color={isDark ? '#768499' : '#94A3B8'} />
                )}
              </TouchableOpacity>
            </View>

            {/* 3. Options Row: Keep me signed in & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      borderColor: rememberMe
                        ? brandColors.primary
                        : isDark
                        ? '#283348'
                        : '#CBD5E1',
                      backgroundColor: rememberMe
                        ? brandColors.primary
                        : isDark
                        ? '#1B2232'
                        : '#FFFFFF',
                    },
                  ]}
                >
                  {rememberMe && <CheckIcon size={11} color="#FFFFFF" />}
                </View>
                <Text
                  style={[
                    styles.checkboxLabel,
                    { color: isDark ? '#8E9CAE' : '#5F6375' },
                  ]}
                >
                  Keep me signed in
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.forgotLink,
                    { color: brandColors.primary },
                  ]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4. Large Orange Login Button with Arrow */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                { backgroundColor: brandColors.primary },
                loading && styles.loginBtnDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.loginBtnContent}>
                  <Text style={styles.loginBtnText}>Log In</Text>
                  <ArrowRightIcon size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 5. Divider: Or continue with */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#252D3E' : '#E5DFD7' },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  { color: isDark ? '#768499' : '#94A3B8' },
                ]}
              >
                Or continue with
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#252D3E' : '#E5DFD7' },
                ]}
              />
            </View>

            {/* 6. Continue with Google Button */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  backgroundColor: isDark ? colors.socialBg : '#FFFFFF',
                  borderColor: isDark ? colors.socialBorder : '#E8ECEF',
                },
              ]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <GoogleIcon size={19} />
              <Text
                style={[
                  styles.googleBtnText,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* 7. Footer: Don't have an account? Sign Up */}
            <View style={styles.footerRow}>
              <Text
                style={[
                  styles.footerLabel,
                  { color: isDark ? '#8E9CAE' : '#5F6375' },
                ]}
              >
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.footerAction,
                    { color: brandColors.primary },
                  ]}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 24,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    paddingVertical: 12,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  demoPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  demoPillText: {
    color: '#FF6A1A',
    fontSize: 11,
    fontWeight: '600',
  },
  demoPillBold: {
    fontWeight: '800',
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
    borderColor: 'rgba(220, 38, 38, 0.32)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  inputWrapper: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  inputIconLeft: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginBtn: {
    height: 46,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
  googleBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default LoginScreen;
