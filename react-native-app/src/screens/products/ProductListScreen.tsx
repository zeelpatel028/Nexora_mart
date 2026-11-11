import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { productService, categoryService } from '../../services';
import { Product, Category } from '../../models/types';
import Header from '../../components/common/Header';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { PackageIcon } from '../../components/branding/Icons';
import { formatCurrency, formatQuantity } from '../../utils/formatters';

type ProductListNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<ProductListNavProp>();
  const { colors, brandColors } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([
        productService.getProducts({
          categoryId: selectedCatId,
          search: search.trim() || undefined,
          isActive: true,
        }),
        categoryService.getCategories(true).catch(() => []),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.warn('Failed to load products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCatId, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const pName = item.product_name || item.name;
    const sp = item.pricing?.selling_price ?? item.selling_price ?? 0;
    const mrpVal = item.pricing?.mrp ?? item.mrp;
    const curStock = item.inventory_record?.current_stock ?? item.current_stock ?? 0;
    const minStock = item.inventory_record?.minimum_stock ?? item.min_stock_level ?? 5;
    const isLowStock = curStock <= minStock && curStock > 0;
    const isOut = curStock <= 0;
    const catName = item.category?.name || item.category_name || 'Retail';
    const unitSym = item.unit || 'pcs';

    return (
      <Card
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.cardRow}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: brandColors.primaryLight }]}>
              <PackageIcon size={20} color={brandColors.primary} />
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
                {pName}
              </Text>
              <Badge
                label={catName}
                variant="neutral"
                style={{ marginLeft: 6 }}
              />
            </View>

            <Text style={[styles.skuText, { color: colors.textMuted }]}>
              SKU: {item.sku} {item.barcode ? `• Barcode: ${item.barcode}` : ''}
              {item.brand ? ` • 🏷️ ${item.brand.name}` : ''}
            </Text>

            <View style={styles.footerRow}>
              <View>
                <Text style={[styles.priceText, { color: brandColors.primary }]}>
                  {formatCurrency(sp)}
                </Text>
                {mrpVal ? (
                  <Text style={[styles.mrpText, { color: colors.textMuted }]}>
                    MRP: {formatCurrency(mrpVal)}
                  </Text>
                ) : null}
              </View>

              <View style={styles.stockBox}>
                <Badge
                  label={formatQuantity(curStock, unitSym)}
                  variant={isOut ? 'danger' : isLowStock ? 'warning' : 'success'}
                />
              </View>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Products Catalog"
        subtitle={`${products.length} products listed`}
        rightAction={{
          icon: '➕',
          onPress: () => navigation.navigate('AddProduct', { categoryId: selectedCatId }),
        }}
      />

      {/* Search Input */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search product by name, SKU, or barcode..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      {categories.length > 0 && (
        <View style={styles.catChipsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            <TouchableOpacity
              onPress={() => setSelectedCatId(undefined)}
              style={[
                styles.catChip,
                {
                  backgroundColor: selectedCatId === undefined ? brandColors.primary : colors.surface,
                  borderColor: selectedCatId === undefined ? brandColors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: selectedCatId === undefined ? '#FFFFFF' : colors.textPrimary, fontWeight: selectedCatId === undefined ? '700' : '500' },
                ]}
              >
                All Products
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const active = selectedCatId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCatId(cat.id)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? brandColors.primary : colors.surface,
                      borderColor: active ? brandColors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: active ? '#FFFFFF' : colors.textPrimary, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Product List */}
      {loading ? (
        <Loader message="Loading store products..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={32} color={brandColors.primary} />}
          title="No Products Found"
          description={search ? `No products match "${search}"` : 'Your store catalog is currently empty. Add your first retail product!'}
          actionTitle="Add New Product"
          onAction={() => navigation.navigate('AddProduct', { categoryId: selectedCatId })}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
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
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    padding: 0,
  },
  catChipsContainer: {
    paddingVertical: 10,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  productCard: {
    padding: 12,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imagePlaceholderText: {
    fontSize: 24,
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  skuText: {
    fontSize: 11,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
  },
  mrpText: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  stockBox: {
    alignItems: 'flex-end',
  },
});

export default ProductListScreen;
