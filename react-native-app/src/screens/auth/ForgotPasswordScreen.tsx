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
import { useTheme } from '../../hooks/useTheme';
import authService from '../../services/authService';
import { WaveBackground } from '../../components/branding/WaveBackground';
import { BrandLogo } from '../../components/branding/BrandLogo';
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
  const { isDark, colors, brandColors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

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

  // Shop illustration responsive dimensions
  const illustrationWidth = Math.min(width * 0.72, 300);
  const illustrationHeight = illustrationWidth / 1.96;

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

  // Step 3: Reset Password in DB
  const handleResetPassword = async () => {
    setErrorMsg('');
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(identifier.trim(), otp.trim(), newPassword);
      setStep('success');
      Alert.alert(
        'Password Reset Successful! 🎉',
        'Your account password has been updated in the database. You can now log in.',
        [
          {
            text: 'Login Now',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Organic Corner Waves */}
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
          {/* Top Bar with Back Button & Theme Toggle Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[
                styles.navCircularBtn,
                {
                  backgroundColor: colors.toggleBg,
                  borderColor: colors.toggleBorder,
                  shadowColor: '#000000',
                },
              ]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
              accessibilityLabel="Go Back"
            >
              <ArrowLeftIcon
                size={18}
                color={isDark ? '#FFFFFF' : '#111827'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navCircularBtn,
                {
                  backgroundColor: colors.toggleBg,
                  borderColor: colors.toggleBorder,
                  shadowColor: '#000000',
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
            {/* Header Title */}
            <View style={styles.headerBlock}>
              <Text
                style={[
                  styles.title,
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
                  styles.subtitle,
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
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* STEP 1: Username / Email Input */}
            {step === 'request' && (
              <>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor:
                        focusedField === 'identifier'
                          ? brandColors.primary
                          : colors.inputBorder,
                      borderWidth: focusedField === 'identifier' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconLeft}>
                    <MailIcon
                      size={19}
                      color={focusedField === 'identifier' ? brandColors.primary : '#9CA3AF'}
                    />
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
                    onFocus={() => setFocusedField('identifier')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: brandColors.primary, marginTop: 12 },
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
                      <ArrowRightIcon size={18} color="#FFFFFF" />
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
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor:
                        focusedField === 'otp'
                          ? brandColors.primary
                          : colors.inputBorder,
                      borderWidth: focusedField === 'otp' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconLeft}>
                    <KeyIcon
                      size={19}
                      color={focusedField === 'otp' ? brandColors.primary : '#9CA3AF'}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827', letterSpacing: 4, fontWeight: '700' },
                    ]}
                    placeholder="6-Digit OTP"
                    placeholderTextColor={colors.textPlaceholder}
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
                    { backgroundColor: brandColors.primary, marginTop: 12 },
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
                      <ArrowRightIcon size={18} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleRequestOtp}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendText, { color: brandColors.primary }]}>
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
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor:
                        focusedField === 'newPassword'
                          ? brandColors.primary
                          : colors.inputBorder,
                      borderWidth: focusedField === 'newPassword' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconLeft}>
                    <LockIcon
                      size={19}
                      color={focusedField === 'newPassword' ? brandColors.primary : '#9CA3AF'}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                    placeholder="New Password (min 6 chars)"
                    placeholderTextColor={colors.textPlaceholder}
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
                  >
                    {showPassword ? (
                      <EyeOffIcon size={19} color={brandColors.primary} />
                    ) : (
                      <EyeIcon size={19} color={colors.textPlaceholder} />
                    )}
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor:
                        focusedField === 'confirmPassword'
                          ? brandColors.primary
                          : colors.inputBorder,
                      borderWidth: focusedField === 'confirmPassword' ? 1.5 : 1,
                    },
                  ]}
                >
                  <View style={styles.inputIconLeft}>
                    <LockIcon
                      size={19}
                      color={focusedField === 'confirmPassword' ? brandColors.primary : '#9CA3AF'}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#111827' },
                    ]}
                    placeholder="Confirm New Password"
                    placeholderTextColor={colors.textPlaceholder}
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
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={19} color={brandColors.primary} />
                    ) : (
                      <EyeIcon size={19} color={colors.textPlaceholder} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: brandColors.primary, marginTop: 12 },
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
                      <ArrowRightIcon size={18} color="#FFFFFF" />
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
                    { color: brandColors.primary },
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
  navCircularBtn: {
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
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
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
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: -0.2,
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
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
});

export default ForgotPasswordScreen;
