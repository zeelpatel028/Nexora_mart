/**
 * Nexora Mart - Brand-New Create Account Screen
 * Pixel-Perfect Implementation from Provided Reference Specification (media_1794072024251_9047cfc3.jpg)
 * Supports full Light Mode & Dark Mode with exact layout, proportions, and orange branding.
 */
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
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  GoogleIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';
import { isValidEmail, isValidPhone } from '../../utils/validators';

type RegisterNavProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  // Form State matching reference UI fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Checkbox State
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Focus States for glowing orange border highlight
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Storefront illustration responsive sizing (matches natural ~1.96:1 aspect ratio)
  const illustrationWidth = Math.min(width * 0.74, 290);
  const illustrationHeight = illustrationWidth / 1.96;

  // Primary brand orange color
  const primaryOrange = '#FF6A1A';

  const validate = () => {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter your full name');
      return false;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return false;
    }
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address');
      return false;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile number');
      return false;
    }
    if (!isValidPhone(phone)) {
      setErrorMsg('Please enter a valid mobile number');
      return false;
    }
    if (!password) {
      setErrorMsg('Please enter a password');
      return false;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return false;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms & Conditions and Privacy Policy');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!validate()) return;

    setLoading(true);
    try {
      // Split full name into first name and surname
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Store Owner';

      await register({
        firstName,
        surname,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        storeType: 'General Store',
        password,
      });

      // Navigate to Home screen with setup modal trigger
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    Alert.alert(
      'Google Sign-Up',
      'Sign up using your Google account or proceed with standard registration.',
      [
        {
          text: 'Fill Demo Account',
          onPress: () => {
            setFullName('Demo Store Owner');
            setEmail('demo.store@nmart.com');
            setPhone('9876543210');
            setPassword('password123');
            setConfirmPassword('password123');
            setErrorMsg('');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const showTermsModal = () => {
    Alert.alert(
      'Terms & Conditions',
      'By using Nexora Mart, you agree to adhere to all terms of service, merchant compliance rules, and safe store operation guidelines.',
      [{ text: 'Understood' }]
    );
  };

  const showPrivacyModal = () => {
    Alert.alert(
      'Privacy Policy',
      'Nexora Mart respects your privacy. Your data, store transactions, and customer details are encrypted and securely stored.',
      [{ text: 'Understood' }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#121316' : '#FFFFFF' }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ========================================================
          1. DECORATIVE TOP-LEFT & BOTTOM-RIGHT ORANGE CURVED WAVES
          Exact visual match to the reference screenshot
          ======================================================== */}
      {/* Top-Left Curve */}
      <View
        pointerEvents="none"
        style={[
          styles.topLeftWave,
          {
            backgroundColor: primaryOrange,
            opacity: isDark ? 0.95 : 0.9,
          },
        ]}
      />
      {isDark && (
        <View
          pointerEvents="none"
          style={[
            styles.topLeftWaveGlow,
            { backgroundColor: 'rgba(255, 106, 26, 0.25)' },
          ]}
        />
      )}

      {/* Bottom-Right Curve */}
      <View
        pointerEvents="none"
        style={[
          styles.bottomRightWave,
          {
            backgroundColor: primaryOrange,
            opacity: isDark ? 0.9 : 0.85,
          },
        ]}
      />
      {isDark && (
        <View
          pointerEvents="none"
          style={[
            styles.bottomRightWaveGlow,
            { backgroundColor: 'rgba(255, 106, 26, 0.22)' },
          ]}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ========================================================
              2. TOP BAR: BACK BUTTON (LEFT) & THEME TOGGLE BUTTON (RIGHT)
              Positioned below system status bar
              ======================================================== */}
          <View style={styles.topBar}>
            {/* Back Button on Top Left */}
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
              accessibilityLabel="Go Back to Login"
            >
              <ArrowLeftIcon
                size={18}
                color={isDark ? '#FFFFFF' : '#111827'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>

            {/* Theme Toggle Button on Top Right */}
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

          {/* ========================================================
              3. BRAND LOGO & WORDMARK HEADER
              3 Horizontal Orange Speed Lines + Orange 'M' Badge
              ======================================================== */}
          <View style={styles.brandHeader}>
            <View style={styles.logoRow}>
              {/* 3 Horizontal Speed Lines */}
              <View style={styles.speedLinesCol}>
                <View style={[styles.speedLine, { width: 14, backgroundColor: primaryOrange }]} />
                <View style={[styles.speedLine, { width: 22, backgroundColor: primaryOrange }]} />
                <View style={[styles.speedLine, { width: 14, backgroundColor: primaryOrange }]} />
              </View>

              {/* Orange Rounded Badge with Stylized "M" */}
              <View style={[styles.logoBadge, { backgroundColor: primaryOrange }]}>
                <Text style={styles.logoMText}>M</Text>
              </View>
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
              5. "CREATE ACCOUNT" TITLE SECTION
              ======================================================== */}
          <View style={styles.titleSection}>
            <Text style={[styles.mainTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Join Nexora Mart and manage your store easily
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
              6. INPUT FORM FIELDS (5 INPUTS IN SPECIFICATION)
              ======================================================== */}
          <View style={styles.formContainer}>
            {/* Field 1: Full Name */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: fullNameFocused
                    ? primaryOrange
                    : isDark
                    ? '#2D323E'
                    : '#E5E7EB',
                  borderWidth: fullNameFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconWrapper}>
                <UserIcon
                  size={19}
                  color={fullNameFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Full Name"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setFullNameFocused(true)}
                onBlur={() => setFullNameFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Field 2: Email Address */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: emailFocused
                    ? primaryOrange
                    : isDark
                    ? '#2D323E'
                    : '#E5E7EB',
                  borderWidth: emailFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconWrapper}>
                <MailIcon
                  size={19}
                  color={emailFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Email Address"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Field 3: Mobile Number */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: phoneFocused
                    ? primaryOrange
                    : isDark
                    ? '#2D323E'
                    : '#E5E7EB',
                  borderWidth: phoneFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconWrapper}>
                <PhoneIcon
                  size={19}
                  color={phoneFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Mobile Number"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                keyboardType="phone-pad"
              />
            </View>

            {/* Field 4: Password */}
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

            {/* Field 5: Confirm Password */}
            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: confirmPasswordFocused
                    ? primaryOrange
                    : isDark
                    ? '#2D323E'
                    : '#E5E7EB',
                  borderWidth: confirmPasswordFocused ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconWrapper}>
                <LockIcon
                  size={19}
                  color={confirmPasswordFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Confirm Password"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? (
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

            {/* ========================================================
                7. TERMS & CONDITIONS CHECKBOX ROW
                Exact visual match with colored hyperlinks
                ======================================================== */}
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={styles.checkboxTouchable}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeTerms
                      ? { backgroundColor: primaryOrange, borderColor: primaryOrange }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: isDark ? '#4B5563' : '#D1D5DB',
                        },
                  ]}
                >
                  {agreeTerms && <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.5} />}
                </View>
              </TouchableOpacity>

              <Text
                style={[
                  styles.termsLabel,
                  { color: isDark ? '#D1D5DB' : '#374151' },
                ]}
              >
                I agree to the{' '}
                <Text
                  style={[styles.termsLink, { color: primaryOrange }]}
                  onPress={showTermsModal}
                >
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text
                  style={[styles.termsLink, { color: primaryOrange }]}
                  onPress={showPrivacyModal}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* ========================================================
                8. CREATE ACCOUNT BUTTON (ORANGE WITH RIGHT ARROW)
                ======================================================== */}
            <TouchableOpacity
              style={[styles.createAccountBtn, { backgroundColor: primaryOrange }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.createBtnContent}>
                  <Text style={styles.createBtnText}>Create Account</Text>
                  <ArrowRightIcon size={18} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              )}
            </TouchableOpacity>

            {/* ========================================================
                9. DIVIDER: "or sign up with"
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
                or sign up with
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#262A34' : '#E5E7EB' },
                ]}
              />
            </View>

            {/* ========================================================
                10. GOOGLE SIGN-UP BUTTON
                ======================================================== */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: isDark ? '#2D323E' : '#E5E7EB',
                },
              ]}
              onPress={handleGoogleSignUp}
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
                11. BOTTOM PROMPT: "Already have an account? Login"
                ======================================================== */}
            <View style={styles.loginPromptRow}>
              <Text
                style={[
                  styles.loginPromptText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.loginLinkText, { color: primaryOrange }]}>
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
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24) + 6,
    paddingBottom: 40,
  },

  // 1. Organic Corner Wave Backgrounds
  topLeftWave: {
    position: 'absolute',
    top: -160,
    left: -130,
    width: 380,
    height: 380,
    borderRadius: 190,
    transform: [{ scaleX: 1.15 }],
  },
  topLeftWaveGlow: {
    position: 'absolute',
    top: -150,
    left: -120,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  bottomRightWave: {
    position: 'absolute',
    bottom: -180,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    transform: [{ scaleY: 0.95 }],
  },
  bottomRightWaveGlow: {
    position: 'absolute',
    bottom: -190,
    right: -150,
    width: 380,
    height: 380,
    borderRadius: 190,
  },

  // 2. Top Navigation Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 10,
  },
  navCircularBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // 3. Brand Header
  brandHeader: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  speedLinesCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 9,
    gap: 4.5,
  },
  speedLine: {
    height: 3.2,
    borderRadius: 2,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  logoMText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: -1,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordNexora: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  wordMart: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.2,
  },

  // 4. Storefront Illustration
  storefrontContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },

  // 5. Title & Subtitle Section
  titleSection: {
    marginTop: 8,
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    marginTop: 3,
    letterSpacing: 0.1,
  },

  // Error Banner
  errorBanner: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // 6. Input Cards
  formContainer: {
    gap: 12,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 13,
    paddingHorizontal: 14,
  },
  inputIconWrapper: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    height: '100%',
    paddingVertical: 0,
    paddingLeft: 4,
  },
  eyeBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 7. Terms & Conditions Row
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  checkboxTouchable: {
    paddingTop: 1,
    paddingRight: 10,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.1,
  },
  termsLink: {
    fontWeight: '600',
  },

  // 8. Create Account Button
  createAccountBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // 9. Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12.5,
    fontWeight: '500',
  },

  // 10. Google Sign-Up Button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
  },
  googleIconWrapper: {
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // 11. Bottom Prompt Row
  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 13.5,
  },
  loginLinkText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});

export default RegisterScreen;

