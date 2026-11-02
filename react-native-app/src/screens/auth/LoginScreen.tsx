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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
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
} from '../../components/branding/Icons';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
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
    setEmail('demo@nmart.com');
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
    Alert.alert(
      'Forgot Password',
      email.trim()
        ? `A password reset link will be sent to ${email.trim()}.`
        : 'Please enter your email address to receive reset instructions.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Organic Multi-Layer Wave Background (1:1 with Frontend) */}
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
              TOP HALF: Centered Logo + NEXORA MART
             ========================================== */}
          <View style={styles.topSection}>
            <BrandLogo size={88} textSize={25} />
          </View>

          {/* ==========================================
              BOTTOM HALF: Dark Slate Card (#181E2B)
             ========================================== */}
          <View style={styles.card}>
            {/* Header: Title & Subtitle */}
            <View style={styles.cardHeader}>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue to Nmart
              </Text>
            </View>

            {/* Quick Demo Pill */}
            <TouchableOpacity
              style={styles.demoPill}
              onPress={fillDemoCredentials}
              activeOpacity={0.8}
            >
              <Text style={styles.demoPillText}>
                ⚡ Tap for Demo: <Text style={styles.demoPillBold}>Alex Morgan</Text> (demo@nmart.com)
              </Text>
            </TouchableOpacity>

            {/* Global Error Alert Banner */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* 1. Email Address Input */}
            <View
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
              ]}
            >
              <View style={styles.inputIconLeft}>
                <MailIcon size={19} color="#FF6A1A" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Email address"
                placeholderTextColor="#768499"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMsg) setErrorMsg('');
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {email ? (
                <TouchableOpacity
                  onPress={() => setEmail('')}
                  style={styles.clearBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <CloseIcon size={16} color="#768499" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* 2. Password Input */}
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
              ]}
            >
              <View style={styles.inputIconLeft}>
                <LockIcon size={19} color="#FF6A1A" />
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
                  <EyeOffIcon size={19} color="#FF6A1A" />
                ) : (
                  <EyeIcon size={19} color="#768499" />
                )}
              </TouchableOpacity>
            </View>

            {/* 3. Options Row: Keep me signed in & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    rememberMe && styles.checkboxBoxChecked,
                  ]}
                >
                  {rememberMe && <CheckIcon size={11} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>Keep me signed in</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotLink}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Large Gradient Login Button with Arrow */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.loginBtnContent}>
                  <Text style={styles.loginBtnText}>Log In</Text>
                  <ArrowRightIcon size={20} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            {/* 5. Divider: Or continue with */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 6. Continue with Google Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <GoogleIcon size={19} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* 7. Footer: Don't have an account? Sign Up */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerAction}>Sign Up</Text>
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
    backgroundColor: '#111520',
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    paddingVertical: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#181E2B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#283348',
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E9CAE',
  },
  demoPill: {
    backgroundColor: 'rgba(255, 106, 26, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 26, 0.35)',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  demoPillText: {
    color: '#FF6A1A',
    fontSize: 11,
    textAlign: 'center',
  },
  demoPillBold: {
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#283348',
    backgroundColor: '#1B2232',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputWrapperFocused: {
    borderColor: '#FF6A1A',
    borderWidth: 1.5,
  },
  inputIconLeft: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  eyeBtn: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#283348',
    backgroundColor: '#1B2232',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF6A1A',
    borderColor: '#FF6A1A',
  },
  checkboxLabel: {
    color: '#8E9CAE',
    fontSize: 13,
    fontWeight: '400',
  },
  forgotLink: {
    color: '#FF6A1A',
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    width: '100%',
    height: 46,
    borderRadius: 9999,
    backgroundColor: '#FF6A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    shadowColor: '#FF6A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 14,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#283348',
  },
  dividerText: {
    color: '#768499',
    fontSize: 11,
    paddingHorizontal: 10,
    fontWeight: '400',
  },
  googleBtn: {
    width: '100%',
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#283348',
    backgroundColor: '#1B2232',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  googleBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
});

export default LoginScreen;
