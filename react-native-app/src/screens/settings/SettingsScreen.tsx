import React, { useState, useEffect } from 'react';
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
import apiClient from '../../api/apiClient';
import authService from '../../services/authService';
import storage from '../../utils/storage';
import { Config } from '../../constants/config';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { SunIcon, MoonIcon, SettingsIcon, CheckIcon } from '../../components/branding/Icons';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { mode, isDark, setMode, toggleTheme, colors, brandColors } = useTheme();
  const { logout } = useAuth();

  const [apiUrl, setApiUrl] = useState(apiClient.getBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    storage.getCustomApiUrl().then((saved) => {
      if (saved) setApiUrl(saved);
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend API URL.');
      return;
    }
    const cleanUrl = apiUrl.trim().replace(/\/+$/, '');
    await storage.setCustomApiUrl(cleanUrl);
    apiClient.setBaseUrl(cleanUrl);
    Alert.alert('Configuration Saved', `API Base URL updated to:\n${cleanUrl}`);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await authService.checkHealth();
      setConnectionStatus(`Connected! Server: ${res.service || 'FastAPI'} (${res.status || 'OK'})`);
      Alert.alert('Backend Online ✅', `Successfully connected to FastAPI server:\nStatus: ${res.status}`);
    } catch (err: any) {
      setConnectionStatus(`Connection failed: ${err.message}`);
      Alert.alert('Connection Failed ❌', `Could not reach ${apiClient.getBaseUrl()}.\nError: ${err.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetDefaults = async () => {
    const defaultUrl = Config.DEFAULT_API_URL;
    setApiUrl(defaultUrl);
    await storage.setCustomApiUrl(defaultUrl);
    apiClient.setBaseUrl(defaultUrl);
    Alert.alert('Reset to Default', `API Base URL reset to:\n${defaultUrl}`);
  };

  const handleSelectRender = async () => {
    const url = Config.PRODUCTION_API_URL;
    setApiUrl(url);
    await storage.setCustomApiUrl(url);
    apiClient.setBaseUrl(url);
    Alert.alert('Render Cloud Selected', `API URL switched to:\n${url}`);
  };

  const handleSelectLocal = async () => {
    const url = Config.LOCAL_API_URL;
    setApiUrl(url);
    await storage.setCustomApiUrl(url);
    apiClient.setBaseUrl(url);
    Alert.alert('Localhost Backend Selected', `API URL switched to:\n${url}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="System Settings" subtitle="App & backend connection" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Appearance Card */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Appearance & System Theme
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Automatically adapt to your device theme or lock to your preference.
          </Text>

          {/* Theme Mode Selector Pills */}
          <View style={styles.themePillsRow}>
            {[
              { id: 'system', label: 'System Auto', icon: <SettingsIcon size={16} color={mode === 'system' ? '#FFFFFF' : colors.textSecondary} /> },
              { id: 'light', label: 'Light Mode', icon: <SunIcon size={16} color={mode === 'light' ? '#FFFFFF' : '#FF9800'} /> },
              { id: 'dark', label: 'Dark Mode', icon: <MoonIcon size={16} color={mode === 'dark' ? '#FFFFFF' : '#8E9CAE'} /> },
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
                      borderColor: active
                        ? brandColors.primary
                        : colors.border,
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

        {/* Backend Connectivity Card */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Backend Server Configuration
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            FastAPI server address. Default: production cloud server on Render.
          </Text>

          <Input
            label="API Base URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="https://nexora-mart-i996.onrender.com/api"
            autoCapitalize="none"
          />

          <View style={[styles.btnRow, { marginTop: 6, marginBottom: 8 }]}>
            <Button
              title="🌐 Render Cloud"
              variant={apiUrl.includes('render.com') ? 'primary' : 'outline'}
              size="sm"
              onPress={handleSelectRender}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="💻 Localhost"
              variant={apiUrl.includes('10.0.2.2') || apiUrl.includes('localhost') ? 'primary' : 'outline'}
              size="sm"
              onPress={handleSelectLocal}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>

          <View style={styles.btnRow}>
            <Button
              title="Test Connection"
              variant="outline"
              size="sm"
              loading={testingConnection}
              onPress={handleTestConnection}
              style={{ flex: 1, marginRight: 6 }}
            />
            <Button
              title="Save Custom URL"
              size="sm"
              onPress={handleSaveApiUrl}
              style={{ flex: 1, marginLeft: 6 }}
            />
          </View>

          <TouchableOpacity onPress={handleResetDefaults} style={{ alignSelf: 'center', marginTop: 10 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              Reset to Default (Render Production API)
            </Text>
          </TouchableOpacity>

          {connectionStatus && (
            <View
              style={[
                styles.statusBox,
                {
                  backgroundColor: connectionStatus.includes('Connected')
                    ? brandColors.successLight
                    : brandColors.errorLight,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: connectionStatus.includes('Connected')
                    ? brandColors.success
                    : brandColors.error,
                }}
              >
                {connectionStatus}
              </Text>
            </View>
          )}
        </Card>

        {/* Application Architecture & Build Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Application Info</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>App Name</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{Config.APP_NAME}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Technology Stack</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>React Native (TypeScript)</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>UI Mode</Text>
            <Badge label="100% Native Mobile (NO WebView)" variant="success" />
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.borderLight }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Version</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{Config.APP_VERSION}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Database</Text>
            <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>Aiven Cloud MySQL</Text>
          </View>
        </Card>

        {/* Session Invalidation */}
        <Button
          title="Sign Out Session"
          variant="danger"
          onPress={() => logout()}
          style={{ marginTop: 8, marginBottom: 24 }}
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
  btnRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusBox: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
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

