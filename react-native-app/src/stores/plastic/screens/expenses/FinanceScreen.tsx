import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { financeService } from '../../services';
import { Expense, Payment } from '../../../../api/types';
import AppHeader from '../../components/layout/AppHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import AppIcon from '../../components/icons/AppIcon';
import { formatCurrency, formatDate } from '../../utils/formatters';

const QUICK_CATEGORIES = ['Rent', 'Electricity', 'Staff Salary', 'Transport', 'Packaging', 'Maintenance', 'Other'];
const PAYMENT_MODES = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'];

export const FinanceScreen: React.FC = () => {
  const { colors, brandColors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'expenses' | 'payments'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Expense Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [exps, pays] = await Promise.all([
        financeService.getExpenses().catch(() => []),
        financeService.getPayments().catch(() => []),
      ]);
      setExpenses(Array.isArray(exps) ? exps : []);
      setPayments(Array.isArray(pays) ? pays : []);
    } catch (err) {
      console.warn('Failed to load finance data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddExpense = async () => {
    if (!category.trim()) {
      Alert.alert('Required Field', 'Please specify an expense category.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Required Field', 'Please enter a valid expense amount.');
      return;
    }

    setSubmitting(true);
    try {
      await financeService.createExpense({
        category: category.trim(),
        amount: Number(amount),
        payment_method: paymentMethod,
        expense_date: expenseDate.trim() || undefined,
        description: description.trim() || undefined,
      });

      setShowAddModal(false);
      setCategory('');
      setAmount('');
      setDescription('');
      Alert.alert('Expense Recorded', 'Store operating expense has been saved.');
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = (exp: Expense) => {
    Alert.alert('Delete Expense', `Delete "${exp.category}" (${formatCurrency(exp.amount)})?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await financeService.deleteExpense(exp.id);
            await loadData();
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Unable to delete expense.');
          }
        },
      },
    ]);
  };

  // Monthly summary & category filter
  const { monthlyTotal, allTimeTotal, categoriesList } = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    let monthSum = 0;
    let totalSum = 0;
    const catSet = new Set<string>(['ALL']);

    expenses.forEach((e) => {
      const val = Number(e.amount || 0);
      totalSum += val;
      if (e.category) catSet.add(e.category);
      const dt = new Date(e.expense_date || '');
      if (!isNaN(dt.getTime()) && dt.getMonth() === curMonth && dt.getFullYear() === curYear) {
        monthSum += val;
      }
    });

    return {
      monthlyTotal: monthSum,
      allTimeTotal: totalSum,
      categoriesList: Array.from(catSet),
    };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'ALL') return expenses;
    return expenses.filter(
      (e) => String(e.category || '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [expenses, selectedCategory]);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <AppCard style={styles.entryCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.expIconBox, { backgroundColor: isDark ? '#3B191B' : '#FFEBEE' }]}>
          <AppIcon name="expenses" size={18} color="#E53935" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.entryTitle, { color: colors.textPrimary }]}>{item.category}</Text>
          <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
            {formatDate(item.expense_date)} • {item.payment_method}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={[styles.entryAmount, { color: brandColors.error }]}>
            -{formatCurrency(item.amount)}
          </Text>
          <TouchableOpacity onPress={() => handleDeleteExpense(item)} hitSlop={8}>
            <AppIcon name="trash" size={15} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {item.description ? (
        <Text style={[styles.entryDesc, { color: colors.textSecondary, borderTopColor: colors.borderLight }]}>
          {item.description}
        </Text>
      ) : null}
    </AppCard>
  );

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <AppCard style={styles.entryCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.expIconBox, { backgroundColor: isDark ? '#143624' : '#EAF8F0' }]}>
          <AppIcon name="CreditCard" size={18} color="#2EAD64" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.entryTitle, { color: colors.textPrimary }]}>
            {item.reference_type || 'Payment'}
          </Text>
          <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
            {formatDate(item.payment_date)} • {item.payment_method}
          </Text>
        </View>
        <Text style={[styles.entryAmount, { color: '#2EAD64' }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </AppCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Store Expenses"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={[styles.addBtn, { backgroundColor: brandColors.primaryOrange }]}
            activeOpacity={0.85}
          >
            <AppIcon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        }
      />

      {/* Monthly Summary Banner */}
      <View style={styles.summaryWrap}>
        <View
          style={[
            styles.summaryBanner,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              This Month Expenses
            </Text>
            <Text style={[styles.summaryVal, { color: brandColors.error }]}>
              {formatCurrency(monthlyTotal)}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderLight }]} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Recorded
            </Text>
            <Text style={[styles.summaryVal, { color: colors.textPrimary }]}>
              {formatCurrency(allTimeTotal)}
            </Text>
          </View>
        </View>
      </View>

      {/* Segment Tabs */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.borderLight },
        ]}
      >
        {[
          { key: 'expenses' as const, label: `Expense History (${expenses.length})` },
          { key: 'payments' as const, label: `Payments Audit (${payments.length})` },
        ].map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabBtn,
                active && { borderBottomWidth: 2.5, borderBottomColor: brandColors.primaryOrange },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: active ? brandColors.primaryOrange : colors.textSecondary,
                    fontWeight: active ? '800' : '600',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Filter Strip on Expenses Tab */}
      {activeTab === 'expenses' && expenses.length > 0 && (
        <View style={styles.filterStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categoriesList.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? brandColors.primaryOrange : colors.cardBg,
                      borderColor: active ? brandColors.primaryOrange : colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <Loader message="Loading expenses..." />
      ) : activeTab === 'expenses' ? (
        filteredExpenses.length === 0 ? (
          <EmptyState
            icon={<AppIcon name="expenses" size={32} color="#E53935" />}
            title="No Expenses Recorded"
            description="Track rent, electricity, transport, packaging, and store operating costs."
            actionTitle="Add Expense"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderExpenseItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[brandColors.primaryOrange]}
              />
            }
          />
        )
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<AppIcon name="CreditCard" size={32} color="#2EAD64" />}
          title="No Payment Records"
          description="Completed customer and supplier payments appear here automatically."
        />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPaymentItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primaryOrange]}
            />
          }
        />
      )}

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Store Expense</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.chipGroupLabel, { color: colors.textSecondary }]}>
                Quick Category
              </Text>
              <View style={styles.chipsWrap}>
                {QUICK_CATEGORIES.map((q) => {
                  const chosen = category === q;
                  return (
                    <TouchableOpacity
                      key={q}
                      onPress={() => setCategory(q)}
                      style={[
                        styles.quickChip,
                        {
                          backgroundColor: chosen ? brandColors.lightOrange : colors.surfaceSubtle,
                          borderColor: chosen ? brandColors.primaryOrange : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickChipText,
                          { color: chosen ? brandColors.darkOrange : colors.textPrimary },
                        ]}
                      >
                        {q}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppInput
                label="Category"
                placeholder="e.g. Electricity, Store Rent, Packaging"
                value={category}
                onChangeText={setCategory}
                required
              />
              <AppInput
                label="Amount (₹)"
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                required
              />
              <AppInput
                label="Date (YYYY-MM-DD)"
                placeholder="2026-11-26"
                value={expenseDate}
                onChangeText={setExpenseDate}
              />

              <Text style={[styles.chipGroupLabel, { color: colors.textSecondary }]}>
                Payment Method
              </Text>
              <View style={styles.chipsWrap}>
                {PAYMENT_MODES.map((m) => {
                  const active = paymentMethod === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setPaymentMethod(m)}
                      style={[
                        styles.quickChip,
                        {
                          backgroundColor: active ? brandColors.primaryOrange : colors.surfaceSubtle,
                          borderColor: active ? brandColors.primaryOrange : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickChipText,
                          { color: active ? '#FFFFFF' : colors.textPrimary },
                        ]}
                      >
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppInput
                label="Description"
                placeholder="Notes or bill reference"
                value={description}
                onChangeText={setDescription}
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <AppButton
                title="Cancel"
                variant="outline"
                fullWidth={false}
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Save Expense"
                fullWidth={false}
                onPress={handleAddExpense}
                loading={submitting}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 11,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '800' },
  summaryWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
  },
  summaryCol: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36 },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryVal: { fontSize: 19, fontWeight: '900', marginTop: 3 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 8 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 13 },
  filterStrip: { paddingHorizontal: 16, paddingTop: 10 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 32 },
  entryCard: { padding: 14, marginVertical: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryTitle: { fontSize: 14.5, fontWeight: '700' },
  entryDate: { fontSize: 12, marginTop: 2 },
  entryAmount: { fontSize: 15, fontWeight: '800' },
  entryDesc: {
    fontSize: 12.5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  chipGroupLabel: { fontSize: 12.5, fontWeight: '700', marginBottom: 6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  quickChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
  },
  quickChipText: { fontSize: 12, fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});

export default FinanceScreen;
