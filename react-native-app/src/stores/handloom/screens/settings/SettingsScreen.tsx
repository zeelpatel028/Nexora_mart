import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../../../navigation/context/SettingsContext';
import { useStore } from '../../../../navigation/context/StoreContext';
import storePrefixApi, { StorePrefixes } from '../../services/storePrefixApi';
import settingsApi from '../../services/settingsApi';
import storage from '../../../../api/storage';
import { clearQueryCache } from '../../../../api/query';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import AppDropdown from '../../components/common/AppDropdown';
import AppIcon from '../../components/icons/AppIcon';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hindi (हिंदी)', value: 'hi' },
  { label: 'Gujarati (ગુજરાતી)', value: 'gu' },
];

const CURRENCIES = [
  { label: 'INR (₹) - Indian Rupee', value: 'INR' },
  { label: 'USD ($) - US Dollar', value: 'USD' },
  { label: 'EUR (€) - Euro', value: 'EUR' },
];

const INVOICE_TEMPLATES = [
  { label: 'Modern Orange (Recommended)', value: 'modern_orange' },
  { label: 'Classic Clean', value: 'classic_clean' },
  { label: 'Compact POS Thermal (3-inch)', value: 'thermal_compact' },
];

export const SettingsScreen: React.FC = () => {
  const { colors, brandColors, isDark } = useTheme();
  const { logout } = useAuth();
  const {
    theme,
    language,
    currency,
    billSoundEnabled,
    invoiceTemplate,
    setTheme,
    setLanguage,
    setCurrency,
    setBillSoundEnabled,
    setInvoiceTemplate,
    playBillSound,
  } = useSettings();
  const { currentStore, storeType } = useStore();

  const [lowStockNotify, setLowStockNotify] = useState(true);
  const [expiryNotify, setExpiryNotify] = useState(true);
  const [prefixes, setPrefixes] = useState<StorePrefixes>({
    invoice_prefix: 'TM_INV_',
    debit_customer_prefix: 'TM_DC_',
    walk_in_customer_prefix: 'TM_WC_',
    supplier_prefix: 'TM_SUP_',
    order_prefix: 'TM_ORD_',
    product_prefix: 'TM_PRD_',
    employee_prefix: 'TM_EMP_',
    return_prefix: 'TM_RET_',
    refund_prefix: 'TM_REF_',
    expense_prefix: 'TM_EXP_',
  });
  const [savingPrefixes, setSavingPrefixes] = useState(false);
  const [showPrefixModal, setShowPrefixModal] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const loadSettingsMeta = useCallback(async () => {
    try {
      const [pfxRes, shopRes] = await Promise.all([
        storePrefixApi.getPrefixes().catch(() => null),
        settingsApi.getShopSettings().catch(() => null),
      ]);
      if (pfxRes) setPrefixes(pfxRes);
      if (shopRes) {
        if (typeof shopRes.low_stock_alerts === 'boolean') {
          setLowStockNotify(shopRes.low_stock_alerts);
        }
        if (typeof shopRes.expiry_alerts === 'boolean') {
          setExpiryNotify(shopRes.expiry_alerts);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadSettingsMeta();
  }, [loadSettingsMeta]);

  const handleToggleNotify = async (key: 'low_stock_alerts' | 'expiry_alerts', val: boolean) => {
    if (key === 'low_stock_alerts') setLowStockNotify(val);
    else setExpiryNotify(val);
    try {
      await settingsApi.updateShopSettings({ [key]: val }).catch(() => null);
    } catch {}
  };

  const handleSavePrefixes = async () => {
    setSavingPrefixes(true);
    try {
      const updated = await storePrefixApi.updatePrefixes(prefixes);
      setPrefixes(updated);
      setShowPrefixModal(false);
      Alert.alert('Saved', 'Store document prefixes updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail || err?.message || 'Failed to save prefixes.');
    } finally {
      setSavingPrefixes(false);
    }
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      const data = await settingsApi.exportBackup();
      await Share.share({
        title: `TulsiMart_Backup_${currentStore?.name || 'Store'}.json`,
        message: JSON.stringify(data, null, 2),
      });
    } catch (err: any) {
      Alert.alert('Backup Error', err?.message || 'Unable to export backup right now.');
    } finally {
      setExportingBackup(false);
    }
  };

  // Safely clears non-auth caches only (preserves JWT tokens and user session!)
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary cached catalog & report data without logging you out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          onPress: async () => {
            setClearingCache(true);
            try {
              clearQueryCache();
              await storage.removeItem('nmart_account_details');
              Alert.alert('Cache Cleared', 'Temporary app cache has been refreshed.');
            } finally {
              setClearingCache(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Tulsi Mart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout().catch(() => null);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="App Settings"
        showBack
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Theme Switcher */}
        <AppCard>
          <View style={styles.sectionHeader}>
            <AppIcon name="sun" size={18} color={brandColors.primaryOrange} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
          </View>
          <View style={styles.themeRow}>
            {[
              { key: 'light', label: 'Light', icon: 'sun' as const },
              { key: 'dark', label: 'Dark', icon: 'moon' as const },
              { key: 'system', label: 'System', icon: 'settings' as const },
            ].map((item) => {
              const selected = theme === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => setTheme(item.key as any)}
                  activeOpacity={0.8}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor: selected
                        ? brandColors.primaryOrange
                        : isDark
                        ? colors.surfaceSubtle
                        : '#F4F6FA',
                      borderColor: selected ? brandColors.primaryOrange : colors.border,
                    },
                  ]}
                >
                  <AppIcon
                    name={item.icon}
                    size={16}
                    color={selected ? '#FFFFFF' : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeChipText,
                      { color: selected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AppCard>

        {/* Notifications & Audio */}
        <AppCard>
          <View style={styles.sectionHeader}>
            <AppIcon name="bell" size={18} color={brandColors.primaryOrange} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Notifications & Alerts
            </Text>
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Low Stock Alerts</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Notify when products drop below minimum stock
              </Text>
            </View>
            <Switch
              value={lowStockNotify}
              onValueChange={(v) => handleToggleNotify('low_stock_alerts', v)}
              trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
              thumbColor={lowStockNotify ? brandColors.primaryOrange : '#F8FAFC'}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.borderLight }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Expiry Notifications</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Highlight batches nearing expiration
              </Text>
            </View>
            <Switch
              value={expiryNotify}
              onValueChange={(v) => handleToggleNotify('expiry_alerts', v)}
              trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
              thumbColor={expiryNotify ? brandColors.primaryOrange : '#F8FAFC'}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Bill Sound Feedback</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Play chime when a bill or payment completes
              </Text>
            </View>
            <Switch
              value={billSoundEnabled}
              onValueChange={(val) => {
                setBillSoundEnabled(val);
                if (val) playBillSound();
              }}
              trackColor={{ false: '#CBD5E1', true: '#FFE0B2' }}
              thumbColor={billSoundEnabled ? brandColors.primaryOrange : '#F8FAFC'}
            />
          </View>
        </AppCard>

        {/* Language & Regional */}
        <AppCard>
          <View style={styles.sectionHeader}>
            <AppIcon name="globe" size={18} color="#2196F3" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Language & Billing Defaults
            </Text>
          </View>

          <AppDropdown
            label="Language"
            options={LANGUAGES}
            selectedValue={language}
            onSelect={setLanguage}
          />
          <View style={{ height: 10 }} />
          <AppDropdown
            label="Currency"
            options={CURRENCIES}
            selectedValue={currency}
            onSelect={setCurrency}
          />
          <View style={{ height: 10 }} />
          <AppDropdown
            label="Invoice Template"
            options={INVOICE_TEMPLATES}
            selectedValue={invoiceTemplate}
            onSelect={setInvoiceTemplate}
          />
        </AppCard>

        {/* Document Prefixes & Backup */}
        <AppCard>
          <View style={styles.sectionHeader}>
            <AppIcon name="settings" size={18} color="#64748B" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Store Configuration & Data
            </Text>
          </View>

          <View style={styles.actionStack}>
            <AppButton
              title="Configure Document Prefixes"
              variant="secondary"
              onPress={() => setShowPrefixModal(true)}
              icon={<AppIcon name="edit" size={16} color={brandColors.darkOrange} />}
            />
            <AppButton
              title="Export Store JSON Backup"
              variant="outline"
              loading={exportingBackup}
              onPress={handleExportBackup}
              icon={<AppIcon name="download" size={16} color={brandColors.primaryOrange} />}
            />
            <AppButton
              title="Clear Temporary Cache"
              variant="outline"
              loading={clearingCache}
              onPress={handleClearCache}
              icon={<AppIcon name="trash" size={16} color={brandColors.primaryOrange} />}
            />
          </View>
        </AppCard>

        {/* App Info */}
        <AppCard>
          <View style={styles.sectionHeader}>
            <AppIcon name="file" size={18} color="#00897B" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>App Info</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Application</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>Tulsi Mart Android</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.metaValue, { color: colors.textPrimary }]}>1.0.0</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Active Store Mode</Text>
            <Text style={[styles.metaValue, { color: brandColors.primaryOrange }]}>
              {storeType.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </AppCard>

        {/* Logout */}
        <AppButton
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          icon={<AppIcon name="logout" size={18} color="#FFFFFF" />}
          style={{ marginTop: 6 }}
        />
      </ScrollView>

      {/* Prefix Modal */}
      <Modal
        visible={showPrefixModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrefixModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Document ID Prefixes
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppInput
                label="Invoice Prefix"
                value={prefixes.invoice_prefix}
                onChangeText={(t) => setPrefixes({ ...prefixes, invoice_prefix: t })}
              />
              <AppInput
                label="Debit Customer Prefix"
                value={prefixes.debit_customer_prefix}
                onChangeText={(t) => setPrefixes({ ...prefixes, debit_customer_prefix: t })}
              />
              <AppInput
                label="Product Prefix"
                value={prefixes.product_prefix}
                onChangeText={(t) => setPrefixes({ ...prefixes, product_prefix: t })}
              />
              <AppInput
                label="Supplier Prefix"
                value={prefixes.supplier_prefix}
                onChangeText={(t) => setPrefixes({ ...prefixes, supplier_prefix: t })}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                onPress={() => setShowPrefixModal(false)}
                fullWidth={false}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save"
                onPress={handleSavePrefixes}
                loading={savingPrefixes}
                fullWidth={false}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 36 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15.5, fontWeight: '800' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeChipText: { fontSize: 13, fontWeight: '700' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  actionStack: { gap: 2 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  metaLabel: { fontSize: 13 },
  metaValue: { fontSize: 13, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 14 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
});

export default SettingsScreen;
