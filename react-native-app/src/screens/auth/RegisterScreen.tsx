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
  Modal,
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
  UserIcon,
  MailIcon,
  PhoneIcon,
  StoreIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  GoogleIcon,
  CheckIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from '../../components/branding/Icons';
import { isValidEmail, isValidPhone } from '../../utils/validators';

type RegisterNavProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const STORE_TYPES = [
  'Grocery Store',
  'Clothing Store',
  'Medical / Pharmacy Store',
  'Mobile & Electronics Store',
  'Plastic Store',
  'Handloom store',
  'Furniture Store',
  'Agro Store',
];

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register } = useAuth();
  const { isDark, colors, brandColors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopType, setShopType] = useState(STORE_TYPES[0]);
  const [password, setPassword] = useState('');

  const [showShopPicker, setShowShopPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Shop illustration responsive dimensions (aspect ratio ~1.96:1)
  const illustrationWidth = Math.min(width * 0.72, 300);
  const illustrationHeight = illustrationWidth / 1.96;

  const validate = () => {
    if (!firstName.trim()) {
      setErrorMsg('Please enter your first name');
      return false;
    }
    if (!surname.trim()) {
      setErrorMsg('Please enter your surname');
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
      setErrorMsg('Please enter your phone number');
      return false;
    }
    if (!isValidPhone(phone)) {
      setErrorMsg('Please enter a valid phone number');
      return false;
    }
    if (!shopType) {
      setErrorMsg('Please select your shop type');
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
      await register({
        firstName: firstName.trim(),
        surname: surname.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        storeType: shopType,
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
      'Connecting to Google authentication service...',
      [{ text: 'OK' }]
    );
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
            {/* Title & Subtitle */}
            <View style={styles.headerBlock}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Create Account
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Join Nexora Mart and manage your store easily
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 1. First Name & Surname Row */}
            <View style={styles.nameRow}>
              {/* First Name */}
              <View
                style={[
                  styles.inputWrapper,
                  styles.nameInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor:
                      focusedField === 'firstName'
                        ? brandColors.primary
                        : colors.inputBorder,
                    borderWidth: focusedField === 'firstName' ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.inputIconLeft}>
                  <UserIcon
                    size={18}
                    color={focusedField === 'firstName' ? brandColors.primary : '#9CA3AF'}
                  />
                </View>
                <TextInput
                  style={[
                    styles.textInput,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                  placeholder="First Name"
                  placeholderTextColor={colors.textPlaceholder}
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>

              {/* Surname */}
              <View
                style={[
                  styles.inputWrapper,
                  styles.nameInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor:
                      focusedField === 'surname'
                        ? brandColors.primary
                        : colors.inputBorder,
                    borderWidth: focusedField === 'surname' ? 1.5 : 1,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.textInput,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                  placeholder="Surname"
                  placeholderTextColor={colors.textPlaceholder}
                  value={surname}
                  onChangeText={(text) => {
                    setSurname(text);
                    if (errorMsg) setErrorMsg('');
                  }}
                  onFocus={() => setFocusedField('surname')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* 2. Email Address Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    focusedField === 'email'
                      ? brandColors.primary
                      : colors.inputBorder,
                  borderWidth: focusedField === 'email' ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <MailIcon
                  size={19}
                  color={focusedField === 'email' ? brandColors.primary : '#9CA3AF'}
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
                placeholder="Email Address"
                placeholderTextColor={colors.textPlaceholder}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* 3. Mobile Number Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    focusedField === 'phone'
                      ? brandColors.primary
                      : colors.inputBorder,
                  borderWidth: focusedField === 'phone' ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <PhoneIcon
                  size={19}
                  color={focusedField === 'phone' ? brandColors.primary : '#9CA3AF'}
                />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
                placeholder="Phone Number"
                placeholderTextColor={colors.textPlaceholder}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                keyboardType="phone-pad"
              />
            </View>

            {/* 4. Select Shop Type Dropdown */}
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: showShopPicker
                    ? brandColors.primary
                    : colors.inputBorder,
                  borderWidth: showShopPicker ? 1.5 : 1,
                },
              ]}
              onPress={() => setShowShopPicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.inputIconLeft}>
                <StoreIcon size={19} color={brandColors.primary} />
              </View>
              <View style={styles.selectTextWrap}>
                <Text
                  style={[
                    styles.selectValueText,
                    { color: isDark ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  {shopType}
                </Text>
              </View>
              <ChevronDownIcon size={18} color={colors.textPlaceholder} />
            </TouchableOpacity>

            {/* 5. Password Input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.inputBg,
                  borderColor:
                    focusedField === 'password'
                      ? brandColors.primary
                      : colors.inputBorder,
                  borderWidth: focusedField === 'password' ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.inputIconLeft}>
                <LockIcon
                  size={19}
                  color={focusedField === 'password' ? brandColors.primary : '#9CA3AF'}
                />
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
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
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

            {/* 6. Terms & Conditions Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: agreeTerms
                      ? brandColors.primary
                      : isDark
                      ? '#374151'
                      : '#D1D5DB',
                    backgroundColor: agreeTerms
                      ? brandColors.primary
                      : 'transparent',
                  },
                ]}
              >
                {agreeTerms && <CheckIcon size={11} color="#FFFFFF" />}
              </View>
              <Text
                style={[
                  styles.termsText,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                I agree to the{' '}
                <Text style={{ color: brandColors.primary, fontWeight: '600' }}>
                  Terms & Conditions
                </Text>{' '}
                and{' '}
                <Text style={{ color: brandColors.primary, fontWeight: '600' }}>
                  Privacy Policy.
                </Text>
              </Text>
            </TouchableOpacity>

            {/* 7. Create Account Button with Arrow */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: brandColors.primary },
                loading && styles.submitBtnDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.submitBtnContent}>
                  <Text style={styles.submitBtnText}>Create Account</Text>
                  <ArrowRightIcon size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 8. Divider: or sign up with */}
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
                or sign up with
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: colors.divider },
                ]}
              />
            </View>

            {/* 9. Continue with Google Button */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  backgroundColor: colors.socialBg,
                  borderColor: colors.socialBorder,
                },
              ]}
              onPress={handleGoogleSignUp}
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

            {/* 10. Footer: Already have an account? Login */}
            <View style={styles.footerRow}>
              <Text
                style={[
                  styles.footerLabel,
                  { color: isDark ? '#9CA3AF' : '#6B7280' },
                ]}
              >
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
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

      {/* SHOP TYPE SELECTOR MODAL */}
      <Modal
        visible={showShopPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShopPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowShopPicker(false)}
        >
          <View
            style={[
              styles.pickerSheet,
              { backgroundColor: isDark ? '#1C1E24' : '#FFFFFF' },
            ]}
          >
            <View style={styles.pickerHeader}>
              <Text
                style={[
                  styles.pickerTitle,
                  { color: isDark ? '#FFFFFF' : '#111827' },
                ]}
              >
                Select Store Type
              </Text>
              <TouchableOpacity
                onPress={() => setShowShopPicker(false)}
                style={styles.pickerDoneBtn}
              >
                <Text style={{ color: brandColors.primary, fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {STORE_TYPES.map((type) => {
                const isSelected = shopType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerItem,
                      isSelected && {
                        backgroundColor: isDark
                          ? 'rgba(255, 106, 26, 0.15)'
                          : 'rgba(255, 106, 26, 0.08)',
                      },
                    ]}
                    onPress={() => {
                      setShopType(type);
                      setShowShopPicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerItemLeft}>
                      <StoreIcon
                        size={18}
                        color={isSelected ? brandColors.primary : '#9CA3AF'}
                      />
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: isDark ? '#FFFFFF' : '#111827' },
                          isSelected && {
                            color: brandColors.primary,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {type}
                      </Text>
                    </View>
                    {isSelected && (
                      <CheckIcon size={16} color={brandColors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 0.485,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 11,
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
  selectTextWrap: {
    flex: 1,
  },
  selectValueText: {
    fontSize: 14.5,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 18,
    paddingRight: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
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
    marginTop: 22,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '65%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerDoneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default RegisterScreen;
