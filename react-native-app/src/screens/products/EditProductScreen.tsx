import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
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
  const { colors } = useTheme();

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

        {dynamicFields.length > 0 && (
          <Card>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Category Specifications
            </Text>
            {dynamicFields.map((field) => (
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
  row: {
    flexDirection: 'row',
  },
});

export default EditProductScreen;

