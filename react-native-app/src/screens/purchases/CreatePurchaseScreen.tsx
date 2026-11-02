import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { purchaseService, partnerService, productService } from '../../services';
import { Supplier, Product } from '../../models/types';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';

interface PurchaseLine {
  product_id: number;
  product_name: string;
  quantity: string;
  unit_cost: string;
  batch_number: string;
  expiry_date: string;
}

export const CreatePurchaseScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, brandColors } = useTheme();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

  // Purchase line items
  const [lines, setLines] = useState<PurchaseLine[]>([
    { product_id: 0, product_name: '', quantity: '10', unit_cost: '0', batch_number: '', expiry_date: '' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sups, prods] = await Promise.all([
          partnerService.getSuppliers().catch(() => []),
          productService.getProducts({ isActive: true, limit: 100 }).catch(() => []),
        ]);
        setSuppliers(sups);
        setProducts(prods);
        if (sups.length > 0) setSelectedSupplierId(sups[0].id);
        if (prods.length > 0) {
          setLines([
            {
              product_id: prods[0].id,
              product_name: prods[0].name,
              quantity: '10',
              unit_cost: String(prods[0].purchase_price || 0),
              batch_number: '',
              expiry_date: '',
            },
          ]);
        }
      } catch (err) {
        console.warn('Failed to load purchase metadata:', err);
      }
    }
    loadMeta();
  }, []);

  const addLine = () => {
    if (products.length === 0) return;
    setLines((prev) => [
      ...prev,
      {
        product_id: products[0].id,
        product_name: products[0].name,
        quantity: '1',
        unit_cost: String(products[0].purchase_price || 0),
        batch_number: '',
        expiry_date: '',
      },
    ]);
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof PurchaseLine, value: any) => {
    setLines((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'product_id') {
        const found = products.find((p) => p.id === value);
        if (found) {
          copy[idx].product_name = found.name;
          copy[idx].unit_cost = String(found.purchase_price || 0);
        }
      }
      return copy;
    });
  };

  const totalEstimate = lines.reduce(
    (sum, line) => sum + Number(line.quantity || 0) * Number(line.unit_cost || 0),
    0
  );

  const handleSubmit = async () => {
    if (!selectedSupplierId) {
      Alert.alert('Required Field', 'Please select a supplier.');
      return;
    }
    if (lines.length === 0) {
      Alert.alert('Required Items', 'Please add at least one line item.');
      return;
    }

    setSubmitting(true);
    try {
      await purchaseService.createPurchase({
        supplier_id: selectedSupplierId,
        invoice_number: invoiceNumber.trim() || undefined,
        payment_method: paymentMethod,
        paid_amount: totalEstimate,
        items: lines.map((l) => ({
          product_id: l.product_id,
          quantity: Number(l.quantity || 1),
          unit_cost: Number(l.unit_cost || 0),
          batch_number: l.batch_number.trim() || undefined,
          expiry_date: l.expiry_date.trim() || undefined,
        })),
      });

      Alert.alert(
        'Purchase Recorded',
        'Purchase order created and inventory stock automatically received!'
      );
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Record Purchase Order" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Supplier & Header */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Supplier</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {suppliers.map((s) => {
              const active = selectedSupplierId === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedSupplierId(s.id)}
                  style={[
                    styles.supChip,
                    {
                      backgroundColor: active ? brandColors.primary : colors.surfaceSubtle,
                      borderColor: active ? brandColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.supText,
                      { color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    🏢 {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Input
            label="Supplier Invoice / Bill #"
            placeholder="e.g. INV-2026-904"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
          />

          <Input
            label="Payment Method"
            placeholder="BANK_TRANSFER / CASH / CREDIT"
            value={paymentMethod}
            onChangeText={setPaymentMethod}
          />
        </Card>

        {/* Line Items */}
        <Card>
          <View style={styles.lineHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              Items to Inward ({lines.length})
            </Text>
            <TouchableOpacity onPress={addLine}>
              <Text style={{ color: brandColors.primary, fontWeight: '700', fontSize: 13 }}>
                + Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {lines.map((line, idx) => (
            <View key={idx} style={[styles.lineBox, { borderColor: colors.borderLight }]}>
              <View style={styles.lineTitleRow}>
                <Text style={[styles.lineProdName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {line.product_name || 'Select Product'}
                </Text>
                {lines.length > 1 && (
                  <TouchableOpacity onPress={() => removeLine(idx)}>
                    <Text style={{ color: brandColors.error, fontSize: 12 }}>Remove ✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Product quick-picker chip list */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 6 }}>
                {products.map((p) => {
                  const isCurrent = line.product_id === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => updateLine(idx, 'product_id', p.id)}
                      style={[
                        styles.pickerChip,
                        {
                          backgroundColor: isCurrent ? brandColors.primaryLight : colors.surfaceSubtle,
                          borderColor: isCurrent ? brandColors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          { color: isCurrent ? brandColors.primary : colors.textSecondary },
                        ]}
                      >
                        {p.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Input
                    label="Qty"
                    keyboardType="numeric"
                    value={line.quantity}
                    onChangeText={(t) => updateLine(idx, 'quantity', t)}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Input
                    label="Unit Cost ($)"
                    keyboardType="numeric"
                    value={line.unit_cost}
                    onChangeText={(t) => updateLine(idx, 'unit_cost', t)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Input
                    label="Batch"
                    placeholder="Batch #"
                    value={line.batch_number}
                    onChangeText={(t) => updateLine(idx, 'batch_number', t)}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Input
                    label="Expiry"
                    placeholder="YYYY-MM-DD"
                    value={line.expiry_date}
                    onChangeText={(t) => updateLine(idx, 'expiry_date', t)}
                  />
                </View>
              </View>
            </View>
          ))}

          {/* Grand Total */}
          <View style={[styles.totalRow, { borderTopColor: colors.borderLight }]}>
            <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Purchase Value</Text>
            <Text style={[styles.totalVal, { color: brandColors.primary }]}>
              {formatCurrency(totalEstimate)}
            </Text>
          </View>
        </Card>

        <Button
          title="Save & Inward Stock"
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: 8, marginBottom: 24 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 8,
  },
  supChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  supText: {
    fontSize: 12,
  },
  lineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lineBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  lineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lineProdName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  pickerChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  pickerChipText: {
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
});

export default CreatePurchaseScreen;

