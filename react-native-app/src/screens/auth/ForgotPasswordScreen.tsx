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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import authService from '../../services/authService';
import { WaveBackground } from '../../components/branding/WaveBackground';
import {
  KeyIcon,
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
} from '../../components/branding/Icons';
import { isValidEmail } from '../../utils/validators';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark, colors, brandColors } = useTheme();

  // Step 1: Request OTP; Step 2: Verify OTP & New Password; Step 3: Success
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverOtpInfo, setServerOtpInfo] = useState('');

  const handleRequestOtp = async () => {
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.otp) {
        setServerOtpInfo(`Verification OTP: ${res.otp}`);
      }
      setStep('verify');
      Alert.alert(
        'OTP Dispatched',
        `A 6-digit verification code has been dispatched for ${email.trim()}.${
          res.otp ? `\n(Code: ${res.otp})` : ''
        }`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, otp.trim(), newPassword);
      setStep('success');
      Alert.alert('Password Reset', 'Your password has been successfully reset! You can now sign in.');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP and reset password.');
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
      <WaveBackground />

      {/* Top Header Navigation */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark ? colors.surface : '#FFFFFF',
              borderColor: isDark ? colors.border : '#E8ECEF',
            },
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ChevronLeftIcon size={20} color={isDark ? '#FFFFFF' : '#0B0B2B'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#0B0B2B' }]}>
          Reset Password
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 106, 26, 0.16)'
                    : 'rgba(255, 106, 26, 0.10)',
                },
              ]}
            >
              <KeyIcon size={32} color={brandColors.primary} />
            </View>

            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0B0B2B' }]}>
              {step === 'verify'
                ? 'Verify OTP & Reset'
                : step === 'success'
                ? 'Password Reset!'
                : 'Forgot Password?'}
            </Text>

            <Text style={[styles.description, { color: isDark ? '#8E9CAE' : '#5F6375' }]}>
              {step === 'verify'
                ? `Enter the 6-digit OTP code dispatched to ${email} along with your new password.`
                : step === 'success'
                ? 'Your password has been updated successfully. Please sign in with your new credentials.'
                : "Enter your merchant email address below and we'll send you a 6-digit verification OTP."}
            </Text>

            {serverOtpInfo ? (
              <View style={styles.otpPill}>
                <Text style={styles.otpPillText}>⚡ {serverOtpInfo}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            {step === 'request' && (
              <View style={styles.formSection}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
                      borderColor: isDark ? colors.inputBorder : '#E8ECEF',
                    },
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <MailIcon size={18} color={brandColors.primary} />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                    ]}
                    placeholder="Enter registered email address"
                    placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (error) setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: brandColors.primary },
                    loading && styles.btnDisabled,
                  ]}
                  onPress={handleRequestOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.btnText}>Send Verification Code</Text>
                      <ArrowRightIcon size={18} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === 'verify' && (
              <View style={styles.formSection}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
                      borderColor: isDark ? colors.inputBorder : '#E8ECEF',
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#0B0B2B', textAlign: 'center', letterSpacing: 4, fontWeight: '700' },
                    ]}
                    placeholder="6-digit OTP code"
                    placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                    value={otp}
                    onChangeText={(t) => {
                      setOtp(t);
                      if (error) setError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
                      borderColor: isDark ? colors.inputBorder : '#E8ECEF',
                    },
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <LockIcon size={18} color={brandColors.primary} />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                    ]}
                    placeholder="New password (min 6 characters)"
                    placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                    value={newPassword}
                    onChangeText={(t) => {
                      setNewPassword(t);
                      if (error) setError('');
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
                      borderColor: isDark ? colors.inputBorder : '#E8ECEF',
                    },
                  ]}
                >
                  <View style={styles.inputIcon}>
                    <LockIcon size={18} color={brandColors.primary} />
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                    ]}
                    placeholder="Confirm new password"
                    placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      if (error) setError('');
                    }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: brandColors.primary },
                    loading && styles.btnDisabled,
                  ]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.btnContent}>
                      <Text style={styles.btnText}>Set New Password</Text>
                      <ArrowRightIcon size={18} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.formSection}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: brandColors.primary }]}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.88}
                >
                  <View style={styles.btnContent}>
                    <Text style={styles.btnText}>Return to Login</Text>
                    <ArrowRightIcon size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Back to Login link */}
            <TouchableOpacity
              style={styles.cancelLink}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: isDark ? '#8E9CAE' : '#5F6375' }]}>
                Remember your password?{' '}
                <Text style={{ color: brandColors.primary, fontWeight: '700' }}>
                  Log In
                </Text>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 44 : 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  otpPill: {
    backgroundColor: 'rgba(255, 106, 26, 0.12)',
    borderColor: 'rgba(255, 106, 26, 0.35)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  otpPillText: {
    color: '#FF6A1A',
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: 'rgba(220, 38, 38, 0.16)',
    borderColor: 'rgba(220, 38, 38, 0.32)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    width: '100%',
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  inputWrapper: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelLink: {
    marginTop: 8,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 13,
  },
});

export default ForgotPasswordScreen;
