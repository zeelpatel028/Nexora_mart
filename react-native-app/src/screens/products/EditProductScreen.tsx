import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../context/AuthContext';
import { productService, categoryService } from '../../services';
import { FormConfigResponse, Product } from '../../models/types';
import Header from '../../components/common/Header';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

type EditProductRouteProp = RouteProp<RootStackParamList, 'EditProduct'>;
type EditProductNavProp = NativeStackNavigationProp<RootStackParamList>;

export const EditProductScreen: React.FC = () => {
  const navigation = useNavigation<EditProductNavProp>();
  const route = useRoute<EditProductRouteProp>();
  const { productId } = route.params;
  const { colors, brandColors } = useTheme();

  // Dynamic Store Configuration & Existing Product state
  const [formConfig, setFormConfig] = useState<FormConfigResponse | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Section 1: Basic Information
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [unitSymbol, setUnitSymbol] = useState('pcs');
  const [hsnCode, setHsnCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  // Section 2: Pricing & Tax
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [taxType, setTaxType] = useState<'exclusive' | 'inclusive' | 'exempt'>('exclusive');
  const [gstRate, setGstRate] = useState<number>(18);

  // Section 3: Stock & Inventory
  const [openingStock, setOpeningStock] = useState('0');
  const [currentStock, setCurrentStock] = useState('0');
  const [minimumStock, setMinimumStock] = useState('5');
  const [maximumStock, setMaximumStock] = useState('1000');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [warehouseLocation, setWarehouseLocation] = useState('');

  // Section 4: Store-Specific Details
  const [storeDetails, setStoreDetails] = useState<Record<string, any>>({});

  // Section 5: Variants
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<
    Array<{
      variant_name: string;
      sku: string;
      barcode: string;
      selling_price: string;
      stock_quantity: string;
    }>
  >([]);

  // Section 6: Batches & Expiry
  const [hasBatches, setHasBatches] = useState(false);
  const [batchesList, setBatchesList] = useState<
    Array<{
      batch_number: string;
      manufacturing_date: string;
      expiry_date: string;
      current_quantity: string;
      mrp: string;
      purchase_price: string;
    }>
  >([]);

  // Section 7: Alerts & Notifications
  const [enableLowStockAlert, setEnableLowStockAlert] = useState(true);
  const [enableExpiryAlert, setEnableExpiryAlert] = useState(true);
  const [expiryWarningDays, setExpiryWarningDays] = useState(30);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  // Section 8: Additional Information
  const [status, setStatus] = useState('active');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Quick Inline Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [savingBrand, setSavingBrand] = useState(false);

  // Option Picker Modal for Select Fields
  const [activePickerField, setActivePickerField] = useState<{
    fieldName: string;
    label: string;
    options: string[];
  } | null>(null);

  // Load Existing Product & Form Configuration
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      setLoading(true);
      try {
        const [config, prod] = await Promise.all([
          productService.getFormConfig(),
          productService.getProduct(productId),
        ]);

        if (!isMounted) return;

        setFormConfig(config);
        setProduct(prod);

        // Section 1: Basic
        setProductName(prod.product_name || prod.name || '');
        setProductCode(prod.product_code || '');
        setSku(prod.sku || '');
        setBarcode(prod.barcode || '');
        setSelectedCatId(prod.category_id || (config.categories[0]?.id ?? null));
        setSelectedBrandId(prod.brand_id || null);
        setSelectedUnitId(prod.unit_id || (config.units[0]?.id ?? null));
        setUnitSymbol(prod.unit || 'pcs');
        setHsnCode(prod.hsn_code || '');
        setShortDescription(prod.short_description || '');
        setDescription(prod.description || '');

        // Section 2: Pricing
        const sp = prod.pricing?.selling_price ?? prod.selling_price ?? '';
        const pp = prod.pricing?.purchase_price ?? prod.purchase_price ?? '';
        const mrpVal = prod.pricing?.mrp ?? prod.mrp ?? '';
        const wsVal = prod.pricing?.wholesale_price ?? '';
        setSellingPrice(sp !== '' ? String(sp) : '');
        setPurchasePrice(pp !== '' ? String(pp) : '');
        setMrp(mrpVal !== '' && mrpVal !== null ? String(mrpVal) : '');
        setWholesalePrice(wsVal !== '' && wsVal !== null ? String(wsVal) : '');
        setTaxType(prod.pricing?.tax_type || 'exclusive');
        setGstRate(prod.pricing?.gst_rate !== undefined ? Number(prod.pricing.gst_rate) : 18);

        // Section 3: Stock
        const curStock = prod.inventory_record?.current_stock ?? prod.current_stock ?? 0;
        const opStock = prod.inventory_record?.opening_stock ?? 0;
        const minStock = prod.inventory_record?.minimum_stock ?? prod.min_stock_level ?? 5;
        const maxStock = prod.inventory_record?.maximum_stock ?? 1000;
        const reorder = prod.inventory_record?.reorder_level ?? 10;
        const whLoc = prod.inventory_record?.warehouse_location ?? '';
        setCurrentStock(String(curStock));
        setOpeningStock(String(opStock));
        setMinimumStock(String(minStock));
        setMaximumStock(String(maxStock));
        setReorderLevel(String(reorder));
        setWarehouseLocation(whLoc);

        // Section 4: Store Details
        const stCode = config.store_type?.code || 'grocery';
        const existingDetails =
          (prod as any)[`${stCode}_details`] ||
          prod.store_details ||
          prod.attributes ||
          {};
        const detailsMap: Record<string, any> = {};
        if (config.store_specific_fields) {
          config.store_specific_fields.forEach((f) => {
            if (existingDetails[f.name] !== undefined) {
              detailsMap[f.name] = existingDetails[f.name];
            } else if (f.default !== undefined) {
              detailsMap[f.name] =
                f.type === 'boolean'
                  ? f.default === 'true' || f.default === true
                  : f.default;
            } else {
              detailsMap[f.name] = f.type === 'boolean' ? false : '';
            }
          });
        }
        setStoreDetails(detailsMap);

        // Section 5: Variants
        if (prod.variants && prod.variants.length > 0) {
          setHasVariants(true);
          setVariantsList(
            prod.variants.map((v) => ({
              variant_name: v.variant_name || 'Variant',
              sku: v.sku || '',
              barcode: v.barcode || '',
              selling_price: String(v.selling_price ?? sp),
              stock_quantity: String(v.stock_quantity ?? v.stock ?? 0),
            }))
          );
        }

        // Section 6: Batches
        if (prod.batches && prod.batches.length > 0) {
          setHasBatches(true);
          setBatchesList(
            prod.batches.map((b) => ({
              batch_number: b.batch_number || '',
              manufacturing_date: b.manufacturing_date ? b.manufacturing_date.split('T')[0] : '',
              expiry_date: b.expiry_date ? b.expiry_date.split('T')[0] : '',
              current_quantity: String(b.current_quantity ?? 0),
              mrp: b.mrp !== undefined ? String(b.mrp) : '',
              purchase_price: b.purchase_price !== undefined ? String(b.purchase_price) : '',
            }))
          );
        }

        // Section 7: Alerts
        if (prod.alerts && prod.alerts.length > 0) {
          const lowStockAlert = prod.alerts.find((a) => a.alert_type === 'low_stock');
          if (lowStockAlert) {
            setEnableLowStockAlert(lowStockAlert.is_enabled);
            setNotifyEmail(Boolean(lowStockAlert.notify_email));
            setNotifySms(Boolean(lowStockAlert.notify_sms));
          }
          const expiryAlert = prod.alerts.find((a) => a.alert_type === 'expiring_soon');
          if (expiryAlert) {
            setEnableExpiryAlert(expiryAlert.is_enabled);
            if (expiryAlert.alert_days_before) {
              setExpiryWarningDays(expiryAlert.alert_days_before);
            }
          }
        }

        // Section 8: Media & Status
        setStatus(prod.status || (prod.is_active ? 'active' : 'inactive'));
        setIsFeatured(Boolean(prod.is_featured));
        setImageUrl(
          (prod as any).images && (prod as any).images.length > 0
            ? (prod as any).images[0].image_url
            : prod.image_url || ''
        );
      } catch (err: any) {
        Alert.alert('Load Error', err.message || 'Failed to retrieve product details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initData();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Real-time Profit & Tax Calculations
  const taxCalculations = useMemo(() => {
    const sp = parseFloat(sellingPrice) || 0;
    const pp = parseFloat(purchasePrice) || 0;
    const gst = parseFloat(String(gstRate)) || 0;

    let basePrice = sp;
    let taxAmount = 0;
    let finalCustomerPrice = sp;

    if (taxType === 'inclusive') {
      basePrice = gst > 0 ? sp / (1 + gst / 100) : sp;
      taxAmount = sp - basePrice;
      finalCustomerPrice = sp;
    } else if (taxType === 'exclusive') {
      basePrice = sp;
      taxAmount = (sp * gst) / 100;
      finalCustomerPrice = sp + taxAmount;
    } else {
      basePrice = sp;
      taxAmount = 0;
      finalCustomerPrice = sp;
    }

    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    const profit = sp - pp;
    const profitMargin = sp > 0 ? ((sp - pp) / sp) * 100 : 0;

    return {
      basePrice: basePrice.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      finalCustomerPrice: finalCustomerPrice.toFixed(2),
      profit: profit.toFixed(2),
      profitMargin: profitMargin.toFixed(1),
    };
  }, [sellingPrice, purchasePrice, gstRate, taxType]);

  const handleAutoGenerateSku = () => {
    const prefix = formConfig?.store?.code || 'SKU';
    const storeTypeCode = formConfig?.store_type?.code || 'GEN';
    const rand = Math.floor(1000 + Math.random() * 9000);
    const cleanName = (productName || 'PROD').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSku(`${prefix}-${storeTypeCode.substring(0, 3).toUpperCase()}-${cleanName}-${rand}`);
  };

  const handleGenerateBarcode = () => {
    const rand12 = '890' + Math.floor(100000000 + Math.random() * 900000000);
    setBarcode(rand12);
  };

  const handleDetailChange = (fieldName: string, value: any) => {
    setStoreDetails((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleAddVariant = () => {
    const nextIdx = variantsList.length + 1;
    setVariantsList((prev) => [
      ...prev,
      {
        variant_name: `Option ${nextIdx}`,
        sku: sku ? `${sku}-V${nextIdx}` : '',
        barcode: '',
        selling_price: sellingPrice || '',
        stock_quantity: '10',
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariantsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (index: number, field: string, value: string) => {
    setVariantsList((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const handleAddBatch = () => {
    const today = new Date().toISOString().split('T')[0];
    const exp = new Date();
    exp.setFullYear(exp.getFullYear() + 2);
    const expStr = exp.toISOString().split('T')[0];

    setBatchesList((prev) => [
      ...prev,
      {
        batch_number: `B-${Math.floor(10000 + Math.random() * 90000)}`,
        manufacturing_date: today,
        expiry_date: expStr,
        current_quantity: currentStock || '50',
        mrp: mrp || sellingPrice || '',
        purchase_price: purchasePrice || '',
      },
    ]);
  };

  const handleRemoveBatch = (index: number) => {
    setBatchesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBatch = (index: number, field: string, value: string) => {
    setBatchesList((prev) => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const created = await categoryService.createCategory({
        name: newCatName.trim(),
        code: newCatName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
        is_active: true,
      });
      if (created && created.id) {
        setFormConfig((prev: any) => ({
          ...prev,
          categories: [...(prev?.categories || []), created],
        }));
        setSelectedCatId(created.id);
        setNewCatName('');
        setShowCatModal(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create category.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const created = await productService.createBrand({
        name: newBrandName.trim(),
        code: newBrandName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
        is_active: true,
      });
      if (created && created.id) {
        setFormConfig((prev: any) => ({
          ...prev,
          brands: [...(prev?.brands || []), created],
        }));
        setSelectedBrandId(created.id);
        setNewBrandName('');
        setShowBrandModal(false);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create brand.');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      Alert.alert('Validation Error', 'Product Name is required.');
      return;
    }
    if (!sellingPrice || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid Selling Price.');
      return;
    }

    setSubmitting(true);
    try {
      const storeTypeCode = formConfig?.store_type?.code || 'grocery';
      const detailKey = `${storeTypeCode}_details`;

      const payload = {
        product_name: productName.trim(),
        name: productName.trim(),
        product_code: productCode.trim() || undefined,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        category_id: selectedCatId || undefined,
        brand_id: selectedBrandId || undefined,
        unit_id: selectedUnitId || undefined,
        unit: unitSymbol,
        hsn_code: hsnCode.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        status,
        is_active: status === 'active',
        is_featured: isFeatured,

        selling_price: parseFloat(sellingPrice) || 0,
        purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
        mrp: mrp !== '' ? parseFloat(mrp) : undefined,
        pricing: {
          purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
          selling_price: parseFloat(sellingPrice) || 0,
          mrp: mrp !== '' ? parseFloat(mrp) : undefined,
          wholesale_price: wholesalePrice !== '' ? parseFloat(wholesalePrice) : undefined,
          tax_type: taxType,
          gst_rate: parseFloat(String(gstRate)) || 0,
        },

        current_stock: parseFloat(currentStock) || 0,
        min_stock_level: parseFloat(minimumStock) || 0,
        inventory: {
          current_stock: parseFloat(currentStock) || 0,
          minimum_stock: parseFloat(minimumStock) || 0,
          maximum_stock: parseFloat(maximumStock) || 1000,
          reorder_level: parseFloat(reorderLevel) || 10,
          warehouse_location: warehouseLocation.trim() || undefined,
        },

        store_details: storeDetails,
        [detailKey]: storeDetails,
        image_url: imageUrl.trim() || undefined,
      };

      const result = await productService.updateProduct(productId, payload as any);
      Alert.alert(
        'Product Updated!',
        `"${result.product_name || result.name}" was successfully updated in your store.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Unable to update product.');
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

  const storeType = formConfig?.store_type;
  const storeInfo = formConfig?.store;
  const storeFields = formConfig?.store_specific_fields || [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={`Edit: ${productName || 'Product'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Store Context Badge */}
        <View
          style={[
            styles.storeBanner,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: brandColors.primary,
            },
          ]}
        >
          <View style={styles.storeBannerRow}>
            <View style={[styles.storeIconWrap, { backgroundColor: brandColors.primary }]}>
              <Text style={styles.storeIconText}>🏬</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={[styles.storeName, { color: colors.textPrimary }]}>
                  {storeInfo?.name || 'My Store'}
                </Text>
                <View style={[styles.pillBadge, { backgroundColor: brandColors.primary }]}>
                  <Text style={styles.pillBadgeText}>{storeType?.name || 'Retail'}</Text>
                </View>
              </View>
              <Text style={[styles.storeSub, { color: colors.textSecondary }]}>
                Editing product strictly isolated under your authorized store.
              </Text>
            </View>
          </View>
        </View>

        {/* Section Navigation Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navBar}>
          {[
            { id: 'all', label: 'All Sections' },
            { id: 'basic', label: '1. Basic' },
            { id: 'pricing', label: '2. Pricing' },
            { id: 'stock', label: '3. Stock' },
            { id: 'store', label: `4. ${storeType?.name || 'Store'} Details` },
            { id: 'additional', label: '5. Media & Status' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.navPill,
                {
                  backgroundColor: activeTab === tab.id ? brandColors.primary : colors.surface,
                  borderColor: activeTab === tab.id ? brandColors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.navPillText,
                  { color: activeTab === tab.id ? '#FFF' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ======================================================== */}
        {/* SECTION 1: BASIC INFORMATION                             */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'basic') && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumBadge, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.sectionNumText}>1</Text>
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Basic Information
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Product name, codes, brand and categorization.
                </Text>
              </View>
            </View>

            <Input
              label="Product Name *"
              value={productName}
              onChangeText={setProductName}
            />

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Product Code"
                  value={productCode}
                  onChangeText={setProductCode}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.labelActionRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>SKU</Text>
                  <TouchableOpacity onPress={handleAutoGenerateSku}>
                    <Text style={[styles.actionLink, { color: brandColors.primary }]}>⚡ Auto</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles.textInputStyle,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  value={sku}
                  onChangeText={setSku}
                />
              </View>
            </View>

            <View style={styles.labelActionRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Barcode</Text>
              <TouchableOpacity onPress={handleGenerateBarcode}>
                <Text style={[styles.actionLink, { color: brandColors.primary }]}>⚡ Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.textInputStyle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              value={barcode}
              onChangeText={setBarcode}
              keyboardType="number-pad"
            />

            {/* Category Selector */}
            <View style={styles.labelActionRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Category</Text>
              <TouchableOpacity onPress={() => setShowCatModal(true)}>
                <Text style={[styles.actionLink, { color: brandColors.primary }]}>+ New</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              {(formConfig?.categories || []).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedCatId === cat.id ? brandColors.primary : colors.surfaceSubtle,
                      borderColor:
                        selectedCatId === cat.id ? brandColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCatId(cat.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedCatId === cat.id ? '#FFF' : colors.textPrimary },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Brand Selector */}
            <View style={[styles.labelActionRow, { marginTop: 12 }]}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Brand</Text>
              <TouchableOpacity onPress={() => setShowBrandModal(true)}>
                <Text style={[styles.actionLink, { color: brandColors.primary }]}>+ New</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedBrandId === null ? brandColors.primary : colors.surfaceSubtle,
                    borderColor: selectedBrandId === null ? brandColors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedBrandId(null)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedBrandId === null ? '#FFF' : colors.textPrimary },
                  ]}
                >
                  Generic / None
                </Text>
              </TouchableOpacity>
              {(formConfig?.brands || []).map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedBrandId === b.id ? brandColors.primary : colors.surfaceSubtle,
                      borderColor:
                        selectedBrandId === b.id ? brandColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedBrandId(b.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedBrandId === b.id ? '#FFF' : colors.textPrimary },
                    ]}
                  >
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="GST HSN / SAC Code"
              value={hsnCode}
              onChangeText={setHsnCode}
              containerStyle={{ marginTop: 8 }}
            />

            <Input
              label="Short Summary"
              value={shortDescription}
              onChangeText={setShortDescription}
            />

            <Input
              label="Detailed Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </Card>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: PRICING & TAX                                 */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'pricing') && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumBadge, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.sectionNumText}>2</Text>
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Pricing & Tax Structure
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Purchase cost, retail selling price, MRP, and GST rate.
                </Text>
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Purchase Cost ₹"
                  value={purchasePrice}
                  onChangeText={setPurchasePrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Selling Price ₹ *"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Input
                  label="MRP ₹"
                  value={mrp}
                  onChangeText={setMrp}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Wholesale Rate ₹"
                  value={wholesalePrice}
                  onChangeText={setWholesalePrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 4 }]}>
              Tax Treatment
            </Text>
            <View style={styles.buttonGroup}>
              {(['exclusive', 'inclusive', 'exempt'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: taxType === t ? brandColors.primary : colors.surfaceSubtle,
                      borderColor: taxType === t ? brandColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setTaxType(t)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      { color: taxType === t ? '#FFF' : colors.textPrimary },
                    ]}
                  >
                    {t === 'exclusive' ? 'Exclusive' : t === 'inclusive' ? 'Inclusive' : 'Exempt'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {taxType !== 'exempt' && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12 }]}>
                  GST Rate (%)
                </Text>
                <View style={styles.buttonGroup}>
                  {[0, 5, 12, 18, 28].map((rate) => (
                    <TouchableOpacity
                      key={rate}
                      style={[
                        styles.toggleBtn,
                        {
                          backgroundColor:
                            gstRate === rate ? brandColors.primary : colors.surfaceSubtle,
                          borderColor: gstRate === rate ? brandColors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setGstRate(rate)}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          { color: gstRate === rate ? '#FFF' : colors.textPrimary },
                        ]}
                      >
                        {rate}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Live Calculation Preview */}
            <View style={[styles.summaryCard, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>
                📊 Live Margin & Tax Calculation
              </Text>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textSecondary }}>Base Price (excl. Tax):</Text>
                <Text style={[styles.boldVal, { color: colors.textPrimary }]}>
                  ₹ {taxCalculations.basePrice}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.textSecondary }}>Tax Amount:</Text>
                <Text style={[styles.boldVal, { color: brandColors.primary }]}>
                  ₹ {taxCalculations.taxAmount}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={[styles.boldVal, { color: colors.textPrimary, fontSize: 15 }]}>
                  Customer Billing Price:
                </Text>
                <Text style={[styles.boldVal, { color: brandColors.primary, fontSize: 16 }]}>
                  ₹ {taxCalculations.finalCustomerPrice}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: STOCK & INVENTORY                             */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'stock') && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumBadge, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.sectionNumText}>3</Text>
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Stock & Inventory Controls
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Current inventory level, low stock alerts, and shelf location.
                </Text>
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Current Stock on Hand"
                  value={currentStock}
                  onChangeText={setCurrentStock}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Low Stock Alert Level"
                  value={minimumStock}
                  onChangeText={setMinimumStock}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Input
              label="Warehouse / Rack Location"
              value={warehouseLocation}
              onChangeText={setWarehouseLocation}
            />
          </Card>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: STORE-SPECIFIC DETAILS                        */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'store') && (
          <Card style={[styles.sectionCard, { borderColor: brandColors.primary + '50' }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumBadge, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.sectionNumText}>4</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: brandColors.primary }]}>
                  {storeType?.name || 'Retail'} Specifications
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Tailored specifically for your store type.
                </Text>
              </View>
            </View>

            {storeFields.map((field) => {
              const val = storeDetails[field.name];

              if (field.type === 'boolean') {
                return (
                  <View
                    key={field.name}
                    style={[
                      styles.switchRow,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
                      {field.label}
                    </Text>
                    <Switch
                      value={Boolean(val)}
                      onValueChange={(checked) => handleDetailChange(field.name, checked)}
                      trackColor={{ false: colors.border, true: brandColors.primary }}
                    />
                  </View>
                );
              }

              if (field.type === 'select') {
                return (
                  <View key={field.name} style={{ marginBottom: 12 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {field.label}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.selectorBtn,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() =>
                        setActivePickerField({
                          fieldName: field.name,
                          label: field.label,
                          options: field.options || [],
                        })
                      }
                    >
                      <Text
                        style={{
                          color: val ? colors.textPrimary : colors.textPlaceholder,
                          fontSize: 15,
                        }}
                      >
                        {val || 'Select option...'}
                      </Text>
                      <Text style={{ color: colors.textSecondary }}>▼</Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <Input
                  key={field.name}
                  label={field.label}
                  value={val !== undefined ? String(val) : ''}
                  onChangeText={(text) => handleDetailChange(field.name, text)}
                  keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                  multiline={field.type === 'textarea'}
                  numberOfLines={field.type === 'textarea' ? 3 : 1}
                />
              );
            })}
          </Card>
        )}

        {/* ======================================================== */}
        {/* SECTION 5: ADDITIONAL MEDIA & STATUS                     */}
        {/* ======================================================== */}
        {(activeTab === 'all' || activeTab === 'additional') && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionNumBadge, { backgroundColor: brandColors.primary }]}>
                <Text style={styles.sectionNumText}>5</Text>
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Media & Status
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Product image, catalog status and featured display.
                </Text>
              </View>
            </View>

            <Input
              label="Product Image URL"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            {imageUrl.trim() ? (
              <View style={styles.imagePreviewWrap}>
                <Image
                  source={{ uri: imageUrl.trim() }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              </View>
            ) : null}

            <View
              style={[
                styles.switchRow,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border, marginTop: 8 },
              ]}
            >
              <View>
                <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>
                  ⭐ Featured Product
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Pin prominently on POS Quick Bill grid
                </Text>
              </View>
              <Switch
                value={isFeatured}
                onValueChange={setIsFeatured}
                trackColor={{ false: colors.border, true: brandColors.primary }}
              />
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 12 }]}>
              Catalog Status
            </Text>
            <View style={styles.buttonGroup}>
              {['active', 'inactive'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: status === st ? brandColors.primary : colors.surfaceSubtle,
                      borderColor: status === st ? brandColors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setStatus(st)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      { color: status === st ? '#FFF' : colors.textPrimary, textTransform: 'capitalize' },
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1 }}
          />
          <Button
            title={submitting ? 'Updating...' : '✓ Update Product'}
            variant="primary"
            onPress={handleSubmit}
            disabled={submitting}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>

      {/* QUICK CATEGORY MODAL */}
      <Modal visible={showCatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              + Add Store Category
            </Text>
            <Input
              placeholder="Category Name"
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowCatModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={savingCat ? 'Saving...' : 'Save Category'}
                variant="primary"
                onPress={handleCreateCategory}
                disabled={savingCat}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* QUICK BRAND MODAL */}
      <Modal visible={showBrandModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              + Add Store Brand
            </Text>
            <Input
              placeholder="Brand Name"
              value={newBrandName}
              onChangeText={setNewBrandName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowBrandModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={savingBrand ? 'Saving...' : 'Save Brand'}
                variant="primary"
                onPress={handleCreateBrand}
                disabled={savingBrand}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* DYNAMIC FIELD OPTION PICKER MODAL */}
      <Modal visible={Boolean(activePickerField)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, maxHeight: '70%' }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Select {activePickerField?.label}
            </Text>
            <ScrollView style={{ marginTop: 8, marginBottom: 16 }}>
              {(activePickerField?.options || []).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.pickerOption,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor:
                        storeDetails[activePickerField?.fieldName || ''] === opt
                          ? brandColors.primary + '15'
                          : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    if (activePickerField) {
                      handleDetailChange(activePickerField.fieldName, opt);
                    }
                    setActivePickerField(null);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      {
                        color:
                          storeDetails[activePickerField?.fieldName || ''] === opt
                            ? brandColors.primary
                            : colors.textPrimary,
                        fontWeight:
                          storeDetails[activePickerField?.fieldName || ''] === opt ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              title="Close"
              variant="outline"
              onPress={() => setActivePickerField(null)}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  storeBanner: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  storeBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeIconText: {
    fontSize: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pillBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  storeSub: {
    fontSize: 12,
    marginTop: 2,
  },
  navBar: {
    marginBottom: 14,
  },
  navPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  navPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  sectionNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionNumText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  labelActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionLink: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  textInputStyle: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  chipsScroll: {
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  summaryCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingTop: 6,
    marginTop: 4,
  },
  boldVal: {
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectorBtn: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imagePreviewWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  pickerOption: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: {
    fontSize: 15,
  },
});

export default EditProductScreen;
