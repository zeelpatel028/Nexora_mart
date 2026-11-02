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
import { Customer } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';

export const CustomerListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await partnerService.getCustomers(search.trim() || undefined);
      setCustomers(data);
    } catch (err) {
      console.warn('Failed to load customers:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCustomers();
  };

  const handleAddCustomer = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Customer name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await partnerService.createCustomer({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        credit_limit: creditLimit ? Number(creditLimit) : 0,
      });

      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCreditLimit('');
      Alert.alert('Success', 'Customer added to your directory!');
      await loadCustomers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    return (
      <Card style={styles.customerCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: brandColors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: brandColors.primary }]}>
              {item.name.substring(0, 1).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.customerName, { color: colors.textPrimary }]}>{item.name}</Text>
            {item.phone ? (
              <Text style={[styles.phoneText, { color: colors.textSecondary }]}>📞 {item.phone}</Text>
            ) : null}
            {item.email ? (
              <Text style={[styles.emailText, { color: colors.textMuted }]}>✉️ {item.email}</Text>
            ) : null}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>Credit Balance</Text>
            <Text style={[styles.balanceVal, { color: item.balance > 0 ? brandColors.error : brandColors.success }]}>
              {formatCurrency(item.balance)}
            </Text>
            {item.credit_limit > 0 && (
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Limit: {formatCurrency(item.credit_limit)}
              </Text>
            )}
          </View>
        </View>

        {item.address ? (
          <View style={[styles.addressBox, { borderTopColor: colors.borderLight }]}>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              📍 {item.address}
            </Text>
          </View>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Customer Directory"
        subtitle={`${customers.length} registered customers`}
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
          placeholder="Search by customer name or phone..."
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
        <Loader message="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Customers Registered"
          description="Build your store customer relationships with loyalty credit tracking."
          actionTitle="Add First Customer"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCustomerItem}
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

      {/* Add Customer Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add New Customer</Text>

            <Input
              label="Full Name *"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Phone Number"
              placeholder="+1-555-0182"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Input
              label="Email Address"
              placeholder="sarah@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Delivery Address"
              placeholder="Apartment, street address, city"
              value={address}
              onChangeText={setAddress}
            />

            <Input
              label="Credit Limit ($)"
              placeholder="0.00"
              keyboardType="numeric"
              value={creditLimit}
              onChangeText={setCreditLimit}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Customer"
                onPress={handleAddCustomer}
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
  customerCard: {
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
    fontSize: 18,
    fontWeight: '800',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
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

export default CustomerListScreen;

