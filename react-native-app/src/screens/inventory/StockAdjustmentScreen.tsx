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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { inventoryService, productService } from '../../services';
import { Product } from '../../models/types';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

type AdjustRouteProp = RouteProp<RootStackParamList, 'StockAdjustment'>;

export const StockAdjustmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AdjustRouteProp>();
  const { productId: initialProdId } = route.params || {};
  const { colors, brandColors } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(initialProdId || null);
  const [physicalCount, setPhysicalCount] = useState('');
  const [reason, setReason] = useState('Physical audit count reconciliation');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const prods = await productService.getProducts({ isActive: true, limit: 100 });
        setProducts(prods);
        if (!selectedProductId && prods.length > 0) {
          setSelectedProductId(prods[0].id);
        }
      } catch (err) {
        console.warn('Failed to load products:', err);
      }
    }
    loadProducts();
  }, [selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = async () => {
    if (!selectedProductId) {
      Alert.alert('Required Field', 'Please select a product.');
      return;
    }
    if (physicalCount === '' || isNaN(Number(physicalCount))) {
      Alert.alert('Required Field', 'Please enter verified physical count.');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.adjustStock({
        product_id: selectedProductId,
        physical_count: Number(physicalCount),
        reason: reason.trim() || 'Physical inventory audit',
        notes: notes.trim() || undefined,
      });

      Alert.alert('Reconciliation Done', 'Inventory has been adjusted to match physical count.');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Adjustment Error', err.message || 'Failed to adjust stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStock = selectedProduct?.current_stock ?? 0;
  const countNum = physicalCount !== '' ? Number(physicalCount) : null;
  const diff = countNum !== null ? countNum - currentStock : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Stock Adjustment & Audit" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Product</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {products.map((p) => {
              const active = selectedProductId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => {
                    setSelectedProductId(p.id);
                    setPhysicalCount(String(p.current_stock));
                  }}
                  style={[
                    styles.prodChip,
                    {
                      backgroundColor: active ? brandColors.primary : colors.surfaceSubtle,
                      borderColor: active ? brandColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.prodText,
                      { color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedProduct && (
            <View style={[styles.prodPreview, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                {selectedProduct.name}
              </Text>
              <Text style={{ fontSize: 13, color: brandColors.primary, fontWeight: '700', marginTop: 2 }}>
                Current System Record: {currentStock} {selectedProduct.unit}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Audit Reconciliation</Text>

          <Input
            label="Verified Physical Count *"
            placeholder="Count present in store"
            keyboardType="numeric"
            value={physicalCount}
            onChangeText={setPhysicalCount}
          />

          {diff !== null && (
            <View
              style={[
                styles.diffBox,
                { backgroundColor: diff === 0 ? brandColors.successLight : diff < 0 ? brandColors.errorLight : brandColors.primaryLight },
              ]}
            >
              <Text
                style={[
                  styles.diffText,
                  { color: diff === 0 ? brandColors.success : diff < 0 ? brandColors.error : brandColors.primary },
                ]}
              >
                {diff === 0
                  ? 'Count matches system record exactly.'
                  : diff > 0
                  ? `Surplus of +${diff} items detected.`
                  : `Shortage of ${diff} items detected.`}
              </Text>
            </View>
          )}

          <Input
            label="Adjustment Reason"
            value={reason}
            onChangeText={setReason}
            placeholder="Audit discrepancy, breakage, recount"
          />

          <Input
            label="Auditor Memo / Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional audit trail note"
          />
        </Card>

        <Button
          title="Save Physical Adjustment"
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
  prodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  prodText: {
    fontSize: 13,
  },
  prodPreview: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '700',
  },
  diffBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    marginTop: -6,
  },
  diffText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StockAdjustmentScreen;

