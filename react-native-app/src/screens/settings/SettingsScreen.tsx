import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { SunIcon, MoonIcon, SettingsIcon } from '../../components/branding/Icons';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { mode, isDark, setMode, toggleTheme, colors, brandColors } = useTheme();
  const { logout, user } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="App Settings"
        subtitle="Preferences & Appearance"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appearance Card */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Appearance & System Theme
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Select your preferred color theme or automatically match device settings.
          </Text>

          {/* Theme Mode Selector Pills */}
          <View style={styles.themePillsRow}>
            {[
              {
                id: 'system',
                label: 'System Auto',
                icon: (
                  <SettingsIcon
                    size={16}
                    color={mode === 'system' ? '#FFFFFF' : colors.textSecondary}
                  />
                ),
              },
              {
                id: 'light',
                label: 'Light Mode',
                icon: (
                  <SunIcon
                    size={16}
                    color={mode === 'light' ? '#FFFFFF' : '#FF9800'}
                  />
                ),
              },
              {
                id: 'dark',
                label: 'Dark Mode',
                icon: (
                  <MoonIcon
                    size={16}
                    color={mode === 'dark' ? '#FFFFFF' : '#8E9CAE'}
                  />
                ),
              },
            ].map((t) => {
              const active = mode === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor: active
                        ? brandColors.primary
                        : isDark
                        ? colors.surfaceSubtle
                        : '#F1F5F9',
                      borderColor: active ? brandColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setMode(t.id as any)}
                  activeOpacity={0.8}
                >
                  {t.icon}
                  <Text
                    style={[
                      styles.themePillText,
                      { color: active ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Current Mode:{' '}
                <Text style={{ color: brandColors.primary, fontWeight: '700' }}>
                  {isDark ? 'Dark Theme' : 'Light Theme'}
                </Text>
                {mode === 'system' && (
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}> (Device Follow)</Text>
                )}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                Toggle quick dark/light override.
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: brandColors.primaryLight }}
              thumbColor={isDark ? brandColors.primary : '#F4F3F4'}
            />
          </View>
        </Card>

        {/* User Account Session Info Card */}
        <Card style={{ marginTop: 12 }}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Active Session
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Logged in merchant details and session security.
          </Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Merchant Name</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
              {user?.first_name ? `${user.first_name} ${user.surname || ''}`.trim() : 'Store Owner'}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Login Email</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
              {user?.email || 'owner@tulsimart.com'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Account Role</Text>
            <Text style={{ color: brandColors.primary, fontWeight: '800' }}>Store Owner</Text>
          </View>
        </Card>

        {/* Session Invalidation */}
        <Button
          title="Sign Out Session"
          variant="danger"
          onPress={handleSignOut}
          style={{ marginTop: 16, marginBottom: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  themePillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});

export default SettingsScreen;
