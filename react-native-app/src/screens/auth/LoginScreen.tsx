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
  Image,
  useWindowDimensions,
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
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();
  const { isDark, colors, brandColors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [identifierFocused, setIdentifierFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Shop illustration responsive dimensions (aspect ratio ~1.96:1)
  const illustrationWidth = Math.min(width * 0.72, 300);
  const illustrationHeight = illustrationWidth / 1.96;

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

      {/* Organic Top-Left & Bottom-Right Corner Waves */}
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
          {/* Top Bar with Theme Toggle Button */}
          <View style={styles.topBar}>
            <View style={styles.topBarSpacer} />
            <TouchableOpacity
              style={[
                styles.themeToggleBtn,
                {
                  backgroundColor: colors.toggleBg,
                  borderColor: colors.toggleBorder,
                  shadowColor: isDark ? '#000000' : '#000000',
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.75}
              accessibilityLabel="Toggle Theme Mode"
            >
              {isDark ? (
                <MoonIcon size={18} color="#FFFFFF" />
              ) : (
                <SunIcon size={19} color={brandColors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Brand Logo & Wordmark Header */}
          <View style={styles.logoSection}>
            <BrandLogo size={46} textSize={25} />
          </View>

          {/* 3D Storefront Illustration */}
          <View style={styles.illustrationSection}>
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

          {/* Form Content Area */}
          <View style={styles.formContainer}>
            {/* Title & Subtitle */}
            <View style={styles.headerBlock}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Welcome Back
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Login to continue to Nexora Mart
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 1. Email or Mobile Number Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: identifierFocused
                    ? brandColors.primary
                    : colors.inputBorder,
                  borderWidth: identifierFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <MailIcon size={19} color={identifierFocused ? brandColors.primary : '#9CA3AF'} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
                placeholder="User Name or Email"
                placeholderTextColor={colors.textPlaceholder}
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
                  <CloseIcon size={16} color={colors.textPlaceholder} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* 2. Password Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: passwordFocused
                    ? brandColors.primary
                    : colors.inputBorder,
                  borderWidth: passwordFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <LockIcon size={19} color={passwordFocused ? brandColors.primary : '#9CA3AF'} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
                placeholder="Password"
                placeholderTextColor={colors.textPlaceholder}
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
                  <EyeIcon size={19} color={colors.textPlaceholder} />
                )}
              </TouchableOpacity>
            </View>

            {/* 3. Options Row: Remember Me & Forgot Password */}
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
                        ? '#374151'
                        : '#D1D5DB',
                      backgroundColor: rememberMe
                        ? brandColors.primary
                        : 'transparent',
                    },
                  ]}
                >
                  {rememberMe && <CheckIcon size={11} color="#FFFFFF" />}
                </View>
                <Text
                  style={[
                    styles.checkboxLabel,
                    { color: isDark ? '#D1D5DB' : '#374151' },
                  ]}
                >
                  Remember Me
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

            {/* 4. Login Button with Arrow */}
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
                  <Text style={styles.loginBtnText}>Login</Text>
                  <ArrowRightIcon size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 5. Divider: or login with */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.divider },
                ]}
              />
              <Text
                style={[
                  styles.dividerText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                or login with
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.divider },
                ]}
              />
            </View>

            {/* 6. Continue with Google Button */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  backgroundColor: colors.socialBg,
                  borderColor: colors.socialBorder,
                },
              ]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <GoogleIcon size={20} />
              <Text
                style={[
                  styles.googleBtnText,
                  { color: colors.socialText },
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
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
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

            {/* Demo Helper Button (discreetly placed for quick testing) */}
            <TouchableOpacity
              style={styles.demoPill}
              onPress={fillDemoCredentials}
              activeOpacity={0.65}
            >
              <Text
                style={[
                  styles.demoPillText,
                  { color: isDark ? '#4B5563' : '#CBD5E1' },
                ]}
              >
                ⚡ Fill Demo Store Credentials
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 52,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  topBarSpacer: {
    width: 38,
    height: 38,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  formContainer: {
    width: '100%',
  },
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: -0.2,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIconLeft: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    fontWeight: '400',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
  },
  eyeBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  forgotLink: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  loginBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '400',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  googleBtnText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  footerAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  demoPill: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default LoginScreen;
