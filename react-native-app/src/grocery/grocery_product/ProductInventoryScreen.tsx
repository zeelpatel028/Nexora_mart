import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '../grocery_components/hooks/useFocusEffect';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../grocery_components/hooks/useTheme';
import { productService, categoryService } from '../grocery_components/services';
import { Product, Category } from '../../api/types';
import AppHeader from '../grocery_components/components/layout/AppHeader';
import AppCard from '../grocery_components/components/common/AppCard';
import Badge from '../grocery_components/components/common/Badge';
import EmptyState from '../grocery_components/components/common/EmptyState';
import TableSkeleton from '../grocery_components/components/skeletons/TableSkeleton';
import {
  PackageIcon,
  SearchIcon,
  CloseIcon,
  PlusIcon,
  EditIcon,
  AlertTriangleIcon,
  FilterIcon,
} from '../grocery_components/components/branding/Icons';
import { formatCurrency, formatQuantity } from '../grocery_components/utils/formatters';

type ProductInventoryNavProp = NativeStackNavigationProp<RootStackParamList>;

export const ProductInventoryScreen: React.FC = () => {
  const navigation = useNavigation<ProductInventoryNavProp>();
  const route = useRoute<any>();
  const showBack = route.name === 'Inventory' || route.name === 'ProductList';
  const { colors, brandColors, isDark } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | undefined>(undefined);
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
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
          limit: 200,
        }),
        categoryService.getCategories(true).catch(() => []),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (err) {
      console.warn('Failed to load products and inventory:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCatId, search]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Filter products by low stock if toggle is active
  const displayedProducts = useMemo(() => {
    if (!onlyLowStock) return products;
    return products.filter((p) => {
      const curStock = p.inventory_record?.current_stock ?? p.current_stock ?? 0;
      const minStock = p.inventory_record?.minimum_stock ?? p.min_stock_level ?? 5;
      return curStock <= minStock;
    });
  }, [products, onlyLowStock]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const curStock = p.inventory_record?.current_stock ?? p.current_stock ?? 0;
      const minStock = p.inventory_record?.minimum_stock ?? p.min_stock_level ?? 5;
      return curStock <= minStock;
    }).length;
  }, [products]);

  const handleDeleteProduct = (productId: string | number, name: string) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${name}" from your catalog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(productId);
              setProducts((prev) => prev.filter((p) => p.id !== productId));
              Alert.alert('Success', 'Product deleted successfully.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete product.');
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const pName = item.product_name || item.name || 'Unnamed Product';
    const sp = item.pricing?.selling_price ?? item.selling_price ?? 0;
    const mrpVal = item.pricing?.mrp ?? item.mrp;
    const curStock = item.inventory_record?.current_stock ?? item.current_stock ?? 0;
    const minStock = item.inventory_record?.minimum_stock ?? item.min_stock_level ?? 5;
    const isOut = curStock <= 0;
    const isLowStock = curStock <= minStock && curStock > 0;
    const catName = item.category?.name || item.category_name || 'Retail';
    const unitSym = item.unit || 'pcs';

    return (
      <AppCard
        style={[
          styles.productCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: isLowStock ? brandColors.warning : colors.cardBorder,
          },
        ]}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.cardRow}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: isDark ? '#261C16' : brandColors.primaryLight },
              ]}
            >
              <PackageIcon size={24} color={brandColors.primary} />
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.productName, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {pName}
              </Text>
              <Badge label={catName} variant="neutral" style={{ marginLeft: 6 }} />
            </View>

            <Text style={[styles.skuText, { color: colors.textSecondary }]} numberOfLines={1}>
              SKU: {item.sku || 'N/A'}
              {item.barcode ? ` | ${item.barcode}` : ''}
              {typeof item.brand === 'object' && item.brand?.name
                ? ` | ${item.brand.name}`
                : typeof item.brand === 'string' && item.brand
                ? ` | ${item.brand}`
                : ''}
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

              <View style={styles.stockActionRow}>
                <Badge
                  label={
                    isOut
                      ? `Out of Stock (0)`
                      : isLowStock
                      ? `Low: ${formatQuantity(curStock, unitSym)}`
                      : `Stock: ${formatQuantity(curStock, unitSym)}`
                  }
                  variant={isOut ? 'danger' : isLowStock ? 'warning' : 'success'}
                />

                <TouchableOpacity
                  style={[
                    styles.editIconBtn,
                    {
                      backgroundColor: isDark ? '#261C16' : '#FFF3E0',
                      borderColor: brandColors.primary,
                    },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate('EditProduct', { productId: item.id });
                  }}
                  accessibilityLabel="Edit Product"
                >
                  <EditIcon size={14} color={brandColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Product & Inventory"
        showBack={showBack}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProduct', { categoryId: selectedCatId })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: brandColors.primaryOrange,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 10,
              gap: 4,
            }}
            activeOpacity={0.8}
          >
            <PlusIcon size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Add</Text>
          </TouchableOpacity>
        }
      />

      {/* 2. Search Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <SearchIcon size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Search products, SKU, or barcode..."
          placeholderTextColor={colors.textPlaceholder}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <CloseIcon size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* 3. Filter Chips: All, Low Stock Alert, & Categories */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {/* All Filter */}
          <TouchableOpacity
            onPress={() => {
              setSelectedCatId(undefined);
              setOnlyLowStock(false);
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedCatId === undefined && !onlyLowStock
                    ? brandColors.primary
                    : colors.cardBg,
                borderColor:
                  selectedCatId === undefined && !onlyLowStock
                    ? brandColors.primary
                    : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    selectedCatId === undefined && !onlyLowStock
                      ? '#FFFFFF'
                      : colors.textPrimary,
                  fontWeight: selectedCatId === undefined && !onlyLowStock ? '700' : '500',
                },
              ]}
            >
              All Products ({products.length})
            </Text>
          </TouchableOpacity>

          {/* Low Stock Filter */}
          <TouchableOpacity
            onPress={() => setOnlyLowStock((prev) => !prev)}
            style={[
              styles.filterChip,
              {
                backgroundColor: onlyLowStock ? '#EF4444' : colors.cardBg,
                borderColor: onlyLowStock ? '#EF4444' : colors.border,
              },
            ]}
          >
            <AlertTriangleIcon
              size={13}
              color={onlyLowStock ? '#FFFFFF' : '#EF4444'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                {
                  color: onlyLowStock ? '#FFFFFF' : colors.textPrimary,
                  fontWeight: onlyLowStock ? '700' : '500',
                },
              ]}
            >
              Low Stock ({lowStockCount})
            </Text>
          </TouchableOpacity>

          {/* Category Chips */}
          {categories.map((cat) => {
            const active = selectedCatId === cat.id && !onlyLowStock;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setSelectedCatId(cat.id);
                  setOnlyLowStock(false);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? brandColors.primary : colors.cardBg,
                    borderColor: active ? brandColors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: active ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: active ? '700' : '500',
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Product List */}
      {loading ? (
        <View style={{ padding: 14 }}>
          <TableSkeleton rows={6} />
        </View>
      ) : displayedProducts.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={36} color={brandColors.primary} />}
          title="No Products Found"
          description={
            onlyLowStock
              ? 'No items are currently below minimum stock level.'
              : search
              ? `No products match "${search}".`
              : 'Add your first product to begin tracking inventory.'
          }
          actionTitle="Add New Product"
          onAction={() => navigation.navigate('AddProduct', { categoryId: selectedCatId })}
        />
      ) : (
        <FlatList
          data={displayedProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[brandColors.primary]}
              tintColor={brandColors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productCard: {
    borderRadius: 14,
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
    borderRadius: 10,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  skuText: {
    fontSize: 12,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  mrpText: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  stockActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductInventoryScreen;
