import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Customer } from '../../../models/types';
import { SelectedCustomer } from '../types';
import { formatCurrency } from '../../../utils/formatters';

interface CustomerSelectorModalProps {
  visible: boolean;
  customers: Customer[];
  selectedCustomer: SelectedCustomer;
  onSelect: (customer: SelectedCustomer) => void;
  onQuickAddCustomer: (name: string, phone: string) => Promise<Customer | null>;
  onClose: () => void;
}

export const CustomerSelectorModal: React.FC<CustomerSelectorModalProps> = ({
  visible,
  customers,
  selectedCustomer,
  onSelect,
  onQuickAddCustomer,
  onClose,
}) => {
  const { colors, brandColors } = useTheme();

  const [tab, setTab] = useState<'walk_in' | 'debit_customer'>(
    selectedCustomer.type === 'debit_customer' ? 'debit_customer' : 'walk_in'
  );
  const [search, setSearch] = useState('');
  const [walkInName, setWalkInName] = useState(
    selectedCustomer.type === 'walk_in' && selectedCustomer.name !== 'Walk-in Customer'
      ? selectedCustomer.name
      : ''
  );
  const [walkInPhone, setWalkInPhone] = useState(selectedCustomer.phone || '');

  // Quick Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [addingCustomer, setAddingCustomer] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search))
  );

  const handleApplyWalkIn = () => {
    onSelect({
      type: 'walk_in',
      name: walkInName.trim() || 'Walk-in Customer',
      phone: walkInPhone.trim() || undefined,
    });
    onClose();
  };

  const handleSelectDebitCustomer = (cust: Customer) => {
    onSelect({
      type: 'debit_customer',
      id: cust.id,
      name: cust.name,
      phone: cust.phone || undefined,
      balance: cust.balance || 0,
      credit_limit: cust.credit_limit || 10000,
    });
    onClose();
  };

  const handleCreateCustomer = async () => {
    if (!newName.trim()) return;
    setAddingCustomer(true);
    try {
      const created = await onQuickAddCustomer(newName.trim(), newPhone.trim());
      if (created) {
        handleSelectDebitCustomer(created);
        setShowAddForm(false);
        setNewName('');
        setNewPhone('');
      }
    } finally {
      setAddingCustomer(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>Select Customer Type</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Choose Walk-in or select Debit Customer for Khata
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Customer Type Tabs */}
          <View style={[styles.tabBar, { backgroundColor: colors.surfaceSubtle }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                tab === 'walk_in' && { backgroundColor: brandColors.primary },
              ]}
              onPress={() => setTab('walk_in')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === 'walk_in' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                🚶 Walk-in Customer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                tab === 'debit_customer' && { backgroundColor: brandColors.primary },
              ]}
              onPress={() => setTab('debit_customer')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: tab === 'debit_customer' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                📒 Debit Customer (Khata)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Walk-in Customer */}
          {tab === 'walk_in' ? (
            <View style={styles.tabContent}>
              <View style={[styles.walkInCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Standard Counter Billing</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                  Default for regular counter cash/UPI sales. Optional name and phone can be recorded on the invoice.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Customer Name (Optional)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor={colors.textPlaceholder}
                    value={walkInName}
                    onChangeText={setWalkInName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone Number (Optional)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="phone-pad"
                    value={walkInPhone}
                    onChangeText={setWalkInPhone}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: brandColors.primary }]}
                  onPress={handleApplyWalkIn}
                >
                  <Text style={styles.primaryBtnText}>Use Walk-in Customer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Tab 2: Debit Customer (Khata) */
            <View style={[styles.tabContent, { flex: 1 }]}>
              {/* Search Bar + Quick Add Button */}
              <View style={styles.searchRow}>
                <TextInput
                  style={[
                    styles.searchInput,
                    { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary },
                  ]}
                  placeholder="Search debit customer by name or phone..."
                  placeholderTextColor={colors.textPlaceholder}
                  value={search}
                  onChangeText={setSearch}
                />
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: brandColors.primaryLight }]}
                  onPress={() => setShowAddForm(!showAddForm)}
                >
                  <Text style={[styles.addBtnText, { color: brandColors.primary }]}>
                    {showAddForm ? '✕' : '➕ Add'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Add New Customer Inline Form */}
              {showAddForm ? (
                <View style={[styles.quickAddCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.quickAddTitle, { color: colors.textPrimary }]}>Quick Register New Customer</Text>
                  <View style={styles.inlineRow}>
                    <TextInput
                      style={[styles.quickInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, flex: 2 }]}
                      placeholder="Customer Name *"
                      placeholderTextColor={colors.textPlaceholder}
                      value={newName}
                      onChangeText={setNewName}
                    />
                    <TextInput
                      style={[styles.quickInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary, flex: 2 }]}
                      placeholder="Phone Number"
                      placeholderTextColor={colors.textPlaceholder}
                      keyboardType="phone-pad"
                      value={newPhone}
                      onChangeText={setNewPhone}
                    />
                    <TouchableOpacity
                      style={[styles.createBtn, { backgroundColor: brandColors.primary }]}
                      onPress={handleCreateCustomer}
                      disabled={addingCustomer || !newName.trim()}
                    >
                      <Text style={styles.createBtnText}>{addingCustomer ? '...' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* Customer List */}
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={{ fontSize: 32 }}>👤</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      {search ? `No customer found matching "${search}"` : 'No registered customers yet.'}
                    </Text>
                    <TouchableOpacity
                      style={[styles.emptyAddBtn, { backgroundColor: brandColors.primary }]}
                      onPress={() => setShowAddForm(true)}
                    >
                      <Text style={styles.emptyAddBtnText}>+ Add New Customer</Text>
                    </TouchableOpacity>
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = selectedCustomer.type === 'debit_customer' && selectedCustomer.id === item.id;
                  const bal = item.balance || 0;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.customerCard,
                        {
                          backgroundColor: isSelected ? brandColors.primaryLight : colors.background,
                          borderColor: isSelected ? brandColors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectDebitCustomer(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.custName, { color: colors.textPrimary }]}>{item.name}</Text>
                        <Text style={[styles.custPhone, { color: colors.textMuted }]}>
                          📞 {item.phone || 'No phone'}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.balLabel, { color: colors.textMuted }]}>Khata Balance</Text>
                        <Text
                          style={[
                            styles.balAmount,
                            { color: bal > 0 ? brandColors.error : brandColors.success },
                          ]}
                        >
                          {formatCurrency(bal)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginVertical: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabContent: {
    flex: 1,
  },
  walkInCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  primaryBtn: {
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addBtn: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickAddCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  quickAddTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  createBtn: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  custName: {
    fontSize: 15,
    fontWeight: '700',
  },
  custPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  balLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

