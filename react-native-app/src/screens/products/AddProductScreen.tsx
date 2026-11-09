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
import { useAuth } from '../../context/AuthContext';
import { getStoreTypeConfig, StoreTypeField } from '../../storeTypes';
import { productService, categoryService, unitService } from '../../services';
import { Category } from '../../models/types';
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
  const { user, store } = useAuth();

  // 1. Read store_type from the authenticated user's store record (immutable through product form)
  const storeTypeCode =
    store?.store_type?.code ||
    (store as any)?.store_type_code ||
    (store as any)?.store_type ||
    (user as any)?.store_type ||
    (user as any)?.storeType ||
    'grocery';

  const storeTypeConfig = getStoreTypeConfig(storeTypeCode);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(initialCatId || null);
  const [units, setUnits] = useState<string[]>(
    storeTypeConfig.defaultUnits && storeTypeConfig.defaultUnits.length > 0
      ? storeTypeConfig.defaultUnits
      : ['piece', 'kg', 'g', 'pack', 'box', 'meter', 'pair', 'bottle']
  );

  // Core Common Fields (Available for all stores)
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState(
    storeTypeConfig.defaultUnits && storeTypeConfig.defaultUnits.length > 0
      ? storeTypeConfig.defaultUnits[0]
      : 'piece'
  );
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [initialStock, setInitialStock] = useState('0');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Store-specific Dynamic Attributes
  const [attributes, setAttributes] = useState<Record<string, any>>(() => {
    // Pre-populate defaults from store type config
    const initial: Record<string, any> = {};
    storeTypeConfig.fields.forEach((f) => {
      if (f.defaultValue) {
        initial[f.fieldName] = f.defaultValue;
      }
    });
    return initial;
  });

  // Optional Custom Attributes
  const [customAttrs, setCustomAttrs] = useState<{ key: string; value: string }[]>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Variants state
  const [hasVariants, setHasVariants] = useState(storeTypeCode === 'clothing');
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
          // Merge store type units and custom DB units
          const dbUnitSymbols = unitList.map((u) => u.symbol);
          const merged = Array.from(new Set([...storeTypeConfig.defaultUnits, ...dbUnitSymbols]));
          setUnits(merged);
        }

        if (!selectedCatId && cats.length > 0) {
          // Select category matching current store type if available
          const matchingCat = cats.find(
            (c) =>
              c.code.toLowerCase() === storeTypeCode.toLowerCase() ||
              c.name.toLowerCase().includes(storeTypeConfig.name.toLowerCase()) ||
              storeTypeConfig.name.toLowerCase().includes(c.name.toLowerCase())
          );
          setSelectedCatId(matchingCat ? matchingCat.id : cats[0].id);
        }
      } catch (err) {
        console.warn('Failed to load category meta:', err);
      }
    }
    loadMeta();
  }, [selectedCatId, storeTypeCode, storeTypeConfig]);

  const handleAttributeChange = (field: string, value: any) => {
    setAttributes((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCustomAttribute = () => {
    if (!newCustomKey.trim()) {
      Alert.alert('Required', 'Please enter a name for the custom attribute.');
      return;
    }
    setCustomAttrs((prev) => [...prev, { key: newCustomKey.trim(), value: newCustomVal.trim() }]);
    setNewCustomKey('');
    setNewCustomVal('');
    setShowAddCustom(false);
  };

  const handleRemoveCustomAttribute = (index: number) => {
    setCustomAttrs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the product name.');
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

    // Merge store-specific attributes and custom attributes
    const finalAttributes: Record<string, any> = { ...attributes };
    customAttrs.forEach((item) => {
      if (item.key.trim()) {
        finalAttributes[item.key.trim()] = item.value.trim();
      }
    });

    // Validate store-type specific rules on frontend
    const validation = storeTypeConfig.validate(finalAttributes);
    if (!validation.isValid) {
      Alert.alert('Store Type Validation', validation.error || 'Please fill in required fields for your store type.');
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
        attributes: finalAttributes,
      });

      Alert.alert('Success', 'Product successfully added to your store catalog!');
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
        {/* Dynamic Store Vertical Context Banner */}
        <View
          style={[
            styles.storeTypeBanner,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: brandColors.primary,
            },
          ]}
        >
          <View style={[styles.storeTypeBadge, { backgroundColor: brandColors.primary }]}>
            <Text style={styles.storeTypeBadgeText}>🏬 {storeTypeConfig.name.toUpperCase()}</Text>
          </View>
          <Text style={[styles.storeTypeBannerTitle, { color: colors.textPrimary }]}>
            Tailored Product Specifications
          </Text>
          <Text style={[styles.storeTypeBannerSubtitle, { color: colors.textSecondary }]}>
            Fields below are dynamically configured specifically for your {storeTypeConfig.name}. Unrelated store fields are automatically hidden.
          </Text>
        </View>

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

        {/* 2. Core Common Product Details */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Core Information</Text>

          <Input
            label="Product Name *"
            placeholder="e.g. Premium Cotton Shirt or Paracetamol 500mg"
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

          {/* Measurement Unit Selector */}
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
                label="SKU"
                placeholder="Auto-generated if blank"
                value={sku}
                onChangeText={setSku}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Barcode / EAN"
                placeholder="Scan or enter barcode"
                value={barcode}
                onChangeText={setBarcode}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Min Stock Alert"
                placeholder="5"
                keyboardType="numeric"
                value={minStockLevel}
                onChangeText={setMinStockLevel}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Image URL"
                placeholder="https://example.com/item.png"
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
          </View>

          <Input
            label="Description"
            placeholder="Product description (optional)"
            value={description}
            onChangeText={setDescription}
          />
        </Card>

        {/* 3. DYNAMIC STORE-TYPE SPECIFIC FIELDS */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              3. {storeTypeConfig.name} Attributes
            </Text>
            <View style={[styles.countBadge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.countBadgeText, { color: brandColors.primary }]}>
                {storeTypeConfig.fields.length} Fields
              </Text>
            </View>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textSecondary, marginTop: 4, marginBottom: 16 }]}>
            {storeTypeConfig.description}
          </Text>

          {storeTypeConfig.fields.map((field: StoreTypeField) => {
            const val = attributes[field.fieldName];

            // 1. Boolean Toggle Field
            if (field.fieldType === 'boolean') {
              const isChecked = val === true || val === 'true';
              return (
                <View key={field.fieldName} style={[styles.switchRow, { marginVertical: 10 }]}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      {field.fieldLabel} {field.isRequired ? <Text style={{ color: brandColors.error }}>*</Text> : null}
                    </Text>
                    {field.helpText ? (
                      <Text style={[styles.fieldHelpText, { color: colors.textSecondary }]}>
                        {field.helpText}
                      </Text>
                    ) : null}
                  </View>
                  <Switch
                    value={isChecked}
                    onValueChange={(checked) => handleAttributeChange(field.fieldName, checked)}
                    trackColor={{ false: colors.border, true: brandColors.primaryLight }}
                    thumbColor={isChecked ? brandColors.primary : '#F4F3F4'}
                  />
                </View>
              );
            }

            // 2. Select / Options Field
            if (field.fieldType === 'select' && field.options && field.options.length > 0) {
              const currentVal = val !== undefined && val !== null ? String(val) : field.defaultValue || '';
              return (
                <View key={field.fieldName} style={{ marginBottom: 16 }}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                    {field.fieldLabel} {field.isRequired ? <Text style={{ color: brandColors.error }}>*</Text> : null}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                    {field.options.map((opt) => {
                      const isSelected = currentVal === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          onPress={() => handleAttributeChange(field.fieldName, opt)}
                          style={[
                            styles.chipBtn,
                            {
                              backgroundColor: isSelected ? brandColors.primary : colors.surfaceSubtle,
                              borderColor: isSelected ? brandColors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? '#FFFFFF' : colors.textPrimary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  {field.helpText ? (
                    <Text style={[styles.fieldHelpText, { color: colors.textSecondary, marginTop: 4 }]}>
                      {field.helpText}
                    </Text>
                  ) : null}
                </View>
              );
            }

            // 3. Date Input Field
            if (field.fieldType === 'date') {
              return (
                <View key={field.fieldName} style={{ marginBottom: 14 }}>
                  <Input
                    label={`${field.fieldLabel} ${field.isRequired ? '*' : ''}`}
                    placeholder={field.placeholder || 'YYYY-MM-DD'}
                    value={val !== undefined && val !== null ? String(val) : ''}
                    onChangeText={(text) => handleAttributeChange(field.fieldName, text)}
                  />
                  <View style={styles.dateHelperRow}>
                    <TouchableOpacity
                      onPress={() => {
                        const today = new Date().toISOString().split('T')[0];
                        handleAttributeChange(field.fieldName, today);
                      }}
                      style={[styles.dateChip, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.dateChipText, { color: brandColors.primary }]}>Today</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const nextYear = new Date();
                        nextYear.setFullYear(nextYear.getFullYear() + 1);
                        handleAttributeChange(field.fieldName, nextYear.toISOString().split('T')[0]);
                      }}
                      style={[styles.dateChip, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.dateChipText, { color: brandColors.primary }]}>+1 Year</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        const next2Years = new Date();
                        next2Years.setFullYear(next2Years.getFullYear() + 2);
                        handleAttributeChange(field.fieldName, next2Years.toISOString().split('T')[0]);
                      }}
                      style={[styles.dateChip, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.dateChipText, { color: brandColors.primary }]}>+2 Years</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            // 4. Standard Text / Numeric Input Field
            return (
              <View key={field.fieldName} style={{ marginBottom: 14 }}>
                <Input
                  label={`${field.fieldLabel} ${field.isRequired ? '*' : ''}`}
                  placeholder={field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}`}
                  value={val !== undefined && val !== null ? String(val) : ''}
                  onChangeText={(text) => handleAttributeChange(field.fieldName, text)}
                  keyboardType={field.fieldType === 'number' ? 'numeric' : 'default'}
                />
                {field.helpText ? (
                  <Text style={[styles.fieldHelpText, { color: colors.textSecondary, marginTop: -4, marginBottom: 8 }]}>
                    {field.helpText}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </Card>

        {/* 4. Optional Custom Attributes */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              4. Optional Custom Attributes
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddCustom(!showAddCustom)}
              style={[styles.addCustomBtn, { backgroundColor: colors.surfaceSubtle }]}
            >
              <Text style={[styles.addCustomBtnText, { color: brandColors.primary }]}>
                {showAddCustom ? 'Cancel' : '+ Add Custom Attribute'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionSub, { color: colors.textSecondary, marginTop: 4, marginBottom: 12 }]}>
            Add any additional business-specific specifications or custom tags.
          </Text>

          {customAttrs.map((item, idx) => (
            <View key={idx} style={[styles.customAttrRow, { borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.customAttrKey, { color: colors.textPrimary }]}>{item.key}</Text>
                <Text style={[styles.customAttrVal, { color: colors.textSecondary }]}>{item.value}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveCustomAttribute(idx)}
                style={styles.customAttrRemove}
              >
                <Text style={{ color: brandColors.error, fontWeight: '700', fontSize: 13 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {showAddCustom && (
            <View style={[styles.addCustomForm, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Input
                label="Attribute Name *"
                placeholder="e.g. Origin Country, Grade, Fragrance"
                value={newCustomKey}
                onChangeText={setNewCustomKey}
              />
              <Input
                label="Attribute Value"
                placeholder="e.g. India, Premium Grade, Floral"
                value={newCustomVal}
                onChangeText={setNewCustomVal}
              />
              <Button
                title="Save Attribute"
                onPress={handleAddCustomAttribute}
                style={{ marginTop: 8 }}
              />
            </View>
          )}
        </Card>

        {/* 5. Variants Toggle */}
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
  storeTypeBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  storeTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  storeTypeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  storeTypeBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  storeTypeBannerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  fieldHelpText: {
    fontSize: 11,
    marginTop: 2,
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
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateHelperRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  dateChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addCustomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  addCustomBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customAttrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  customAttrKey: {
    fontSize: 13,
    fontWeight: '700',
  },
  customAttrVal: {
    fontSize: 12,
    marginTop: 2,
  },
  customAttrRemove: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addCustomForm: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
});

export default AddProductScreen;
