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
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Customer } from '../../../../api/types';
import { SelectedCustomer } from '../../utils/billingTypes';
import { formatCurrency } from '../../utils/formatters';
import {
  UsersIcon,
  PhoneIcon,
  CloseIcon,
  SearchIcon,
  PlusIcon,
  CheckIcon,
  CreditCardIcon,
} from '../branding/Icons';

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
  const { colors, brandColors, isDark } = useTheme();

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
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Customer Selection
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Counter walk-in or Khata debit customer
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <CloseIcon size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Customer Type Tabs */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? '#262A34' : '#F3F4F6' }]}>
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
                  {
                    color: tab === 'walk_in' ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: tab === 'walk_in' ? '700' : '500',
                  },
                ]}
              >
                Walk-in Customer
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
                  {
                    color: tab === 'debit_customer' ? '#FFFFFF' : colors.textPrimary,
                    fontWeight: tab === 'debit_customer' ? '700' : '500',
                  },
                ]}
              >
                Registered Customer / Khata
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: Walk-in Customer */}
          {tab === 'walk_in' ? (
            <View style={styles.tabContent}>
              <View
                style={[
                  styles.walkInCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                  Standard Counter Billing
                </Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                  Standard counter sales for direct Cash/UPI transactions. Customer details can be optionally saved on invoice.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Customer Name (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="e.g. Counter Customer"
                    placeholderTextColor={colors.textPlaceholder}
                    value={walkInName}
                    onChangeText={setWalkInName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Phone Number (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
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
                  <Text style={styles.primaryBtnText}>Apply Walk-in Customer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Tab 2: Registered Customer / Khata */
            <View style={[styles.tabContent, { flex: 1 }]}>
              {/* Search Bar + Quick Add Button */}
              <View style={styles.searchRow}>
                <View
                  style={[
                    styles.searchBar,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <SearchIcon size={16} color={colors.textPlaceholder} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.textPrimary }]}
                    placeholder="Search customer name or phone..."
                    placeholderTextColor={colors.textPlaceholder}
                    value={search}
                    onChangeText={setSearch}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: brandColors.primary }]}
                  onPress={() => setShowAddForm(!showAddForm)}
                >
                  <PlusIcon size={16} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>
                    {showAddForm ? 'Close' : 'New'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Add Inline Form */}
              {showAddForm && (
                <View
                  style={[
                    styles.quickAddForm,
                    { backgroundColor: colors.background, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                    Quick Register Customer
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        marginBottom: 8,
                      },
                    ]}
                    placeholder="Customer Name *"
                    placeholderTextColor={colors.textPlaceholder}
                    value={newName}
                    onChangeText={setNewName}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        marginBottom: 10,
                      },
                    ]}
                    placeholder="Phone Number"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="phone-pad"
                    value={newPhone}
                    onChangeText={setNewPhone}
                  />
                  <TouchableOpacity
                    style={[
                      styles.saveCustomerBtn,
                      {
                        backgroundColor: brandColors.primary,
                        opacity: !newName.trim() || addingCustomer ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleCreateCustomer}
                    disabled={!newName.trim() || addingCustomer}
                  >
                    {addingCustomer ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveCustomerBtnText}>Register & Select</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Customers List */}
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.customerListContent}
                renderItem={({ item }) => {
                  const isSelected =
                    selectedCustomer.type === 'debit_customer' &&
                    selectedCustomer.id === item.id;
                  const bal = item.balance || 0;

                  return (
                    <TouchableOpacity
                      style={[
                        styles.customerRow,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#2D2018'
                              : brandColors.lightOrange
                            : colors.surface,
                          borderColor: isSelected ? brandColors.primary : colors.borderLight,
                        },
                      ]}
                      onPress={() => handleSelectDebitCustomer(item)}
                    >
                      <View style={styles.custLeft}>
                        <View
                          style={[
                            styles.avatarCircle,
                            {
                              backgroundColor: isDark ? '#262A34' : '#F3F4F6',
                            },
                          ]}
                        >
                          <Text style={[styles.avatarInitial, { color: brandColors.primary }]}>
                            {item.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.custName, { color: colors.textPrimary }]}>
                            {item.name}
                          </Text>
                          {item.phone ? (
                            <Text style={[styles.custPhone, { color: colors.textSecondary }]}>
                              {item.phone}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={styles.custRight}>
                        {bal > 0 ? (
                          <>
                            <Text style={[styles.balTag, { color: '#EF4444' }]}>Khata Due</Text>
                            <Text style={[styles.balAmount, { color: '#EF4444' }]}>
                              {formatCurrency(bal)}
                            </Text>
                          </>
                        ) : (
                          <Text style={[styles.balTag, { color: '#10B981' }]}>Settled</Text>
                        )}
                        {isSelected && <CheckIcon size={16} color={brandColors.primary} />}
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  container: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '88%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12.5,
  },
  tabContent: {
    padding: 16,
  },
  walkInCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13.5,
  },
  primaryBtn: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  quickAddForm: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  saveCustomerBtn: {
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCustomerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  customerListContent: {
    paddingBottom: 20,
    gap: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  custLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
  },
  custName: {
    fontSize: 14,
    fontWeight: '700',
  },
  custPhone: {
    fontSize: 12,
    marginTop: 1,
  },
  custRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balTag: {
    fontSize: 10,
    fontWeight: '700',
  },
  balAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
});

export default CustomerSelectorModal;
