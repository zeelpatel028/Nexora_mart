import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { getStoreTypeConfig, StoreTypeField } from '../../storeTypes';
import { productService, unitService } from '../../services';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

type EditProductRouteProp = RouteProp<RootStackParamList, 'EditProduct'>;

export const EditProductScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditProductRouteProp>();
  const { productId } = route.params;
  const { colors, brandColors } = useTheme();
  const { user, store } = useAuth();

  // Read store_type from authenticated user's store record
  const storeTypeCode =
    store?.store_type?.code ||
    (store as any)?.store_type_code ||
    (store as any)?.store_type ||
    (user as any)?.store_type ||
    (user as any)?.storeType ||
    'grocery';

  const storeTypeConfig = getStoreTypeConfig(storeTypeCode);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Core Fields
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('piece');
  const [units, setUnits] = useState<string[]>(
    storeTypeConfig.defaultUnits && storeTypeConfig.defaultUnits.length > 0
      ? storeTypeConfig.defaultUnits
      : ['piece', 'kg', 'g', 'pack', 'box', 'meter', 'pair', 'bottle']
  );
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // Store-specific Dynamic Attributes
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  // Custom Attributes
  const [customAttrs, setCustomAttrs] = useState<{ key: string; value: string }[]>([]);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomVal, setNewCustomVal] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      const [p, unitList] = await Promise.all([
        productService.getProduct(productId),
        unitService.getUnits().catch(() => []),
      ]);

      setName(p.name);
      setSellingPrice(String(p.selling_price));
      setPurchasePrice(p.purchase_price ? String(p.purchase_price) : '');
      setMrp(p.mrp ? String(p.mrp) : '');
      setUnit(p.unit || 'piece');
      setMinStockLevel(String(p.min_stock_level || 5));
      setBarcode(p.barcode || '');
      setSku(p.sku || '');
      setImageUrl(p.image_url || '');
      setDescription(p.description || '');

      if (unitList && unitList.length > 0) {
        const dbUnitSymbols = unitList.map((u) => u.symbol);
        const merged = Array.from(new Set([...storeTypeConfig.defaultUnits, ...dbUnitSymbols]));
        setUnits(merged);
      }

      // Load store-specific attributes & extract custom attributes
      const rawAttrs = p.attributes || {};
      const knownFieldNames = new Set(storeTypeConfig.fields.map((f) => f.fieldName));

      // Separate known vertical fields vs extra custom fields
      const storeAttrs: Record<string, any> = {};
      const extraCustom: { key: string; value: string }[] = [];

      Object.entries(rawAttrs).forEach(([k, v]) => {
        if (knownFieldNames.has(k)) {
          storeAttrs[k] = v;
        } else {
          extraCustom.push({ key: k, value: String(v) });
        }
      });

      setAttributes(storeAttrs);
      setCustomAttrs(extraCustom);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load product for editing.');
    } finally {
      setLoading(false);
    }
  }, [productId, storeTypeConfig]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Product name is required.');
      return;
    }
    if (!sellingPrice || isNaN(Number(sellingPrice))) {
      Alert.alert('Required Field', 'Valid selling price is required.');
      return;
    }

    // Merge store-specific attributes and custom attributes
    const finalAttributes: Record<string, any> = { ...attributes };
    customAttrs.forEach((item) => {
      if (item.key.trim()) {
        finalAttributes[item.key.trim()] = item.value.trim();
      }
    });

    // Validate store-type attributes on frontend
    const validation = storeTypeConfig.validate(finalAttributes);
    if (!validation.isValid) {
      Alert.alert('Store Type Validation', validation.error || 'Please check store-specific attributes.');
      return;
    }

    setSubmitting(true);
    try {
      await productService.updateProduct(productId, {
        name: name.trim(),
        selling_price: Number(sellingPrice),
        purchase_price: purchasePrice ? Number(purchasePrice) : 0,
        mrp: mrp ? Number(mrp) : undefined,
        unit,
        min_stock_level: minStockLevel ? Number(minStockLevel) : 5,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        attributes: finalAttributes,
      });

      Alert.alert('Success', 'Product updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Edit Product" showBack onBack={() => navigation.goBack()} />
        <Loader message="Loading product data..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Edit Product" showBack onBack={() => navigation.goBack()} />

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
            {storeTypeConfig.name} Product
          </Text>
          <Text style={[styles.storeTypeBannerSubtitle, { color: colors.textSecondary }]}>
            Store type is locked to your registered store. Only fields relevant to your business are displayed.
          </Text>
        </View>

        {/* 1. Core Product Information */}
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Core Information</Text>

          <Input
            label="Product Name *"
            value={name}
            onChangeText={setName}
            placeholder="Product name"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Selling Price ($) *"
                keyboardType="numeric"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Purchase Price ($)"
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
                keyboardType="numeric"
                value={mrp}
                onChangeText={setMrp}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Min Stock Alert"
                keyboardType="numeric"
                value={minStockLevel}
                onChangeText={setMinStockLevel}
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
                value={sku}
                onChangeText={setSku}
                placeholder="Product SKU"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Barcode / EAN"
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Scan or enter barcode"
              />
            </View>
          </View>

          <Input
            label="Image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://..."
          />

          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Product description"
          />
        </Card>

        {/* 2. DYNAMIC STORE-TYPE SPECIFIC FIELDS */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              2. {storeTypeConfig.name} Attributes
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

        {/* 3. Optional Custom Attributes */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
              3. Optional Custom Attributes
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
            Additional custom specifications or tags associated with this product.
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

        {/* Save Button */}
        <Button
          title="Save Changes"
          onPress={handleUpdate}
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
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 8,
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldHelpText: {
    fontSize: 11,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

export default EditProductScreen;
