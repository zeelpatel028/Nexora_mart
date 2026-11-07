import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { productService, categoryService, unitService } from '../../services';
import { Category, CategoryField } from '../../models/types';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

type AddProductRouteProp = RouteProp<RootStackParamList, 'AddProduct'>;
type AddProductNavProp = NativeStackNavigationProp<RootStackParamList>;

export const AddProductScreen: React.FC = () => {
  const navigation = useNavigation<AddProductNavProp>();
  const route = useRoute<AddProductRouteProp>();
  const { categoryId: initialCatId } = route.params || {};
  const { colors, brandColors } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(initialCatId || null);
  const [dynamicFields, setDynamicFields] = useState<CategoryField[]>([]);
  const [units, setUnits] = useState<string[]>(['pcs', 'kg', 'g', 'pack', 'box', 'meter', 'pair', 'bottle']);

  // Core Fields
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [initialStock, setInitialStock] = useState('0');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Dynamic Attributes Map
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  // Variants state
  const [hasVariants, setHasVariants] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Load Categories & Units
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, unitList] = await Promise.all([
          categoryService.getCategories(true),
          unitService.getUnits().catch(() => []),
        ]);
        setCategories(cats);
        if (unitList && unitList.length > 0) {
          setUnits(unitList.map((u) => u.symbol));
        }
        if (!selectedCatId && cats.length > 0) {
          setSelectedCatId(cats[0].id);
        }
      } catch (err) {
        console.warn('Failed to load category meta:', err);
      }
    }
    loadMeta();
  }, [selectedCatId]);

  // Load Dynamic Fields for Category
  const loadFields = useCallback(async (catId: number) => {
    try {
      const fields = await categoryService.getCategoryFields(catId);
      setDynamicFields(fields);
    } catch (err) {
      console.warn('Failed to fetch category fields:', err);
    }
  }, []);

  useEffect(() => {
    if (selectedCatId) {
      loadFields(selectedCatId);
      // Auto enable variants for clothing/footwear
      const currentCat = categories.find((c) => c.id === selectedCatId);
      if (currentCat && ['clothing', 'footwear'].includes(currentCat.code)) {
        setHasVariants(true);
      }
    }
  }, [selectedCatId, categories, loadFields]);

  const handleAttributeChange = (field: string, value: string) => {
    setAttributes((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter product name.');
      return;
    }
    if (!sellingPrice || isNaN(Number(sellingPrice))) {
      Alert.alert('Required Field', 'Please enter a valid selling price.');
      return;
    }
    if (!selectedCatId) {
      Alert.alert('Required Field', 'Please select a store category.');
      return;
    }

    setSubmitting(true);
    try {
      await productService.createProduct({
        category_id: selectedCatId,
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        selling_price: Number(sellingPrice),
        purchase_price: purchasePrice ? Number(purchasePrice) : 0,
        mrp: mrp ? Number(mrp) : undefined,
        unit,
        min_stock_level: minStockLevel ? Number(minStockLevel) : 5,
        initial_stock: initialStock ? Number(initialStock) : 0,
        has_variants: hasVariants,
        attributes,
      });

      Alert.alert('Success', 'Product successfully added to store catalog!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Unable to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Add New Product" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* 1. Category Selector */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            1. Select Category <Text style={{ color: brandColors.error }}>*</Text>
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCatId(cat.id)}
                  style={[
                    styles.catBtn,
                    {
                      backgroundColor: isSelected ? brandColors.primary : colors.surfaceSubtle,
                      borderColor: isSelected ? brandColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catBtnText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* 2. Core Details */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. General Information</Text>

          <Input
            label="Product Name *"
            placeholder="e.g. Organic Basmati Rice 5kg"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Selling Price ($) *"
                placeholder="0.00"
                keyboardType="numeric"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Purchase Price ($)"
                placeholder="0.00"
                keyboardType="numeric"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="MRP ($)"
                placeholder="Optional MRP"
                keyboardType="numeric"
                value={mrp}
                onChangeText={setMrp}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Opening Stock"
                placeholder="0"
                keyboardType="numeric"
                value={initialStock}
                onChangeText={setInitialStock}
              />
            </View>
          </View>

          {/* Unit Chips */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Measurement Unit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {units.map((u) => {
                const isSelected = unit === u;
                return (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnit(u)}
                    style={[
                      styles.unitChip,
                      {
                        backgroundColor: isSelected ? brandColors.primary : colors.surfaceSubtle,
                        borderColor: isSelected ? brandColors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.unitText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Barcode / EAN"
                placeholder="Scan or enter barcode"
                value={barcode}
                onChangeText={setBarcode}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Min Stock Alert"
                placeholder="5"
                keyboardType="numeric"
                value={minStockLevel}
                onChangeText={setMinStockLevel}
              />
            </View>
          </View>

          <Input
            label="Image URL"
            placeholder="https://example.com/item.png"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
        </Card>

        {/* 3. Category-Specific Dynamic Specifications */}
        {dynamicFields.length > 0 && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ✨ Category Specifications
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              Custom attributes configured for this retail sector.
            </Text>

            {dynamicFields.map((field) => {
              const val = attributes[field.field_name] || '';
              return (
                <View key={field.id} style={{ marginBottom: 12 }}>
                  <Input
                    label={`${field.label} ${field.is_required ? '*' : ''}`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={val}
                    onChangeText={(text) => handleAttributeChange(field.field_name, text)}
                    keyboardType={field.field_type === 'number' ? 'numeric' : 'default'}
                  />
                </View>
              );
            })}
          </Card>
        )}

        {/* 4. Variants Toggle */}
        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 2 }]}>
                Product Has Variants
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Enable sizes, colors, or styles for this product.
              </Text>
            </View>
            <Switch
              value={hasVariants}
              onValueChange={setHasVariants}
              trackColor={{ false: colors.border, true: brandColors.primaryLight }}
              thumbColor={hasVariants ? brandColors.primary : '#F4F3F4'}
            />
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          title="Save & Add Product"
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginTop: 12, marginBottom: 24 }}
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
  sectionSub: {
    fontSize: 12,
    marginBottom: 12,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  catBtnText: {
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  unitText: {
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default AddProductScreen;

