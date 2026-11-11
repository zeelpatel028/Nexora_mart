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

type StockInRouteProp = RouteProp<RootStackParamList, 'StockInward'>;

export const StockInwardScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<StockInRouteProp>();
  const { productId: initialProdId } = route.params || {};
  const { colors, brandColors } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(initialProdId || null);
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
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

  const handleSubmit = async () => {
    if (!selectedProductId) {
      Alert.alert('Required Field', 'Please select a product.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      Alert.alert('Required Field', 'Please enter a valid stock quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.stockIn({
        product_id: selectedProductId,
        quantity: Number(quantity),
        unit_cost: unitCost ? Number(unitCost) : undefined,
        batch_number: batchNumber.trim() || undefined,
        expiry_date: expiryDate.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Stock received and inventory quantity updated!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to record stock inward.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Stock Inward" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Product Selection */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Select Product</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {products.map((p) => {
              const active = selectedProductId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedProductId(p.id)}
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
            <View style={[styles.prodPreview, { backgroundColor: brandColors.primaryLight }]}>
              <Text style={[styles.previewName, { color: brandColors.primary }]}>
                {selectedProduct.name}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Current Stock: {selectedProduct.current_stock} {selectedProduct.unit} • SKU: {selectedProduct.sku}
              </Text>
            </View>
          )}
        </Card>

        {/* Quantities & Inward Details */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Inward Quantities</Text>

          <Input
            label="Inward Quantity *"
            placeholder="e.g. 50"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />

          <Input
            label="Unit Cost ($)"
            placeholder="e.g. 12.50"
            keyboardType="numeric"
            value={unitCost}
            onChangeText={setUnitCost}
          />

          <Input
            label="Batch / Lot Number"
            placeholder="Optional batch e.g. B-2026-X"
            value={batchNumber}
            onChangeText={setBatchNumber}
          />

          <Input
            label="Expiry Date (YYYY-MM-DD)"
            placeholder="e.g. 2027-12-31"
            value={expiryDate}
            onChangeText={setExpiryDate}
          />

          <Input
            label="Movement Notes"
            placeholder="Supplier delivery / restock memo"
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        <Button
          title="Confirm Stock In"
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
    marginBottom: 2,
  },
});

export default StockInwardScreen;

