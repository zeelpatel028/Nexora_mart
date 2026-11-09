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
import { productService, categoryService } from '../../services';
import { CategoryField } from '../../models/types';
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

  const storeTypeCode = store?.store_type?.code || (user as any)?.storeType || 'grocery';
  const storeTypeConfig = getStoreTypeConfig(storeTypeCode);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<CategoryField[]>([]);

  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('5');
  const [barcode, setBarcode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<Record<string, any>>({});

  const loadProduct = useCallback(async () => {
    try {
      const p = await productService.getProduct(productId);
      setName(p.name);
      setSellingPrice(String(p.selling_price));
      setPurchasePrice(p.purchase_price ? String(p.purchase_price) : '');
      setMrp(p.mrp ? String(p.mrp) : '');
      setMinStockLevel(String(p.min_stock_level || 5));
      setBarcode(p.barcode || '');
      setImageUrl(p.image_url || '');
      setDescription(p.description || '');
      setAttributes(p.attributes || {});

      if (p.category_id) {
        const fields = await categoryService.getCategoryFields(p.category_id);
        setDynamicFields(fields);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load product for editing.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Product name is required.');
      return;
    }
    if (!sellingPrice || isNaN(Number(sellingPrice))) {
      Alert.alert('Required Field', 'Valid selling price is required.');
      return;
    }

    // Validate store-type attributes
    const validation = storeTypeConfig.validate(attributes);
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
        min_stock_level: minStockLevel ? Number(minStockLevel) : 5,
        barcode: barcode.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
        attributes,
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
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Core Information</Text>

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

          <Input
            label="Barcode"
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Barcode / EAN"
          />

          <Input
            label="Image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://..."
          />
        </Card>

        {/* Store Type Specifications */}
        {storeTypeConfig.fields && storeTypeConfig.fields.length > 0 && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {storeTypeConfig.icon} {storeTypeConfig.name} Attributes
            </Text>
            {storeTypeConfig.fields.map((field: StoreTypeField) => {
              const val = attributes[field.fieldName];

              if (field.fieldType === 'boolean') {
                return (
                  <View key={field.fieldName} style={[styles.switchRow, { marginVertical: 8 }]}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                        {field.fieldLabel} {field.isRequired ? '*' : ''}
                      </Text>
                      {field.helpText ? (
                        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                          {field.helpText}
                        </Text>
                      ) : null}
                    </View>
                    <Switch
                      value={Boolean(val)}
                      onValueChange={(checked) =>
                        setAttributes((prev) => ({ ...prev, [field.fieldName]: String(checked) }))
                      }
                      trackColor={{ false: colors.border, true: brandColors.primaryLight }}
                      thumbColor={val ? brandColors.primary : '#F4F3F4'}
                    />
                  </View>
                );
              }

              if (field.fieldType === 'select' && field.options && field.options.length > 0) {
                return (
                  <View key={field.fieldName} style={{ marginBottom: 14 }}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>
                      {field.fieldLabel} {field.isRequired ? '*' : ''}
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                      {field.options.map((opt) => {
                        const isSelected = val === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            onPress={() =>
                              setAttributes((prev) => ({ ...prev, [field.fieldName]: opt }))
                            }
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
                  </View>
                );
              }

              return (
                <View key={field.fieldName} style={{ marginBottom: 12 }}>
                  <Input
                    label={`${field.fieldLabel} ${field.isRequired ? '*' : ''}`}
                    placeholder={field.placeholder || `Enter ${field.fieldLabel.toLowerCase()}`}
                    value={val !== undefined && val !== null ? String(val) : ''}
                    onChangeText={(text) =>
                      setAttributes((prev) => ({ ...prev, [field.fieldName]: text }))
                    }
                    keyboardType={field.fieldType === 'number' ? 'numeric' : 'default'}
                  />
                  {field.helpText ? (
                    <Text style={[styles.sectionSub, { color: colors.textSecondary, marginTop: -4, marginBottom: 8 }]}>
                      {field.helpText}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </Card>
        )}

        {dynamicFields.length > 0 && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Extra Category Specifications
            </Text>
            {dynamicFields
              .filter((f) => !storeTypeConfig.fields.some((stf) => stf.fieldName === f.field_name))
              .map((field) => (
                <Input
                  key={field.id}
                  label={field.label}
                  value={attributes[field.field_name] || ''}
                  onChangeText={(text) =>
                    setAttributes((prev) => ({ ...prev, [field.field_name]: text }))
                  }
                />
              ))}
          </Card>
        )}

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
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
});

export default EditProductScreen;

