import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useScreenSystemBar } from '../../utils/systemBar';
import { storeService } from '../../services';
import storage from '../../utils/storage';
import {
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  StoreIcon,
  UserIcon,
  SettingsIcon,
} from '../../components/branding/Icons';

type TabKey = 'basic' | 'owner' | 'address' | 'business' | 'config' | 'prefixes' | 'system';

export const AccountDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark, colors, brandColors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = insets.top > 0 ? insets.top + 6 : 8;

  // Dynamic white/theme status bar and bottom nav bar
  useScreenSystemBar('white');

  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [storeId, setStoreId] = useState('STR001');
  const [storeName, setStoreName] = useState('Nexora Mart');
  const [storeCode, setStoreCode] = useState('NXM001');
  const [storeType, setStoreType] = useState('Supermarket');
  const [storeCategory, setStoreCategory] = useState('Retail');
  const [storeDesc, setStoreDesc] = useState('Grocery & General Store');
  const [storeLogo, setStoreLogo] = useState('logo.png');
  const [storeImage, setStoreImage] = useState('store.jpg');
  const [storeStatus, setStoreStatus] = useState('Active');
  const [regDate, setRegDate] = useState('07-11-2026');

  // Owner Details
  const [ownerId, setOwnerId] = useState('OWN001');
  const [ownerName, setOwnerName] = useState('Zeel Patel');
  const [ownerEmail, setOwnerEmail] = useState('owner@gmail.com');
  const [ownerPhone, setOwnerPhone] = useState('9876543210');
  const [altPhone, setAltPhone] = useState('9876543211');
  const [ownerAddress, setOwnerAddress] = useState('Ahmedabad');
  const [ownerImage, setOwnerImage] = useState('owner.png');

  // Address Details
  const [addressLine1, setAddressLine1] = useState('Shop 12-14, Commercial Center, SG Highway');
  const [landmark, setLandmark] = useState('Opposite City Mall');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [district, setDistrict] = useState('Ahmedabad');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('380054');

  // Business Details
  const [gstin, setGstin] = useState('24ABCDE1234F1Z5');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [businessRegNo, setBusinessRegNo] = useState('ACT/2026/8892');
  const [businessEmail, setBusinessEmail] = useState('contact@nexoramart.com');
  const [businessPhone, setBusinessPhone] = useState('079-26889900');

  // Configuration
  const [openingTime, setOpeningTime] = useState('09:00 AM');
  const [closingTime, setClosingTime] = useState('10:00 PM');
  const [workingDays, setWorkingDays] = useState('Monday - Saturday');
  const [currency, setCurrency] = useState('INR (₹)');
  const [taxRate, setTaxRate] = useState('5.0');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [invoiceStartingNo, setInvoiceStartingNo] = useState('000001');
  const [lowStockAlert, setLowStockAlert] = useState('5');
  const [returnPeriod, setReturnPeriod] = useState('7 Days');
  const [storeLang, setStoreLang] = useState('English');

  // Prefixes
  const [pfxInvoice, setPfxInvoice] = useState('INV');
  const [pfxDebit, setPfxDebit] = useState('DBC');
  const [pfxWalkin, setPfxWalkin] = useState('WIC');
  const [pfxSupplier, setPfxSupplier] = useState('SUP');
  const [pfxOrder, setPfxOrder] = useState('ORD');

  // Load store details from backend or local storage
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const cached = await storage.getItem('nmart_account_details');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object') {
              populateFields(parsed);
            }
          } catch {}
        }

        const data: any = await storeService.getStoreAccountDetails();
        if (data) {
          populateFields(data);
          await storage.setItem('nmart_account_details', JSON.stringify(data));
        }
      } catch (err) {
        console.log('Account details load notice:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, []);

  const populateFields = (d: any) => {
    if (d.basic_store_info) {
      setStoreId(d.basic_store_info.store_id || 'STR001');
      setStoreName(d.basic_store_info.store_name || 'Nexora Mart');
      setStoreCode(d.basic_store_info.store_code || 'NXM001');
      setStoreType(d.basic_store_info.store_type || 'Supermarket');
      setStoreCategory(d.basic_store_info.store_category || 'Retail');
      setStoreDesc(d.basic_store_info.store_description || 'Grocery & General Store');
      setStoreLogo(d.basic_store_info.store_logo || 'logo.png');
      setStoreImage(d.basic_store_info.store_image || 'store.jpg');
      setStoreStatus(d.basic_store_info.store_status || 'Active');
      setRegDate(d.basic_store_info.registration_date || '07-11-2026');
    }
    if (d.store_owner_details) {
      setOwnerId(d.store_owner_details.owner_id || 'OWN001');
      setOwnerName(d.store_owner_details.owner_name || 'Zeel Patel');
      setOwnerEmail(d.store_owner_details.owner_email || 'owner@gmail.com');
      setOwnerPhone(d.store_owner_details.owner_phone || '9876543210');
      setAltPhone(d.store_owner_details.alternate_phone || '9876543211');
      setOwnerAddress(d.store_owner_details.owner_address || 'Ahmedabad');
      setOwnerImage(d.store_owner_details.owner_profile_image || 'owner.png');
    }
    if (d.store_address_details) {
      setAddressLine1(d.store_address_details.address_line1 || '');
      setLandmark(d.store_address_details.landmark || '');
      setCity(d.store_address_details.city || 'Ahmedabad');
      setState(d.store_address_details.state || 'Gujarat');
      setDistrict(d.store_address_details.district || 'Ahmedabad');
      setCountry(d.store_address_details.country || 'India');
      setPincode(d.store_address_details.pincode || '380054');
    }
    if (d.business_details) {
      setGstin(d.business_details.gst_number || '');
      setPanNumber(d.business_details.pan_number || '');
      setBusinessRegNo(d.business_details.business_registration_number || '');
      setBusinessEmail(d.business_details.business_email || '');
      setBusinessPhone(d.business_details.business_phone || '');
    }
    if (d.store_configuration) {
      setOpeningTime(d.store_configuration.store_opening_time || '09:00 AM');
      setClosingTime(d.store_configuration.store_closing_time || '10:00 PM');
      setWorkingDays(d.store_configuration.working_days || 'Monday - Saturday');
      setCurrency(d.store_configuration.currency || 'INR (₹)');
      setTaxRate(String(d.store_configuration.default_tax_rate || '5.0'));
      setInvoicePrefix(d.store_configuration.invoice_prefix || 'INV');
      setInvoiceStartingNo(String(d.store_configuration.invoice_starting_number || '000001'));
      setLowStockAlert(String(d.store_configuration.low_stock_alert || '5'));
      setReturnPeriod(d.store_configuration.return_period || '7 Days');
      setStoreLang(d.store_configuration.store_language || 'English');
    }
    if (d.store_prefixes) {
      setPfxInvoice(d.store_prefixes.invoice || 'INV');
      setPfxDebit(d.store_prefixes.debit_customer || 'DBC');
      setPfxWalkin(d.store_prefixes.walkin_customer || 'WIC');
      setPfxSupplier(d.store_prefixes.supplier || 'SUP');
      setPfxOrder(d.store_prefixes.order || 'ORD');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      basic_store_info: {
        store_id: storeId,
        store_name: storeName,
        store_code: storeCode,
        store_type: storeType,
        store_category: storeCategory,
        store_description: storeDesc,
        store_logo: storeLogo,
        store_image: storeImage,
        store_status: storeStatus,
        registration_date: regDate,
      },
      store_owner_details: {
        owner_id: ownerId,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        alternate_phone: altPhone,
        owner_address: ownerAddress,
        owner_profile_image: ownerImage,
      },
      store_address_details: {
        address_line1: addressLine1,
        landmark,
        city,
        state,
        district,
        country,
        pincode,
      },
      business_details: {
        gst_number: gstin,
        pan_number: panNumber,
        business_registration_number: businessRegNo,
        business_email: businessEmail,
        business_phone: businessPhone,
      },
      store_configuration: {
        store_opening_time: openingTime,
        store_closing_time: closingTime,
        working_days: workingDays,
        currency,
        default_tax_rate: parseFloat(taxRate) || 0.0,
        invoice_prefix: invoicePrefix,
        invoice_starting_number: parseInt(invoiceStartingNo, 10) || 1,
        low_stock_alert: parseInt(lowStockAlert, 10) || 5,
        return_period: returnPeriod,
        store_language: storeLang,
      },
      store_prefixes: {
        invoice: pfxInvoice,
        debit_customer: pfxDebit,
        walkin_customer: pfxWalkin,
        supplier: pfxSupplier,
        order: pfxOrder,
      },
    };

    try {
      await storage.setItem('nmart_account_details', JSON.stringify(payload));
      await storeService.updateStoreAccountDetails(payload).catch(() => null);
      Alert.alert('Store Updated 🎉', 'Your store account details and prefixes have been saved successfully.');
    } catch (err: any) {
      Alert.alert('Notice', 'Store details saved locally.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'owner', label: 'Owner' },
    { key: 'address', label: 'Address' },
    { key: 'business', label: 'Business' },
    { key: 'config', label: 'Config' },
    { key: 'prefixes', label: 'Prefixes' },
    { key: 'system', label: 'System' },
  ];

  const renderField = (label: string, value: string, setter: (val: string) => void, editable: boolean = true) => (
    <View style={styles.formGroup}>
      <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#4B5563' }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          {
            backgroundColor: isDark ? '#1C1E24' : '#FFFFFF',
            borderColor: isDark ? '#2D323E' : '#E5E7EB',
            color: isDark ? '#FFFFFF' : '#111827',
          },
          !editable && { opacity: 0.7, backgroundColor: isDark ? '#15171C' : '#F9FAFB' },
        ]}
        value={value}
        onChangeText={setter}
        editable={editable}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TOP HEADER */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#262A34' : '#E5E7EB', paddingTop: topPadding }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.circularBtn, { backgroundColor: colors.toggleBg, borderColor: colors.toggleBorder }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeftIcon size={18} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#111827' }]} numberOfLines={1}>
            Account & Store Details
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.circularBtn, { backgroundColor: colors.toggleBg, borderColor: colors.toggleBorder }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {isDark ? <MoonIcon size={18} color="#FFFFFF" /> : <SunIcon size={19} color={brandColors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: brandColors.primary }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* HORIZONTAL TABS BAR */}
      <View style={[styles.tabsWrap, { borderBottomColor: isDark ? '#262A34' : '#E5E7EB' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabItem,
                  isActive && { borderBottomColor: brandColors.primary, borderBottomWidth: 2.5 },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    { color: isActive ? brandColors.primary : isDark ? '#9CA3AF' : '#6B7280' },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* CONTENT SCROLL */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={{ marginTop: 12, color: isDark ? '#9CA3AF' : '#6B7280' }}>Loading store profile...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 40 + Math.max(insets.bottom, 16) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* TAB 1: BASIC STORE INFORMATION */}
          {activeTab === 'basic' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <StoreIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Basic Store Information
                </Text>
              </View>

              {renderField('Store ID', storeId, setStoreId, false)}
              {renderField('Store Name', storeName, setStoreName)}
              {renderField('Store Code', storeCode, setStoreCode)}
              {renderField('Store Type', storeType, setStoreType)}
              {renderField('Store Category', storeCategory, setStoreCategory)}
              {renderField('Store Description', storeDesc, setStoreDesc)}
              {renderField('Store Logo', storeLogo, setStoreLogo)}
              {renderField('Store Image', storeImage, setStoreImage)}
              {renderField('Store Status', storeStatus, setStoreStatus)}
              {renderField('Registration Date', regDate, setRegDate, false)}
            </View>
          )}

          {/* TAB 2: STORE OWNER DETAILS */}
          {activeTab === 'owner' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <UserIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Store Owner Details
                </Text>
              </View>

              {renderField('Owner ID', ownerId, setOwnerId, false)}
              {renderField('Owner Name', ownerName, setOwnerName)}
              {renderField('Owner Email', ownerEmail, setOwnerEmail)}
              {renderField('Owner Phone', ownerPhone, setOwnerPhone)}
              {renderField('Alternate Phone', altPhone, setAltPhone)}
              {renderField('Owner Address', ownerAddress, setOwnerAddress)}
              {renderField('Owner Profile Image', ownerImage, setOwnerImage)}
            </View>
          )}

          {/* TAB 3: STORE ADDRESS DETAILS */}
          {activeTab === 'address' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <StoreIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Store Address Details
                </Text>
              </View>

              {renderField('Address Line 1', addressLine1, setAddressLine1)}
              {renderField('Landmark', landmark, setLandmark)}
              {renderField('City', city, setCity)}
              {renderField('State', state, setState)}
              {renderField('District', district, setDistrict)}
              {renderField('Country', country, setCountry)}
              {renderField('Pincode', pincode, setPincode)}
            </View>
          )}

          {/* TAB 4: BUSINESS DETAILS */}
          {activeTab === 'business' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <StoreIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Business & Tax Details
                </Text>
              </View>

              {renderField('GST Number', gstin, setGstin)}
              {renderField('PAN Number', panNumber, setPanNumber)}
              {renderField('Business Registration Number', businessRegNo, setBusinessRegNo)}
              {renderField('Business Email', businessEmail, setBusinessEmail)}
              {renderField('Business Phone', businessPhone, setBusinessPhone)}
            </View>
          )}

          {/* TAB 5: STORE CONFIGURATION */}
          {activeTab === 'config' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <SettingsIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Store Configuration
                </Text>
              </View>

              {renderField('Store Opening Time', openingTime, setOpeningTime)}
              {renderField('Store Closing Time', closingTime, setClosingTime)}
              {renderField('Working Days', workingDays, setWorkingDays)}
              {renderField('Currency', currency, setCurrency)}
              {renderField('Default Tax Rate (%)', taxRate, setTaxRate)}
              {renderField('Invoice Prefix', invoicePrefix, setInvoicePrefix)}
              {renderField('Invoice Starting Number', invoiceStartingNo, setInvoiceStartingNo)}
              {renderField('Low Stock Alert Threshold', lowStockAlert, setLowStockAlert)}
              {renderField('Return Period', returnPeriod, setReturnPeriod)}
              {renderField('Store Language', storeLang, setStoreLang)}
            </View>
          )}

          {/* TAB 6: STORE PREFIXES & MULTI-STORE */}
          {activeTab === 'prefixes' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <SettingsIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  Store Prefixes (User Editable)
                </Text>
              </View>

              {/* Editable Prefix Table */}
              <View style={styles.tableWrap}>
                <View style={[styles.tableRowHeader, { backgroundColor: isDark ? '#232732' : '#F3F4F6' }]}>
                  <Text style={[styles.colHeader, { flex: 1.2, color: isDark ? '#FFFFFF' : '#111827' }]}>Module</Text>
                  <Text style={[styles.colHeader, { flex: 1, color: isDark ? '#FFFFFF' : '#111827' }]}>Prefix</Text>
                  <Text style={[styles.colHeader, { flex: 1.8, color: isDark ? '#FFFFFF' : '#111827' }]}>Example</Text>
                </View>

                {[
                  { module: 'Invoice', val: pfxInvoice, setter: setPfxInvoice, code: '000001' },
                  { module: 'Debit Customer', val: pfxDebit, setter: setPfxDebit, code: '000001' },
                  { module: 'Walk-in Customer', val: pfxWalkin, setter: setPfxWalkin, code: '000001' },
                  { module: 'Supplier', val: pfxSupplier, setter: setPfxSupplier, code: '000001' },
                  { module: 'Order', val: pfxOrder, setter: setPfxOrder, code: '000001' },
                ].map((row, idx) => (
                  <View key={idx} style={[styles.tableRow, { borderBottomColor: isDark ? '#262A34' : '#E5E7EB' }]}>
                    <Text style={[styles.colCell, { flex: 1.2, color: isDark ? '#FFFFFF' : '#111827', fontWeight: '600' }]}>
                      {row.module}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={[
                          styles.tableInput,
                          {
                            backgroundColor: isDark ? '#1C1E24' : '#FFFFFF',
                            borderColor: brandColors.primary,
                            color: isDark ? '#FFFFFF' : '#111827',
                          },
                        ]}
                        value={row.val}
                        onChangeText={row.setter}
                        autoCapitalize="characters"
                        maxLength={5}
                      />
                    </View>
                    <Text style={[styles.colCell, { flex: 1.8, color: brandColors.primary, fontWeight: '700' }]}>
                      {row.val}-STR001-{row.code}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Multi-Store Project Prefix Standard Reference */}
              <View style={styles.multiStoreCallout}>
                <Text style={styles.multiStoreCalloutTitle}>
                  🏢 Multi-Store Prefix Convention: INV-STR001-000001
                </Text>
                <Text style={[styles.multiStoreCalloutText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                  For enterprise and multi-store branches, documents combine module prefix, store ID, and sequential number.
                </Text>
              </View>

              <Text style={[styles.subSectionTitle, { color: isDark ? '#FFFFFF' : '#111827', marginTop: 18 }]}>
                System Master Prefix Directory
              </Text>
              <View style={styles.directoryGrid}>
                {[
                  { name: 'Store', pfx: 'STR', eg: 'STR-000001' },
                  { name: 'Product', pfx: 'PRD', eg: 'PRD-000001' },
                  { name: 'Category', pfx: 'CAT', eg: 'CAT-000001' },
                  { name: 'Employee', pfx: 'EMP', eg: 'EMP-000001' },
                  { name: 'Purchase', pfx: 'PUR', eg: 'PUR-000001' },
                  { name: 'Payment', pfx: 'PAY', eg: 'PAY-000001' },
                  { name: 'Return', pfx: 'RET', eg: 'RET-000001' },
                  { name: 'Refund', pfx: 'REF', eg: 'REF-000001' },
                  { name: 'Customer', pfx: 'CUS', eg: 'CUS-000001' },
                  { name: 'Stock Adjustment', pfx: 'ADJ', eg: 'ADJ-000001' },
                  { name: 'Expense', pfx: 'EXP', eg: 'EXP-000001' },
                  { name: 'Quotation', pfx: 'QUO', eg: 'QUO-000001' },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.dirCard, { backgroundColor: isDark ? '#232732' : '#F8FAFC', borderColor: isDark ? '#2D323E' : '#E2E8F0' }]}>
                    <Text style={[styles.dirName, { color: isDark ? '#9CA3AF' : '#64748B' }]}>{item.name}</Text>
                    <Text style={[styles.dirPfx, { color: brandColors.primary }]}>{item.pfx}</Text>
                    <Text style={[styles.dirEg, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{item.eg}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 7: SYSTEM INFORMATION */}
          {activeTab === 'system' && (
            <View style={[styles.card, { backgroundColor: isDark ? '#181A20' : '#FFFFFF', borderColor: isDark ? '#2D323E' : '#E5E7EB' }]}>
              <View style={styles.cardHeader}>
                <SettingsIcon size={20} color={brandColors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                  System Information
                </Text>
              </View>

              {[
                { label: 'Created At', value: '07-11-2026 10:00:00' },
                { label: 'Updated At', value: '07-11-2026 23:38:00' },
                { label: 'Created By', value: `${ownerName} (${ownerId})` },
                { label: 'Updated By', value: 'System Admin' },
                { label: 'Last Login', value: '07-11-2026 23:30:00' },
                { label: 'Account Status', value: 'Active & Verified', highlight: true },
              ].map((row, idx) => (
                <View key={idx} style={[styles.systemRow, { borderBottomColor: isDark ? '#262A34' : '#E5E7EB' }]}>
                  <Text style={[styles.systemLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                    {row.label}
                  </Text>
                  <Text
                    style={[
                      styles.systemVal,
                      { color: row.highlight ? '#10B981' : isDark ? '#FFFFFF' : '#111827' },
                      row.highlight && { fontWeight: '700' },
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
    flexShrink: 1,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tabsWrap: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: 12,
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tabItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14.5,
  },
  tableWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: 16,
  },
  tableRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  colHeader: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  colCell: {
    fontSize: 13,
  },
  tableInput: {
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  multiStoreCallout: {
    backgroundColor: 'rgba(255, 106, 26, 0.12)',
    borderColor: '#FF6A1A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  multiStoreCalloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6A1A',
    marginBottom: 4,
  },
  multiStoreCalloutText: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  directoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dirCard: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  dirName: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  dirPfx: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2,
  },
  dirEg: {
    fontSize: 11,
    fontWeight: '600',
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  systemLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  systemVal: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});

export default AccountDetailScreen;
