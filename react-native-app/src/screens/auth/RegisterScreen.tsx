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
  Modal,
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
  UserIcon,
  MailIcon,
  PhoneIcon,
  StoreIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CheckIcon,
} from '../../components/branding/Icons';
import { isValidEmail, isValidPhone } from '../../utils/validators';

type RegisterNavProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const STORE_TYPES = [
  'Retail & Supermarket',
  'Supermarket & Grocery',
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Pharmacy & Healthcare',
  'Fresh Fruits & Vegetables',
  'General Retail',
];

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register } = useAuth();
  const { isDark, colors, brandColors } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [storeType, setStoreType] = useState(STORE_TYPES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    if (!fullName.trim()) {
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
      setErrorMsg('Please enter your phone number');
      return false;
    }
    if (!isValidPhone(phone)) {
      setErrorMsg('Please enter a valid phone number');
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
      setErrorMsg('Please accept the Terms & Conditions to proceed');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!validate()) return;

    // Split Full Name into First Name & Surname for backend schema
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Merchant';
    const surname = nameParts.slice(1).join(' ') || firstName;

    setLoading(true);
    try {
      await register({
        firstName,
        surname,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        storeType,
        password,
      });

      Alert.alert(
        'Store Created 🎉',
        `Welcome to Nexora Mart, ${firstName}! Your merchant workspace is active.`,
        [
          {
            text: 'Launch Store',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const getInputWrapperStyle = (fieldName: string) => {
    const isFocused = focusedField === fieldName;
    return [
      styles.inputWrapper,
      {
        backgroundColor: isDark ? colors.inputBg : '#FFFFFF',
        borderColor: isFocused
          ? brandColors.primary
          : isDark
          ? colors.inputBorder
          : '#E8ECEF',
        borderWidth: isFocused ? 1.5 : 1,
      },
    ];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Background Waves */}
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
          {/* Top Branding Section */}
          <View style={styles.topSection}>
            <BrandLogo size={76} textSize={24} showTagline={false} />
          </View>

          {/* Form Card */}
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
                  styles.title,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
              >
                Create Account
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? '#8E9CAE' : '#5F6375' },
                ]}
              >
                Sign up to continue to Nmart
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 1. Full Name */}
            <View style={getInputWrapperStyle('fullName')}>
              <View style={styles.inputIconLeft}>
                <UserIcon size={18} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Full Name (e.g. Alex Morgan)"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="words"
              />
            </View>

            {/* 2. Email Address */}
            <View style={getInputWrapperStyle('email')}>
              <View style={styles.inputIconLeft}>
                <MailIcon size={18} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Email address"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* 3. Mobile Number */}
            <View style={getInputWrapperStyle('phone')}>
              <View style={styles.inputIconLeft}>
                <PhoneIcon size={18} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Mobile Number (e.g. 9876543210)"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
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

            {/* 4. Store / Business Category */}
            <TouchableOpacity
              style={getInputWrapperStyle('storeType')}
              onPress={() => setShowStorePicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.inputIconLeft}>
                <StoreIcon size={18} color={brandColors.primary} />
              </View>
              <Text
                style={[
                  styles.pickerText,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                numberOfLines={1}
              >
                {storeType}
              </Text>
              <ChevronDownIcon size={16} color={isDark ? '#768499' : '#94A3B8'} />
            </TouchableOpacity>

            {/* 5. Password */}
            <View style={getInputWrapperStyle('password')}>
              <View style={styles.inputIconLeft}>
                <LockIcon size={18} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Password (min 6 characters)"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
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
                  <EyeOffIcon size={18} color={brandColors.primary} />
                ) : (
                  <EyeIcon size={18} color={isDark ? '#768499' : '#94A3B8'} />
                )}
              </TouchableOpacity>
            </View>

            {/* 6. Confirm Password */}
            <View style={getInputWrapperStyle('confirmPassword')}>
              <View style={styles.inputIconLeft}>
                <LockIcon size={18} color={brandColors.primary} />
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  { color: isDark ? '#FFFFFF' : '#0B0B2B' },
                ]}
                placeholder="Confirm password"
                placeholderTextColor={isDark ? '#768499' : '#94A3B8'}
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon size={18} color={brandColors.primary} />
                ) : (
                  <EyeIcon size={18} color={isDark ? '#768499' : '#94A3B8'} />
                )}
              </TouchableOpacity>
            </View>

            {/* 7. Terms & Conditions Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: agreeTerms
                      ? brandColors.primary
                      : isDark
                      ? '#283348'
                      : '#CBD5E1',
                    backgroundColor: agreeTerms
                      ? brandColors.primary
                      : isDark
                      ? '#1B2232'
                      : '#FFFFFF',
                  },
                ]}
              >
                {agreeTerms && <CheckIcon size={11} color="#FFFFFF" />}
              </View>
              <Text
                style={[
                  styles.termsText,
                  { color: isDark ? '#8E9CAE' : '#5F6375' },
                ]}
              >
                I agree to the{' '}
                <Text style={{ color: brandColors.primary, fontWeight: '600' }}>
                  Terms & Conditions
                </Text>{' '}
                and Privacy Policy
              </Text>
            </TouchableOpacity>

            {/* 8. Orange Sign Up Button */}
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
                  <ArrowRightIcon size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 9. Footer: Already have an account? Log In */}
            <View style={styles.footerRow}>
              <Text
                style={[
                  styles.footerLabel,
                  { color: isDark ? '#8E9CAE' : '#5F6375' },
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
                  Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Store Category Picker Modal */}
      <Modal
        visible={showStorePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStorePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStorePicker(false)}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? '#181E2B' : '#FFFFFF',
                borderColor: isDark ? '#283348' : '#E8ECEF',
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: isDark ? '#FFFFFF' : '#0B0B2B' },
              ]}
            >
              Select Retail Category
            </Text>
            {STORE_TYPES.map((type) => {
              const isSelected = storeType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(255, 106, 26, 0.16)'
                          : 'rgba(255, 106, 26, 0.08)'
                        : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setStoreType(type);
                    setShowStorePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      {
                        color: isSelected
                          ? brandColors.primary
                          : isDark
                          ? '#FFFFFF'
                          : '#0B0B2B',
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {type}
                  </Text>
                  {isSelected ? (
                    <CheckIcon size={16} color={brandColors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
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
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 24,
  },
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 100,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
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
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIconLeft: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontWeight: '500',
    padding: 0,
  },
  pickerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 6,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
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
  termsText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  submitBtn: {
    height: 46,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionText: {
    fontSize: 14,
  },
});

export default RegisterScreen;
