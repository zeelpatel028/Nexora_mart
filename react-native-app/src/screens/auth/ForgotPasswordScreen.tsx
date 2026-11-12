import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useScreenSystemBar } from '../../utils/systemBar';
import authService from '../../services/authService';
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  KeyIcon,
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Dynamic system bars synchronization for ForgotPassword
  useScreenSystemBar('white');

  // Step 1: Request OTP; Step 2: Verify OTP; Step 3: Set New Password; Step 4: Success
  const [step, setStep] = useState<'request' | 'verify' | 'new_password' | 'success'>('request');

  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Responsive Storefront illustration sizing matching LoginScreen
  const illustrationWidth = Math.min(width * 0.88, 350);
  const illustrationHeight = illustrationWidth / 2.2;
  const primaryOrange = '#FF6A1A';

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setErrorMsg('');
    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your username or registered email');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(trimmed);
      setStep('verify');
      Alert.alert(
        'OTP Sent 🎉',
        `A 6-digit verification code has been dispatched.${
          res.otp ? `\n\n(Verification Code: ${res.otp})` : ''
        }`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setErrorMsg('');
    const code = otp.trim();
    if (!code || code.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(identifier.trim(), code);
      setStep('new_password');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async () => {
    setErrorMsg('');
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(
        identifier.trim(),
        otp.trim(),
        newPassword,
      );

      Alert.alert(
        'Password Updated Successfully! 🔐',
        'Your password has been changed. You can now login with your new credentials.',
        [
          {
            text: 'Proceed to Login',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121316' : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          bounces={false}
        >
          {/* Top Bar with Back Button & Theme Toggle Button */}
          <View style={[styles.topBar, { paddingTop: insets.top > 0 ? insets.top + 8 : 14 }]}>
            <TouchableOpacity
              style={[
                styles.navCircularBtn,
                {
                  backgroundColor: isDark ? '#1F222A' : '#FFFFFF',
                  borderColor: isDark ? '#2D323E' : '#F3F4F6',
                },
              ]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
              accessibilityLabel="Go Back"
            >
              <ArrowLeftIcon
                size={18}
                color={isDark ? '#FFFFFF' : '#111827'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navCircularBtn,
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

          {/* Brand Logo & Wordmark Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../assets/m-logo-3d.png')}
                style={styles.mLogo3d}
                resizeMode="contain"
              />
            </View>
            <View style={styles.wordmarkRow}>
              <Text style={[styles.wordNexora, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                Nexora{' '}
              </Text>
              <Text style={[styles.wordMart, { color: primaryOrange }]}>Mart</Text>
            </View>
            <Text style={[styles.tagline, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              All-in-One Store Management
            </Text>
          </View>

          {/* 3D Storefront Illustration */}
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

          {/* Form Content Area */}
          <View style={styles.formContainer}>
            {/* Header Title */}
            <View style={styles.welcomeSection}>
              <Text
                style={[
                  styles.welcomeTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                {step === 'request'
                  ? 'Forgot Password'
                  : step === 'verify'
                  ? 'Verify OTP'
                  : 'Set New Password'}
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                {step === 'request'
                  ? 'Enter your username or email to receive a reset code'
                  : step === 'verify'
                  ? `Enter the 6-digit code sent for ${identifier}`
                  : 'Enter and confirm your new secure store password'}
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* STEP 1: Username / Email Input */}
            {step === 'request' && (
              <>
                <View
                  style={[
                    styles.inputCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor:
                        focusedField === 'identifier'
                          ? primaryOrange
                          : isDark
                          ? '#2D323E'
                          : '#E5E7EB',
                      borderWidth: focusedField === 'identifier' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <MailIcon
                      size={19}
                      color={focusedField === 'identifier' ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                    placeholder="User Name or Email"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={identifier}
                    onChangeText={(text) => {
                      setIdentifier(text);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onFocus={() => setFocusedField('identifier')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: primaryOrange },
                    loading && styles.submitBtnDisabled,
                  ]}
                  onPress={handleRequestOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.submitBtnContent}>
                      <Text style={styles.submitBtnText}>Send OTP</Text>
                      <ArrowRightIcon size={18} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: Verify OTP Input */}
            {step === 'verify' && (
              <>
                <View
                  style={[
                    styles.inputCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor:
                        focusedField === 'otp'
                          ? primaryOrange
                          : isDark
                          ? '#2D323E'
                          : '#E5E7EB',
                      borderWidth: focusedField === 'otp' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <KeyIcon
                      size={19}
                      color={focusedField === 'otp' ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827', letterSpacing: 4, fontWeight: '700' },
                    ]}
                    placeholder="6-Digit OTP"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={otp}
                    onChangeText={(text) => {
                      setOtp(text);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: primaryOrange },
                    loading && styles.submitBtnDisabled,
                  ]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.submitBtnContent}>
                      <Text style={styles.submitBtnText}>Verify OTP</Text>
                      <ArrowRightIcon size={18} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleRequestOtp}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, { color: primaryOrange }]}>
                    Didn't receive code? Resend OTP
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 'new_password' && (
              <>
                <View
                  style={[
                    styles.inputCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor:
                        focusedField === 'newPassword'
                          ? primaryOrange
                          : isDark
                          ? '#2D323E'
                          : '#E5E7EB',
                      borderWidth: focusedField === 'newPassword' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <LockIcon
                      size={19}
                      color={focusedField === 'newPassword' ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                    placeholder="New Password (min 6 chars)"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onFocus={() => setFocusedField('newPassword')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    {showPassword ? (
                      <EyeOffIcon size={19} color={primaryOrange} strokeWidth={1.8} />
                    ) : (
                      <EyeIcon size={19} color={isDark ? '#8A909D' : '#9CA3AF'} strokeWidth={1.8} />
                    )}
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputCard,
                    {
                      backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                      borderColor:
                        focusedField === 'confirmPassword'
                          ? primaryOrange
                          : isDark
                          ? '#2D323E'
                          : '#E5E7EB',
                      borderWidth: focusedField === 'confirmPassword' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconWrapper}>
                    <LockIcon
                      size={19}
                      color={focusedField === 'confirmPassword' ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                      strokeWidth={2}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                    placeholder="Confirm New Password"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={19} color={primaryOrange} strokeWidth={1.8} />
                    ) : (
                      <EyeIcon size={19} color={isDark ? '#8A909D' : '#9CA3AF'} strokeWidth={1.8} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: primaryOrange },
                    loading && styles.submitBtnDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.submitBtnContent}>
                      <Text style={styles.submitBtnText}>Update Password</Text>
                      <ArrowRightIcon size={18} color="#FFFFFF" strokeWidth={2.4} />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Footer Navigation Back to Login */}
            <View style={styles.footerRow}>
              <Text
                style={[
                  styles.footerLabel,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Remember your password?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.footerAction,
                    { color: primaryOrange },
                  ]}
                >
                  Login
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
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 4,
    zIndex: 10,
  },
  navCircularBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  storefrontContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    zIndex: 2,
  },
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
  errorBanner: {
    marginHorizontal: 24,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputCard: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginHorizontal: 24,
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
  submitBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 4,
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
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    marginRight: 8,
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  footerLabel: {
    fontSize: 13.5,
    fontWeight: '400',
  },
  footerAction: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;
