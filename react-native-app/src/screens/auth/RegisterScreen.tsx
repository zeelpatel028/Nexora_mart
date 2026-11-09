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
  Modal,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import categoryService from '../../services/categoryService';
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  StoreIcon,
  ChevronDownIcon,
  CloseIcon,
} from '../../components/branding/Icons';
import { isValidEmail, isValidPhone } from '../../utils/validators';
import storeTypeService from '../../services/storeTypeService';
import { StoreType } from '../../models/types';

type RegisterNavProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const DEFAULT_STORE_TYPES: StoreType[] = [
  { id: 1, code: 'grocery', name: 'Grocery Store', description: 'Daily essentials, packaged food items, groceries, and staples.', is_active: true },
  { id: 2, code: 'clothing', name: 'Clothing Store', description: "Men's, women's, and kids' apparel, textiles, and fashion garments.", is_active: true },
  { id: 3, code: 'medical', name: 'Medical / Pharmacy Store', description: 'Pharmaceuticals, medicines, surgical supplies, and healthcare goods.', is_active: true },
  { id: 4, code: 'mobile_electronics', name: 'Mobile & Electronics Store', description: 'Smartphones, consumer appliances, computing devices, audio, and gadgets.', is_active: true },
  { id: 5, code: 'plastic', name: 'Plastic Store', description: 'Plastic housewares, containers, storage boxes, kitchen utilities, and polymer goods.', is_active: true },
  { id: 6, code: 'handloom', name: 'Handloom Store', description: 'Handloom textiles, traditional fabrics, sarees, artisanal weaves, and home furnishings.', is_active: true },
  { id: 7, code: 'furniture', name: 'Furniture Store', description: 'Home and office furniture, wooden decor, tables, chairs, and furnishings.', is_active: true },
  { id: 8, code: 'agro', name: 'Agro Store', description: 'Seeds, fertilizers, agricultural implements, farming equipment, and pesticides.', is_active: true },
];

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavProp>();
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Store Type State (Starts with empty / Select Store Type)
  const [storeTypesList, setStoreTypesList] = useState<StoreType[]>(DEFAULT_STORE_TYPES);
  const [selectedStoreTypeObj, setSelectedStoreTypeObj] = useState<StoreType | null>(null);
  const [selectedStoreType, setSelectedStoreType] = useState('');
  const [showStoreTypeModal, setShowStoreTypeModal] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Checkbox State
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Focus States
  const [fullNameFocused, setFullNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Sizing optimized for single screen without scrolling
  const illustrationWidth = Math.min(width * 0.72, 250);
  const illustrationHeight = illustrationWidth / 2.5;
  const primaryOrange = '#FF6A1A';

  // Fetch live store types from backend API (GET /store-types)
  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);
    storeTypeService
      .getStoreTypes(true)
      .then((types) => {
        if (isMounted && types && types.length > 0) {
          setStoreTypesList(types);
        }
      })
      .catch(() => {
        // Fallback default 8 store types are maintained
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
    if (!selectedStoreType || selectedStoreType === 'Select Store Type') {
      setErrorMsg('Please select your store type');
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
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Store Owner';

      await register({
        firstName,
        surname,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        storeType: selectedStoreTypeObj?.name || selectedStoreType,
        store_type_id: selectedStoreTypeObj?.id,
        store_type_code: selectedStoreTypeObj?.code,
        password,
      });

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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button (Left) & Theme Toggle Button (Right) */}
          <View style={styles.topBar}>
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

          {/* Title Section */}
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
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Input Form Fields (5 fields - Confirm Password removed) */}
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
                  size={18}
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
                  size={18}
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
                  size={18}
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

            {/* Field 4: Store Type Selector (Shows 'Select Store Type' initially) */}
            <TouchableOpacity
              style={[
                styles.inputCard,
                {
                  backgroundColor: isDark ? '#1C1F26' : '#FFFFFF',
                  borderColor: showStoreTypeModal ? primaryOrange : isDark ? '#2D323E' : '#E5E7EB',
                  borderWidth: showStoreTypeModal ? 1.5 : 1,
                },
              ]}
              onPress={() => setShowStoreTypeModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.inputIconWrapper}>
                <StoreIcon
                  size={18}
                  color={showStoreTypeModal ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.storeTypeSelectedWrapper}>
                <Text style={[styles.storeTypeLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Store Type
                </Text>
                <Text
                  style={[
                    styles.storeTypeValue,
                    {
                      color: selectedStoreType
                        ? isDark
                          ? '#FFFFFF'
                          : '#111827'
                        : isDark
                        ? '#6B7280'
                        : '#9CA3AF',
                      fontWeight: selectedStoreType ? '600' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {selectedStoreType || 'Select Store Type'}
                </Text>
              </View>
              <View style={styles.storeTypeBadge}>
                <ChevronDownIcon size={16} color={primaryOrange} strokeWidth={2.2} />
              </View>
            </TouchableOpacity>

            {/* Field 5: Password */}
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
                  size={18}
                  color={passwordFocused ? primaryOrange : isDark ? '#8A909D' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
                placeholder="Password (min 6 characters)"
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOffIcon
                    size={18}
                    color={isDark ? '#8A909D' : '#9CA3AF'}
                    strokeWidth={1.8}
                  />
                ) : (
                  <EyeIcon
                    size={18}
                    color={isDark ? '#8A909D' : '#9CA3AF'}
                    strokeWidth={1.8}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Terms & Conditions Checkbox Row */}
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
                  {agreeTerms && <CheckIcon size={11} color="#FFFFFF" strokeWidth={2.5} />}
                </View>
              </TouchableOpacity>

              <Text style={[styles.termsLabel, { color: isDark ? '#D1D5DB' : '#374151' }]}>
                I agree to the{' '}
                <Text style={[styles.termsLink, { color: primaryOrange }]} onPress={showTermsModal}>
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

            {/* Create Account Button */}
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
                  <ArrowRightIcon size={17} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              )}
            </TouchableOpacity>

            {/* Bottom Prompt: Already have an account? Login */}
            <View style={styles.loginPromptRow}>
              <Text style={[styles.loginPromptText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                <Text style={[styles.loginLinkText, { color: primaryOrange }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ========================================================
          PREMIUM STORE TYPE SELECTOR MODAL
          ======================================================== */}
      <Modal
        visible={showStoreTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStoreTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStoreTypeModal(false)}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: isDark ? '#1C1F26' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Select Store Type
                </Text>
                <Text style={[styles.modalSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Choose the business category for your retail store
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: isDark ? '#262A34' : '#F3F4F6' }]}
                onPress={() => setShowStoreTypeModal(false)}
              >
                <CloseIcon size={18} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
            </View>

            {loadingCategories && (
              <ActivityIndicator
                color={primaryOrange}
                size="small"
                style={{ marginVertical: 10 }}
              />
            )}

            <FlatList
              data={storeTypesList}
              keyExtractor={(item) => String(item.id || item.code)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedStoreTypeObj?.id || item.name === selectedStoreType;
                return (
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(255, 106, 26, 0.15)'
                            : '#FFF7ED'
                          : isDark
                          ? '#181A20'
                          : '#F9FAFB',
                        borderColor: isSelected ? primaryOrange : isDark ? '#2D323E' : '#E5E7EB',
                      },
                    ]}
                    onPress={() => {
                      setSelectedStoreTypeObj(item);
                      setSelectedStoreType(item.name);
                      setShowStoreTypeModal(false);
                      if (errorMsg) setErrorMsg('');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryItemLeft}>
                      <View
                        style={[
                          styles.catIconPill,
                          {
                            backgroundColor: isSelected
                              ? primaryOrange
                              : isDark
                              ? '#262A34'
                              : '#EEF2F6',
                          },
                        ]}
                      >
                        <StoreIcon
                          size={16}
                          color={isSelected ? '#FFFFFF' : isDark ? '#9CA3AF' : '#6B7280'}
                        />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text
                          style={[
                            styles.categoryItemText,
                            {
                              color: isSelected
                                ? primaryOrange
                                : isDark
                                ? '#FFFFFF'
                                : '#111827',
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.description ? (
                          <Text
                            style={{
                              fontSize: 11,
                              color: isDark ? '#9CA3AF' : '#6B7280',
                              marginTop: 2,
                            }}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: primaryOrange }]}>
                        <CheckIcon size={12} color="#FFFFFF" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 28) : 44,
    paddingHorizontal: 20,
    marginBottom: 2,
    zIndex: 10,
  },
  navCircularBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 4,
    zIndex: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mLogo3d: {
    width: 60,
    height: 40,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordNexora: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  wordMart: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: 0.1,
  },
  storefrontContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    zIndex: 2,
  },
  titleSection: {
    paddingHorizontal: 22,
    marginTop: 2,
    marginBottom: 8,
    zIndex: 2,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '400',
    marginTop: 2,
  },
  errorBanner: {
    marginHorizontal: 22,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 22,
    zIndex: 2,
  },
  inputCard: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 9,
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
  storeTypeSelectedWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  storeTypeLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  storeTypeValue: {
    fontSize: 13.5,
  },
  storeTypeBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 106, 26, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  eyeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  checkboxTouchable: {
    marginRight: 8,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  termsLink: {
    fontWeight: '600',
  },
  createAccountBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6A1A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  createBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  loginPromptText: {
    fontSize: 13,
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Modal styles for Store Type selector
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '65%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catIconPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryItemText: {
    fontSize: 13.5,
    flex: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen;
