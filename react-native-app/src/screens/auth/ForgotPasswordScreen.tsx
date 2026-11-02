import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { isValidEmail } from '../../utils/validators';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
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
      await authService.forgotPassword(email);
      setSubmitted(true);
      Alert.alert(
        'Reset Instructions Sent',
        'If an account exists with this email, password reset instructions have been dispatched.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Reset Password" showBack onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.icon}>🔑</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot Password?</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Enter your merchant email address below and we'll send you instructions to reset your account password.
          </Text>

          {submitted ? (
            <View style={[styles.successBox, { backgroundColor: brandColors.successLight }]}>
              <Text style={[styles.successText, { color: brandColors.success }]}>
                ✓ Reset instructions have been generated. Check your inbox.
              </Text>
              <Button
                title="Return to Login"
                onPress={() => navigation.goBack()}
                variant="outline"
                style={{ marginTop: 16 }}
              />
            </View>
          ) : (
            <>
              <Input
                label="Registered Email"
                placeholder="merchant@nmart.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error}
                icon="✉️"
              />

              <Button
                title="Send Instructions"
                onPress={handleSubmit}
                loading={loading}
                style={{ marginTop: 8 }}
              />
            </>
          )}

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: brandColors.primary, fontWeight: '600' }}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  successBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;

