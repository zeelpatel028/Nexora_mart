import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { partnerService } from '../../services';
import { Supplier } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { BuildingIcon } from '../../components/branding/Icons';
import { formatCurrency } from '../../utils/formatters';

export const SupplierListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Supplier Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await partnerService.getSuppliers(search.trim() || undefined);
      setSuppliers(data);
    } catch (err) {
      console.warn('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSuppliers();
  };

  const handleAddSupplier = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Contact name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await partnerService.createSupplier({
        name: name.trim(),
        company_name: companyName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        gst_number: gstNumber.trim() || undefined,
      });

      setShowAddModal(false);
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setGstNumber('');
      Alert.alert('Success', 'Supplier saved to your directory!');
      await loadSuppliers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => {
    return (
      <Card style={styles.supplierCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: brandColors.secondaryLight + '40' }]}>
            <Text style={[styles.avatarText, { color: '#0B0B2B' }]}>
              🏢
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.supplierName, { color: colors.textPrimary }]}>
              {item.company_name || item.name}
            </Text>
            {item.company_name && (
              <Text style={[styles.contactPerson, { color: colors.textSecondary }]}>
                Contact: {item.name}
              </Text>
            )}
            {item.phone ? (
              <Text style={[styles.phoneText, { color: colors.textSecondary }]}>📞 {item.phone}</Text>
            ) : null}
            {item.email ? (
              <Text style={[styles.emailText, { color: colors.textMuted }]}>✉️ {item.email}</Text>
            ) : null}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Payable Balance</Text>
            <Text style={[styles.balanceVal, { color: colors.textPrimary }]}>
              {formatCurrency(item.balance)}
            </Text>
          </View>
        </View>

        {item.address ? (
          <View style={[styles.addressBox, { borderTopColor: colors.borderLight }]}>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              📍 {item.address} {item.gst_number ? `• GST: ${item.gst_number}` : ''}
            </Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Supplier Directory"
        subtitle={`${suppliers.length} authorized vendors`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '➕',
          onPress: () => setShowAddModal(true),
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search by supplier or company name..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Loader message="Loading suppliers..." />
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon size={32} color={brandColors.primary} />}
          title="No Suppliers Configured"
          description="Keep your supply chain organized with direct vendor procurement logs."
          actionTitle="Add New Supplier"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSupplierItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primary]}
            />
          }
        />
      )}

      {/* Add Supplier Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add New Supplier</Text>

            <Input
              label="Company / Firm Name"
              placeholder="e.g. Acme Wholesale Corp"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Input
              label="Contact Person Name *"
              placeholder="e.g. David Miller"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Phone Number"
              placeholder="+1-555-0143"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Input
              label="Email Address"
              placeholder="orders@acmewholesale.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Warehouse / Business Address"
              placeholder="Warehouse address"
              value={address}
              onChangeText={setAddress}
            />

            <Input
              label="Tax / GST Number"
              placeholder="Optional tax ID"
              value={gstNumber}
              onChangeText={setGstNumber}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Supplier"
                onPress={handleAddSupplier}
                loading={submitting}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    padding: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  supplierCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  supplierName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactPerson: {
    fontSize: 12,
    marginTop: 1,
  },
  phoneText: {
    fontSize: 12,
    marginTop: 2,
  },
  emailText: {
    fontSize: 11,
    marginTop: 1,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  balanceVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 1,
  },
  addressBox: {
    paddingTop: 8,
    marginTop: 10,
    borderTopWidth: 1,
  },
  addressText: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default SupplierListScreen;

