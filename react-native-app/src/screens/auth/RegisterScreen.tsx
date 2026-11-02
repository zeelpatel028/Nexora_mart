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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
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

  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [storeType, setStoreType] = useState(STORE_TYPES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        storeType,
        password,
      });

      Alert.alert(
        'Store Created Successfully!',
        `Welcome to Nexora Mart! Your ${storeType} account is ready.`,
        [
          {
            text: 'Open Workspace',
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
      const msg = err.message || 'Registration failed. Please check the details.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Organic Multi-Layer Wave Background */}
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
              TOP BRANDING SECTION
             ========================================== */}
          <View style={styles.topSection}>
            <BrandLogo size={68} textSize={22} showTagline={false} />
          </View>

          {/* ==========================================
              DARK SLATE CARD (#181E2B)
             ========================================== */}
          <View style={styles.card}>
            {/* Header: Title & Subtitle */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSubtitle}>
                Sign up to continue to Nmart
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Row 1: First Name & Surname Side-by-Side */}
            <View style={styles.row}>
              <View
                style={[
                  styles.halfInputWrapper,
                  focusedField === 'firstName' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <UserIcon size={17} color="#FF6A1A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="First name"
                  placeholderTextColor="#768499"
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

              <View
                style={[
                  styles.halfInputWrapper,
                  focusedField === 'surname' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <UserIcon size={17} color="#FF6A1A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Surname"
                  placeholderTextColor="#768499"
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

            {/* Row 2: Email & Phone Side-by-Side */}
            <View style={styles.row}>
              <View
                style={[
                  styles.halfInputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <MailIcon size={17} color="#FF6A1A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor="#768499"
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

              <View
                style={[
                  styles.halfInputWrapper,
                  focusedField === 'phone' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <PhoneIcon size={17} color="#FF6A1A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Phone"
                  placeholderTextColor="#768499"
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
            </View>

            {/* Row 3: Store Type Selector (Full Width) */}
            <TouchableOpacity
              style={[
                styles.fullInputWrapper,
                focusedField === 'storeType' && styles.inputWrapperFocused,
              ]}
              onPress={() => setShowStorePicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.inputIcon}>
                <StoreIcon size={17} color="#FF6A1A" />
              </View>
              <Text style={styles.selectText} numberOfLines={1}>
                {storeType}
              </Text>
              <ChevronDownIcon size={16} color="#768499" />
            </TouchableOpacity>

            {/* Row 4: Password & Confirm Password Side-by-Side */}
            <View style={styles.row}>
              <View
                style={[
                  styles.halfInputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={16} color="#FF6A1A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#768499"
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
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOffIcon size={16} color="#FF6A1A" />
                  ) : (
                    <EyeIcon size={16} color="#768499" />
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.halfInputWrapper,
                  focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                ]}
              >
                <View style={styles.inputIcon}>
                  <LockIcon size={16} color="#FF6A1A" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm"
                  placeholderTextColor="#768499"
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
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon size={16} color="#FF6A1A" />
                  ) : (
                    <EyeIcon size={16} color="#768499" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
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

            {/* Footer Navigation */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerAction}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Store Type Selection Modal */}
      <Modal
        visible={showStorePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStorePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStorePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Store Category</Text>
              <TouchableOpacity
                onPress={() => setShowStorePicker(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {STORE_TYPES.map((type) => {
                const isSelected = storeType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setStoreType(type);
                      setShowStorePicker(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalOptionLeft}>
                      <StoreIcon
                        size={18}
                        color={isSelected ? '#FF6A1A' : '#768499'}
                      />
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSelected && styles.modalOptionTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </View>
                    {isSelected && <CheckIcon size={14} color="#FF6A1A" />}
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
    backgroundColor: '#111520',
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#181E2B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#283348',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E9CAE',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  halfInputWrapper: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#283348',
    backgroundColor: '#1B2232',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fullInputWrapper: {
    width: '100%',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#283348',
    backgroundColor: '#1B2232',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  inputWrapperFocused: {
    borderColor: '#FF6A1A',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    padding: 0,
  },
  selectText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 2,
  },
  submitBtn: {
    width: '100%',
    height: 46,
    borderRadius: 9999,
    backgroundColor: '#FF6A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 10,
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLabel: {
    color: '#8E9CAE',
    fontSize: 13,
    fontWeight: '400',
  },
  footerAction: {
    color: '#FF6A1A',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: 400,
    backgroundColor: '#181E2B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#283348',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#283348',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    color: '#FF6A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(255, 106, 26, 0.12)',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalOptionText: {
    color: '#8E9CAE',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default RegisterScreen;
