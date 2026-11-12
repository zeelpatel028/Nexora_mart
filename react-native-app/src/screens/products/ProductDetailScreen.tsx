import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { productService } from '../../services';
import { Product } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type ProductDetailNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<ProductDetailNavProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;
  const { colors, brandColors } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      const p = await productService.getProduct(productId);
      setProduct(p);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleDelete = () => {
    Alert.alert(
      'Deactivate Product',
      `Are you sure you want to deactivate "${product?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await productService.deleteProduct(productId);
              Alert.alert('Success', 'Product has been deactivated.');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to deactivate product.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Product Details" showBack onBack={() => navigation.goBack()} />
        <Loader message="Loading specifications..." />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Product Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={{ color: colors.textPrimary, fontSize: 16 }}>Product not found.</Text>
        </View>
      </View>
    );
  }

  const isLowStock =
    (product.inventory_record?.current_stock ?? product.current_stock) <=
    (product.inventory_record?.minimum_stock ?? product.min_stock_level ?? 5);

  const productName = product.product_name || product.name;
  const sellingPrice = product.pricing?.selling_price ?? product.selling_price ?? 0;
  const purchasePrice = product.pricing?.purchase_price ?? product.purchase_price ?? 0;
  const mrpVal = product.pricing?.mrp ?? product.mrp;
  const currentStock = product.inventory_record?.current_stock ?? product.current_stock ?? 0;
  const unitSymbol = product.unit || 'pcs';

  // Helper to extract store-specific attributes
  const getStoreAttributes = (): [string, any][] => {
    const keys = [
      'grocery_details',
      'clothing_details',
      'medicine_details',
      'electronics_details',
      'plastic_details',
      'handloom_details',
      'furniture_details',
      'agro_details',
      'store_details',
      'attributes',
    ];
    for (const k of keys) {
      const obj = (product as any)[k];
      if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
        return Object.entries(obj).filter(
          ([attrKey, v]) =>
            v !== null &&
            v !== undefined &&
            v !== '' &&
            !['id', 'store_id', 'product_id', 'created_at', 'updated_at'].includes(attrKey)
        );
      }
    }
    return [];
  };

  const storeAttributes = getStoreAttributes();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={productName}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: '✏️',
          onPress: () => navigation.navigate('EditProduct', { productId: product.id }),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Media Card */}
        <Card style={styles.mediaCard}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.largePlaceholder, { backgroundColor: brandColors.primaryLight }]}>
              <Text style={{ fontSize: 64 }}>📦</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
              <Badge label={product.category?.name || product.category_name || 'Retail'} variant="primary" />
              {product.brand ? <Badge label={`🏷️ ${product.brand.name}`} variant="neutral" /> : null}
              <Badge
                label={product.is_active ? 'Active' : 'Inactive'}
                variant={product.is_active ? 'success' : 'danger'}
              />
              {product.is_featured ? <Badge label="⭐ Featured" variant="warning" /> : null}
            </View>

            <Text style={[styles.productTitle, { color: colors.textPrimary }]}>{productName}</Text>
            <Text style={[styles.skuCode, { color: colors.textMuted }]}>
              SKU: {product.sku} {product.barcode ? `• Barcode: ${product.barcode}` : ''}
            </Text>
          </View>
        </Card>

        {/* Pricing & Stock Card */}
        <Card>
          <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Pricing & Inventory</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Selling Price</Text>
              <Text style={[styles.infoValue, { color: brandColors.primary }]}>
                {formatCurrency(sellingPrice)}
              </Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Purchase Price</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {formatCurrency(purchasePrice)}
              </Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>MRP</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                {mrpVal ? formatCurrency(mrpVal) : '—'}
              </Text>
            </View>

            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Current Stock</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: currentStock <= 0 ? brandColors.error : isLowStock ? brandColors.warning : brandColors.success },
                ]}
              >
                {formatQuantity(currentStock, unitSymbol)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Dynamic Store Specifications */}
        {storeAttributes.length > 0 && (
          <Card>
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>
              Store Specifications ({product.category?.name || product.category_name || 'Retail'})
            </Text>
            <View style={styles.attributesList}>
              {storeAttributes.map(([key, value]) => (
                <View key={key} style={[styles.attributeRow, { borderBottomColor: colors.borderLight }]}>
                  <Text style={[styles.attrKey, { color: colors.textSecondary }]}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={[styles.attrVal, { color: colors.textPrimary }]}>
                    {typeof value === 'boolean' ? (value ? '✓ Yes' : '✕ No') : String(value)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Batches if applicable */}
        {product.batches && product.batches.length > 0 && (
          <Card>
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Active Batches</Text>
            {product.batches.map((b, i) => (
              <View key={i} style={[styles.attributeRow, { borderBottomColor: colors.borderLight }]}>
                <View>
                  <Text style={[styles.attrVal, { color: colors.textPrimary }]}>
                    {b.batch_number}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Mfg: {b.manufacturing_date ? b.manufacturing_date.split('T')[0] : 'N/A'} • Exp:{' '}
                    {b.expiry_date ? b.expiry_date.split('T')[0] : 'N/A'}
                  </Text>
                </View>
                <Text style={[styles.attrVal, { color: brandColors.primary }]}>
                  Qty: {b.current_quantity}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Product Variants (if applicable) */}
        {product.variants && product.variants.length > 0 && (
          <Card>
            <Text style={[styles.cardHeading, { color: colors.textPrimary }]}>Product Variants</Text>
            {product.variants.map((v, i) => (
              <View key={i} style={[styles.variantRow, { borderBottomColor: colors.borderLight }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.variantSku, { color: colors.textPrimary }]}>
                    {v.variant_name || v.sku}
                  </Text>
                  <Text style={[styles.variantAttr, { color: colors.textMuted }]}>
                    SKU: {v.sku}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.variantPrice, { color: brandColors.primary }]}>
                    {formatCurrency(v.selling_price ?? v.price ?? 0)}
                  </Text>
                  <Text style={[styles.variantStock, { color: colors.textSecondary }]}>
                    Stock: {v.stock_quantity ?? v.stock ?? 0}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Quick Inventory Actions */}
        <View style={styles.actionBtnRow}>
          <Button
            title="Adjust Stock"
            icon="⚖️"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('StockAdjustment', { productId: product.id })}
          />
        </View>

        {/* Deactivate Button */}
        <Button
          title="Deactivate Product"
          variant="danger"
          size="sm"
          loading={deleting}
          onPress={handleDelete}
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notFound: {
    padding: 40,
    alignItems: 'center',
  },
  mediaCard: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  largePlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    width: '100%',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  skuCode: {
    fontSize: 12,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoCol: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  attributesList: {},
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  attrKey: {
    fontSize: 13,
    fontWeight: '600',
  },
  attrVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  variantSku: {
    fontSize: 14,
    fontWeight: '700',
  },
  variantAttr: {
    fontSize: 12,
    marginTop: 2,
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  variantStock: {
    fontSize: 11,
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default ProductDetailScreen;

