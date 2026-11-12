/**
 * Nexora Mart - Brand-New Login Screen
 * Pixel-Perfect Implementation from Provided Reference Specification (Login Ui.png)
 * Supports full Light Mode & Dark Mode with exact layout, proportions, and orange branding.
 */
import React, { useState, useEffect } from 'react';
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
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useScreenSystemBar } from '../../utils/systemBar';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  GoogleIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Dynamic system bars synchronization for Login
  useScreenSystemBar('white');

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Rate limiting 429 countdown timer
  useEffect(() => {
    if (retryCountdown <= 0) return;
    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Focus States
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Store illustration responsive sizing (increased width)
  const illustrationWidth = Math.min(width * 0.88, 350);
  const illustrationHeight = illustrationWidth / 2.2;

  // Primary brand orange color
  const primaryOrange = '#FF6A1A';

  const handleLogin = async () => {
    if (loading || retryCountdown > 0) return;
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
      if (err.status === 429 || (err.message && err.message.toLowerCase().includes('too many'))) {
        const wait = err.retryAfter || 300;
        setRetryCountdown(wait);
        setErrorMsg('Too many login attempts. Please try again in 5 minutes.');
      } else {
        const msg = err.message || 'Login failed. Please verify your credentials.';
        setErrorMsg(msg);
      }
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
      'Sign in with your Google account or use the pre-configured demo store account.',
      [
        {
          text: 'Use Demo Credentials',
          onPress: fillDemoCredentials,
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121316' : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          bounces={false}
        >
          {/* ========================================================
              1. TOP BAR: THEME TOGGLE BUTTON (SUN / MOON)
              Positioned on top-right below system status bar
              ======================================================== */}
          <View style={[styles.topBar, { paddingTop: insets.top > 0 ? insets.top + 8 : 14 }]}>
            <TouchableOpacity
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: isDark ? '#1F222A' : '#FFFFFF',
                  borderColor: isDark ? '#2D323E' : '#F3F4F6',
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.75}
              accessibilityLabel="Toggle Theme Mode"
            >
              {isDark ? (
                <MoonIcon size={18} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <SunIcon size={19} color={primaryOrange} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>

          {/* ========================================================
              2. BRAND LOGO & WORDMARK HEADER
              3D Glossy "M" Ribbon Logo + Wordmark
              ======================================================== */}
          <View style={styles.brandHeader}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/m-logo-3d.png')}
                style={styles.mLogo3d}
                resizeMode="contain"
              />
            </View>

            {/* Wordmark: Nexora Mart */}
            <View style={styles.wordmarkRow}>
              <Text style={[styles.wordNexora, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Nexora{' '}
              </Text>
              <Text style={[styles.wordMart, { color: primaryOrange }]}>Mart</Text>
            </View>

            {/* Tagline */}
            <Text style={[styles.tagline, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              All-in-One Store Management
            </Text>
          </View>

          {/* ========================================================
              4. 3D STOREFRONT ILLUSTRATION
              High-resolution 3D shop matching light/dark mode
              ======================================================== */}
          <View style={styles.storefrontContainer}>
            <Image
              source={
                isDark
                  ? require('../../assets/shop-dark.png')
                  : require('../../assets/shop-light.png')
              }
              style={{
                width: illustrationWidth,
                height: illustrationHeight,
              }}
              resizeMode="contain"
            />
          </View>

          {/* ========================================================
              5. "WELCOME BACK" TITLE SECTION
              ======================================================== */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Welcome Back
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Login to continue to Nexora Mart
            </Text>
          </View>

          {/* Error Message Alert Banner */}
          {errorMsg ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' },
              ]}
            >
              <Text style={[styles.errorText, { color: isDark ? '#FCA5A5' : '#DC2626' }]}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          {/* ========================================================
              6. INPUT FORM FIELDS
              ======================================================== */}
          <View style={styles.formContainer}>
            {/* Input 1: Email or Mobile Number */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: identifierFocused
                    ? primaryOrange
                    : isDark
                    ? '#2D323E'
                    : '#E5E7EB',
                  borderWidth: identifierFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconWrapper}>
                <MailIcon
                  size={19}
                  color={identifierFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Email or Mobile Number"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={identifier}
                onChangeText={(val) => {
                  setIdentifier(val);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setIdentifierFocused(true)}
                onBlur={() => setIdentifierFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Input 2: Password */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: passwordFocused
                    ? primaryOrange
                    : isDark
                    ? '#2D323E'
                    : '#E5E7EB',
                  borderWidth: passwordFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconWrapper}>
                <LockIcon
                  size={19}
                  color={passwordFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
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
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOffIcon
                    size={20}
                    color={isDark ? '#8A909D' : '#9CA3AF'}
                    strokeWidth={1.8}
                  />
                ) : (
                  <EyeIcon
                    size={20}
                    color={isDark ? '#8A909D' : '#9CA3AF'}
                    strokeWidth={1.8}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Options Row: Remember Me & Forgot Password? */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeTouchable}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe
                      ? { backgroundColor: primaryOrange, borderColor: primaryOrange }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: isDark ? '#4B5563' : '#D1D5DB',
                        },
                  ]}
                >
                  {rememberMe && <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.5} />}
                </View>
                <Text
                  style={[
                    styles.rememberMeLabel,
                    { color: isDark ? '#D1D5DB' : '#374151' },
                  ]}
                >
                  Remember Me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotPasswordText, { color: primaryOrange }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* ========================================================
                7. LOGIN BUTTON (ORANGE WITH RIGHT ARROW)
                ======================================================== */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                { backgroundColor: retryCountdown > 0 ? '#9CA3AF' : primaryOrange },
                (loading || retryCountdown > 0) && { opacity: 0.8 }
              ]}
              onPress={handleLogin}
              disabled={loading || retryCountdown > 0}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : retryCountdown > 0 ? (
                <Text style={styles.loginBtnText}>Retry in {formatCountdown(retryCountdown)}</Text>
              ) : (
                <View style={styles.loginBtnContent}>
                  <Text style={styles.loginBtnText}>Login</Text>
                  <ArrowRightIcon size={18} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              )}
            </TouchableOpacity>

            {/* ========================================================
                8. DIVIDER: "or login with"
                ======================================================== */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#262A34' : '#E5E7EB' },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  { color: isDark ? '#6B7280' : '#9CA3AF' },
                ]}
              >
                or login with
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#262A34' : '#E5E7EB' },
                ]}
              />
            </View>

            {/* ========================================================
                9. GOOGLE SIGN-IN BUTTON
                ======================================================== */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? '#2D323E' : '#E5E7EB',
                },
              ]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.googleIconWrapper}>
                <GoogleIcon size={20} />
              </View>
              <Text
                style={[
                  styles.googleBtnText,
                  { color: isDark ? '#FFFFFF' : '#1F2937' },
                ]}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* ========================================================
                10. BOTTOM PROMPT: "Don't have an account? Sign Up"
                ======================================================== */}
            <View style={styles.signupPromptRow}>
              <Text
                style={[
                  styles.signupPromptText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={[styles.signupLinkText, { color: primaryOrange }]}>
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
  root: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },

  // Top Bar & Theme Toggle
  topBar: {
    paddingHorizontal: 22,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Brand Header
  brandHeader: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
    zIndex: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  mLogo3d: {
    width: 66,
    height: 44,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordNexora: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  wordMart: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },

  // 3D Storefront Illustration
  storefrontContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    zIndex: 2,
  },

  // "Welcome Back" Section
  welcomeSection: {
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 10,
    zIndex: 2,
  },
  welcomeTitle: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },

  // Error Banner
  errorBanner: {
    marginHorizontal: 24,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '500',
  },

  // Form Container
  formContainer: {
    paddingHorizontal: 24,
    zIndex: 2,
  },
  inputCard: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  inputIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Options: Remember Me & Forgot Password
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  rememberMeTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rememberMeLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    marginLeft: 7,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Login Button
  loginBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6A1A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 10,
  },

  // Google Button
  googleBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Sign-Up Prompt
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  signupPromptText: {
    fontSize: 13.5,
  },
  signupLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default LoginScreen;
