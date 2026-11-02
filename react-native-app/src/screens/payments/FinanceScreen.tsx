import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { financeService } from '../../services';
import { Expense, Payment } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const FinanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [activeTab, setActiveTab] = useState<'expenses' | 'payments'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add Expense Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [exps, pays] = await Promise.all([
        financeService.getExpenses().catch(() => []),
        financeService.getPayments().catch(() => []),
      ]);
      setExpenses(exps);
      setPayments(pays);
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
        description: description.trim() || undefined,
      });

      setShowAddModal(false);
      setCategory('');
      setAmount('');
      setDescription('');
      Alert.alert('Expense Recorded', 'Store operating expense has been logged.');
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Card style={styles.entryCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.entryTitle, { color: colors.textPrimary }]}>{item.category}</Text>
          <Text style={[styles.entryDate, { color: colors.textMuted }]}>
            {formatDate(item.expense_date)} • Paid via {item.payment_method}
          </Text>
        </View>

        <Text style={[styles.entryAmount, { color: brandColors.error }]}>
          -{formatCurrency(item.amount)}
        </Text>
      </View>

      {item.description ? (
        <Text style={[styles.entryDesc, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      ) : null}
    </Card>
  );

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <Card style={styles.entryCard}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.entryTitle, { color: colors.textPrimary }]}>
            Payment for {item.reference_type}
          </Text>
          <Text style={[styles.entryDate, { color: colors.textMuted }]}>
            {formatDate(item.payment_date)} • {item.payment_method}
          </Text>
        </View>

        <Text style={[styles.entryAmount, { color: brandColors.primary }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Finance & Payments"
        subtitle={`Total Expenses: ${formatCurrency(totalExpenses)}`}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '➕',
          onPress: () => setShowAddModal(true),
        }}
      />

      {/* Segment Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('expenses')}
          style={[
            styles.tab,
            activeTab === 'expenses' && { borderBottomColor: brandColors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'expenses' ? brandColors.primary : colors.textSecondary },
              activeTab === 'expenses' && { fontWeight: '700' },
            ]}
          >
            💸 Store Expenses ({expenses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('payments')}
          style={[
            styles.tab,
            activeTab === 'payments' && { borderBottomColor: brandColors.primary, borderBottomWidth: 2 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'payments' ? brandColors.primary : colors.textSecondary },
              activeTab === 'payments' && { fontWeight: '700' },
            ]}
          >
            💳 Transaction Audit ({payments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Loader message="Loading financial records..." />
      ) : activeTab === 'expenses' ? (
        expenses.length === 0 ? (
          <EmptyState
            icon="💸"
            title="No Expenses Logged"
            description="Track store rent, electricity, courier, or packaging costs."
            actionTitle="Record First Expense"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderExpenseItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[brandColors.primary]}
              />
            }
          />
        )
      ) : payments.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No Payment Audit Trails"
          description="Completed checkout sales and purchase disbursements will appear here."
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
              colors={[brandColors.primary]}
            />
          }
        />
      )}

      {/* Add Expense Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Record Store Expense</Text>

            <Input
              label="Expense Category *"
              placeholder="e.g. Electricity, Store Rent, Packaging"
              value={category}
              onChangeText={setCategory}
            />

            <Input
              label="Expense Amount ($) *"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Input
              label="Payment Method"
              placeholder="CASH / UPI / CARD / BANK_TRANSFER"
              value={paymentMethod}
              onChangeText={setPaymentMethod}
            />

            <Input
              label="Description / Purpose"
              placeholder="Brief note or receipt details"
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Save Expense"
                onPress={handleAddExpense}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  entryCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  entryDate: {
    fontSize: 11,
    marginTop: 2,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  entryDesc: {
    fontSize: 12,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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

export default FinanceScreen;

