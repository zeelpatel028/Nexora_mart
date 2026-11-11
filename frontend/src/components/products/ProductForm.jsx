import React, { useState, useEffect, useMemo } from 'react';
import { productService, categoryService } from '../../services';
import { Button } from '../common/Button';

export const ProductForm = ({
  initialProduct = null,
  initialCategoryId = null,
  onSuccess,
  onCancel
}) => {
  const isEditing = Boolean(initialProduct && initialProduct.id);

  // Form Configuration state loaded from authenticated store backend
  const [formConfig, setFormConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('all'); // 'all' or section id

  // Section 1: Basic Information
  const [productName, setProductName] = useState(initialProduct?.product_name || initialProduct?.name || '');
  const [productCode, setProductCode] = useState(initialProduct?.product_code || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || initialCategoryId || '');
  const [brandId, setBrandId] = useState(initialProduct?.brand_id || '');
  const [unitId, setUnitId] = useState(initialProduct?.unit_id || '');
  const [hsnCode, setHsnCode] = useState(initialProduct?.hsn_code || '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.short_description || '');
  const [description, setDescription] = useState(initialProduct?.description || '');

  // Section 2: Pricing & Tax
  const [purchasePrice, setPurchasePrice] = useState(
    initialProduct?.pricing?.purchase_price ?? initialProduct?.purchase_price ?? ''
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialProduct?.pricing?.selling_price ?? initialProduct?.selling_price ?? ''
  );
  const [mrp, setMrp] = useState(
    initialProduct?.pricing?.mrp ?? initialProduct?.mrp ?? ''
  );
  const [wholesalePrice, setWholesalePrice] = useState(
    initialProduct?.pricing?.wholesale_price ?? ''
  );
  const [taxType, setTaxType] = useState(
    initialProduct?.pricing?.tax_type || 'exclusive'
  );
  const [gstRate, setGstRate] = useState(
    initialProduct?.pricing?.gst_rate !== undefined && initialProduct?.pricing?.gst_rate !== null
      ? Number(initialProduct.pricing.gst_rate)
      : 18
  );

  // Section 3: Stock & Inventory
  const [openingStock, setOpeningStock] = useState(
    initialProduct?.inventory_record?.opening_stock ?? initialProduct?.initial_stock ?? 0
  );
  const [currentStock, setCurrentStock] = useState(
    initialProduct?.inventory_record?.current_stock ?? initialProduct?.current_stock ?? 0
  );
  const [minimumStock, setMinimumStock] = useState(
    initialProduct?.inventory_record?.minimum_stock ?? initialProduct?.min_stock_level ?? 5
  );
  const [maximumStock, setMaximumStock] = useState(
    initialProduct?.inventory_record?.maximum_stock ?? 1000
  );
  const [reorderLevel, setReorderLevel] = useState(
    initialProduct?.inventory_record?.reorder_level ?? 10
  );
  const [warehouseLocation, setWarehouseLocation] = useState(
    initialProduct?.inventory_record?.warehouse_location ?? ''
  );

  // Section 4: Store-Specific Details (Dynamically populated according to store type)
  const [storeDetails, setStoreDetails] = useState({});

  // Section 5: Variants
  const [hasVariants, setHasVariants] = useState(
    Boolean(initialProduct?.variants && initialProduct.variants.length > 0)
  );
  const [variantsList, setVariantsList] = useState(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants.map((v) => ({
          variant_name: v.variant_name || '',
          sku: v.sku || '',
          barcode: v.barcode || '',
          selling_price: v.selling_price ?? '',
          stock_quantity: v.stock_quantity ?? 0,
          is_active: v.is_active !== false
        }))
      : []
  );

  // Section 6: Batch & Expiry
  const [hasBatches, setHasBatches] = useState(
    Boolean(initialProduct?.batches && initialProduct.batches.length > 0)
  );
  const [batchesList, setBatchesList] = useState(
    initialProduct?.batches && initialProduct.batches.length > 0
      ? initialProduct.batches.map((b) => ({
          batch_number: b.batch_number || '',
          manufacturing_date: b.manufacturing_date ? b.manufacturing_date.split('T')[0] : '',
          expiry_date: b.expiry_date ? b.expiry_date.split('T')[0] : '',
          current_quantity: b.current_quantity ?? '',
          mrp: b.mrp ?? '',
          purchase_price: b.purchase_price ?? '',
          is_active: b.is_active !== false
        }))
      : []
  );

  // Section 7: Alerts & Notifications
  const [enableLowStockAlert, setEnableLowStockAlert] = useState(true);
  const [enableExpiryAlert, setEnableExpiryAlert] = useState(true);
  const [expiryWarningDays, setExpiryWarningDays] = useState(30);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);

  // Section 8: Additional Information
  const [status, setStatus] = useState(initialProduct?.status || 'active');
  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct?.is_featured));
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images[0].image_url
      : initialProduct?.image_url || ''
  );

  // Inline Quick Modals for Brand & Category creation
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [showQuickBrandModal, setShowQuickBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  // 1. Fetch Form Configuration on Component Mount
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setLoadingConfig(true);
      try {
        const config = await productService.getFormConfig();
        if (isMounted && config) {
          setFormConfig(config);

          // Pre-select defaults from configuration if not already set
          if (!categoryId && config.categories && config.categories.length > 0) {
            setCategoryId(config.categories[0].id);
          }
          if (!unitId && config.units && config.units.length > 0) {
            setUnitId(config.units[0].id);
          }

          // Enable variant / batch toggles based on store capabilities
          if (!isEditing) {
            if (config.store_type?.has_variants) {
              setHasVariants(true);
            }
            if (config.store_type?.has_batches) {
              setHasBatches(true);
            }
          }

          // Initialize store-specific fields with existing values or defaults
          const initialDetails = {};
          const storeTypeCode = config.store_type?.code || 'grocery';
          const existingDetailsObj =
            initialProduct?.[`${storeTypeCode}_details`] ||
            initialProduct?.store_details ||
            initialProduct?.attributes ||
            {};

          if (config.store_specific_fields) {
            config.store_specific_fields.forEach((field) => {
              if (existingDetailsObj[field.name] !== undefined) {
                initialDetails[field.name] = existingDetailsObj[field.name];
              } else if (field.default !== undefined) {
                initialDetails[field.name] =
                  field.type === 'boolean'
                    ? field.default === 'true' || field.default === true
                    : field.default;
              } else {
                initialDetails[field.name] = field.type === 'boolean' ? false : '';
              }
            });
          }
          setStoreDetails(initialDetails);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load store configuration. Please check your network.');
        }
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    }

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [isEditing]);

  // Tax and Margin Calculations
  const taxCalculations = useMemo(() => {
    const sp = parseFloat(sellingPrice) || 0;
    const pp = parseFloat(purchasePrice) || 0;
    const gst = parseFloat(gstRate) || 0;

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
      // exempt
      basePrice = sp;
      taxAmount = 0;
      finalCustomerPrice = sp;
    }

    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    const igst = taxAmount;

    let profit = sp - pp;
    let profitMargin = sp > 0 ? ((sp - pp) / sp) * 100 : 0;

    return {
      basePrice: basePrice.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      finalCustomerPrice: finalCustomerPrice.toFixed(2),
      profit: profit.toFixed(2),
      profitMargin: profitMargin.toFixed(1)
    };
  }, [sellingPrice, purchasePrice, gstRate, taxType]);

  // Auto-generate SKU
  const handleGenerateSku = () => {
    const prefix = formConfig?.store?.code || 'SKU';
    const storeTypeCode = formConfig?.store_type?.code || 'GEN';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cleanName = (productName || 'PROD').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSku(`${prefix}-${storeTypeCode.substring(0, 3).toUpperCase()}-${cleanName}-${randomSuffix}`);
  };

  // Auto-generate Barcode (EAN-13 style 13 digits)
  const handleGenerateBarcode = () => {
    const random12 = '890' + Math.floor(100000000 + Math.random() * 900000000);
    setBarcode(random12);
  };

  // Store-Specific Field Change Handler
  const handleStoreDetailChange = (fieldName, value) => {
    setStoreDetails((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Add Variant Row
  const handleAddVariantRow = () => {
    const suffix = variantsList.length + 1;
    setVariantsList([
      ...variantsList,
      {
        variant_name: `Variant ${suffix}`,
        sku: sku ? `${sku}-V${suffix}` : '',
        barcode: '',
        selling_price: sellingPrice || '',
        stock_quantity: 10,
        is_active: true
      }
    ]);
  };

  // Remove Variant Row
  const handleRemoveVariantRow = (index) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  // Update Variant Row
  const handleUpdateVariantRow = (index, field, value) => {
    const updated = [...variantsList];
    updated[index][field] = value;
    setVariantsList(updated);
  };

  // Add Batch Row
  const handleAddBatchRow = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 2);
    const expStr = expDate.toISOString().split('T')[0];

    setBatchesList([
      ...batchesList,
      {
        batch_number: `B-${Math.floor(10000 + Math.random() * 90000)}`,
        manufacturing_date: dateStr,
        expiry_date: expStr,
        current_quantity: currentStock || 50,
        mrp: mrp || sellingPrice || '',
        purchase_price: purchasePrice || '',
        is_active: true
      }
    ]);
  };

  // Remove Batch Row
  const handleRemoveBatchRow = (index) => {
    setBatchesList(batchesList.filter((_, i) => i !== index));
  };

  // Update Batch Row
  const handleUpdateBatchRow = (index, field, value) => {
    const updated = [...batchesList];
    updated[index][field] = value;
    setBatchesList(updated);
  };

  // Create Quick Category
  const handleCreateQuickCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await categoryService.createCategory({
        name: newCategoryName.trim(),
        code: newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
        is_active: true
      });
      // Append to formConfig categories
      if (res && res.id) {
        setFormConfig((prev) => ({
          ...prev,
          categories: [...(prev.categories || []), res]
        }));
        setCategoryId(res.id);
        setNewCategoryName('');
        setShowQuickCategoryModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Create Quick Brand
  const handleCreateQuickBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setCreatingBrand(true);
    try {
      const res = await productService.createBrand({
        name: newBrandName.trim(),
        code: newBrandName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
        is_active: true
      });
      if (res && res.id) {
        setFormConfig((prev) => ({
          ...prev,
          brands: [...(prev.brands || []), res]
        }));
        setBrandId(res.id);
        setNewBrandName('');
        setShowQuickBrandModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create brand');
    } finally {
      setCreatingBrand(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validations
    if (!productName.trim()) {
      setErrorMessage('Product Name is required.');
      return;
    }
    if (sellingPrice === '' || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      setErrorMessage('A valid Selling Price is required.');
      return;
    }

    setSubmitting(true);

    try {
      const storeTypeCode = formConfig?.store_type?.code || 'grocery';
      const detailKey = `${storeTypeCode}_details`;

      // Build payload matching backend schemas
      const payload = {
        // Section 1: Basic
        product_name: productName.trim(),
        product_code: productCode.trim() || undefined,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        brand_id: brandId ? Number(brandId) : undefined,
        unit_id: unitId ? Number(unitId) : undefined,
        hsn_code: hsnCode.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        product_type: hasVariants && variantsList.length > 0 ? 'variable' : 'simple',
        status: status || 'active',
        is_featured: Boolean(isFeatured),

        // Section 2: Pricing
        selling_price: parseFloat(sellingPrice) || 0,
        purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
        mrp: mrp !== '' ? parseFloat(mrp) : undefined,
        pricing: {
          purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
          selling_price: parseFloat(sellingPrice) || 0,
          mrp: mrp !== '' ? parseFloat(mrp) : undefined,
          wholesale_price: wholesalePrice !== '' ? parseFloat(wholesalePrice) : undefined,
          tax_type: taxType,
          gst_rate: parseFloat(gstRate) || 0
        },

        // Section 3: Inventory
        initial_stock: parseFloat(currentStock) || 0,
        current_stock: parseFloat(currentStock) || 0,
        min_stock_level: parseFloat(minimumStock) || 0,
        inventory: {
          opening_stock: parseFloat(openingStock) || 0,
          current_stock: parseFloat(currentStock) || 0,
          minimum_stock: parseFloat(minimumStock) || 0,
          maximum_stock: parseFloat(maximumStock) || 1000,
          reorder_level: parseFloat(reorderLevel) || 10,
          warehouse_location: warehouseLocation.trim() || undefined
        },

        // Section 4: Store Specific Details
        store_details: storeDetails,
        [detailKey]: storeDetails,

        // Section 5: Variants
        variants:
          hasVariants && variantsList.length > 0
            ? variantsList.map((v) => ({
                variant_name: v.variant_name || 'Standard Variant',
                sku: v.sku.trim() || undefined,
                barcode: v.barcode.trim() || undefined,
                purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
                selling_price: v.selling_price !== '' ? parseFloat(v.selling_price) : parseFloat(sellingPrice) || 0,
                mrp: mrp !== '' ? parseFloat(mrp) : undefined,
                stock_quantity: parseFloat(v.stock_quantity) || 0,
                is_active: v.is_active !== false
              }))
            : [],

        // Section 6: Batches
        batches:
          hasBatches && batchesList.length > 0
            ? batchesList.map((b) => ({
                batch_number: b.batch_number.trim(),
                manufacturing_date: b.manufacturing_date || undefined,
                expiry_date: b.expiry_date || undefined,
                purchase_price: b.purchase_price !== '' ? parseFloat(b.purchase_price) : 0,
                selling_price: parseFloat(sellingPrice) || 0,
                mrp: b.mrp !== '' ? parseFloat(b.mrp) : undefined,
                initial_quantity: parseFloat(b.current_quantity) || 0,
                current_quantity: parseFloat(b.current_quantity) || 0,
                is_active: b.is_active !== false
              }))
            : [],

        // Section 7: Alerts
        alerts: [
          ...(enableLowStockAlert
            ? [
                {
                  alert_type: 'low_stock',
                  threshold_value: parseFloat(minimumStock) || 5,
                  is_enabled: true,
                  notify_email: notifyEmail,
                  notify_sms: notifySms
                }
              ]
            : []),
          ...(enableExpiryAlert && (hasBatches || storeTypeCode === 'grocery' || storeTypeCode === 'medical' || storeTypeCode === 'agro')
            ? [
                {
                  alert_type: 'expiring_soon',
                  alert_days_before: parseInt(expiryWarningDays, 10) || 30,
                  is_enabled: true,
                  notify_email: notifyEmail,
                  notify_sms: notifySms
                }
              ]
            : [])
        ],

        // Section 8: Images
        images: imageUrl.trim() ? [{ image_url: imageUrl.trim(), is_primary: true }] : []
      };

      let result;
      if (isEditing) {
        result = await productService.updateProduct(initialProduct.id, payload);
        setSuccessMessage(`Product "${result.product_name || result.name}" updated successfully!`);
      } else {
        result = await productService.createProduct(payload);
        setSuccessMessage(`Product "${result.product_name || result.name}" created successfully under your store!`);
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(result), 800);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save product. Please verify fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="fw-bold text-dark">Initializing Dynamic Store Configuration...</h5>
        <p className="text-muted small">
          Detecting store membership, role permissions, and customized retail attributes.
        </p>
      </div>
    );
  }

  const storeInfo = formConfig?.store;
  const storeType = formConfig?.store_type;
  const storeFields = formConfig?.store_specific_fields || [];

  return (
    <div className="dynamic-product-form">
      {/* 🏢 Store Verification Banner */}
      <div className="card border-0 bg-primary bg-opacity-10 rounded-4 mb-4 shadow-sm">
        <div className="card-body p-3 p-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                style={{ width: '52px', height: '52px', fontSize: '24px' }}
              >
                {storeType?.code === 'clothing'
                  ? '👗'
                  : storeType?.code === 'medical'
                  ? '💊'
                  : storeType?.code === 'mobile_electronics' || storeType?.code === 'electronics'
                  ? '📱'
                  : storeType?.code === 'plastic'
                  ? '🧪'
                  : storeType?.code === 'handloom'
                  ? '🧵'
                  : storeType?.code === 'furniture'
                  ? '🛋️'
                  : storeType?.code === 'agro'
                  ? '🌾'
                  : '🛒'}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h5 className="fw-bold text-dark mb-0">{storeInfo?.name || 'Authorized Store'}</h5>
                  <span className="badge bg-primary px-3 py-1 rounded-pill">
                    {storeType?.name || 'Retail Store'}
                  </span>
                  <span className="badge bg-white text-secondary border px-2 py-1 font-monospace small">
                    {storeInfo?.code || 'STORE-01'}
                  </span>
                </div>
                <p className="text-muted small mb-0 mt-1">
                  Tenant Isolation Verified • Form automatically displays specifications customized for{' '}
                  <strong>{storeType?.name}</strong>.
                </p>
              </div>
            </div>

            <div className="text-md-end">
              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small">
                ✓ Multi-Store Security Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm py-3 mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <strong>Validation Error:</strong> {errorMessage}
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 shadow-sm py-3 mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '20px' }}>✓</span>
            <div>
              <strong>Success:</strong> {successMessage}
            </div>
          </div>
        </div>
      )}

      {/* Section Jump Pills */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
        {[
          { id: 'all', label: '📄 All Sections' },
          { id: 'sec-basic', label: '1. Basic Information' },
          { id: 'sec-pricing', label: '2. Pricing & Tax' },
          { id: 'sec-stock', label: '3. Stock & Inventory' },
          { id: 'sec-store', label: `4. ${storeType?.name || 'Store'} Details` },
          { id: 'sec-variants', label: '5. Variants' },
          { id: 'sec-batches', label: '6. Batch & Expiry' },
          { id: 'sec-alerts', label: '7. Alerts & Notifications' },
          { id: 'sec-additional', label: '8. Additional Info' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn btn-sm text-nowrap rounded-pill ${
              activeSection === tab.id ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
            }`}
            onClick={() => {
              setActiveSection(tab.id);
              if (tab.id !== 'all') {
                document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* FORM START */}
      <form onSubmit={handleSubmit}>
        {/* ======================================================== */}
        {/* SECTION 1: BASIC INFORMATION                             */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-basic') && (
          <div id="sec-basic" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  1
                </span>
                Basic Information
              </h5>
              <small className="text-muted">Universal product identification, barcodes, brand, and classification.</small>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {/* Product Name */}
                <div className="col-12 col-md-8">
                  <label className="form-label fw-bold small text-dark">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="e.g. Aashirvaad Superior MP Atta, Cotton Slim Shirt, Paracetamol 500mg"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                </div>

                {/* Product Code */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-bold small text-dark">Product Code / Model Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. PRD-1002"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                  />
                </div>

                {/* SKU */}
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label fw-bold small text-dark mb-1">
                      SKU (Stock Keeping Unit)
                    </label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                      onClick={handleGenerateSku}
                    >
                      ⚡ Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="e.g. AASH-ATTA-5KG"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Guaranteed unique within your store. Other stores can use identical SKU independently.
                  </small>
                </div>

                {/* Barcode */}
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label fw-bold small text-dark mb-1">Barcode / EAN-13 / UPC</label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                      onClick={handleGenerateBarcode}
                    >
                      ⚡ Generate Barcode
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    placeholder="e.g. 8901030012345"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="col-12 col-md-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label fw-bold small text-dark mb-1">Category</label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                      onClick={() => setShowQuickCategoryModal(true)}
                    >
                      + New
                    </button>
                  </div>
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category...</option>
                    {(formConfig?.categories || []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div className="col-12 col-md-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label fw-bold small text-dark mb-1">Brand</label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                      onClick={() => setShowQuickBrandModal(true)}
                    >
                      + New
                    </button>
                  </div>
                  <select
                    className="form-select"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">No Brand / Generic</option>
                    {(formConfig?.brands || []).map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-bold small text-dark">Primary Unit of Measurement</label>
                  <select
                    className="form-select"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                  >
                    {(formConfig?.units || []).map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* HSN Code */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-bold small text-dark">GST HSN / SAC Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 1001, 6109, 3004"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                  />
                </div>

                {/* Short Description */}
                <div className="col-12 col-md-8">
                  <label className="form-label fw-bold small text-dark">Short Tagline / Summary</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="1-line summary displayed on POS and receipt bill"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                </div>

                {/* Detailed Description */}
                <div className="col-12">
                  <label className="form-label fw-bold small text-dark">Detailed Product Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Full product overview, features, usage and specifications..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 2: PRICING & TAX                                 */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-pricing') && (
          <div id="sec-pricing" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  2
                </span>
                Pricing & Tax Structure
              </h5>
              <small className="text-muted">Purchase cost, retail selling price, MRP, and GST tax treatment.</small>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-12 col-lg-8">
                  <div className="row g-3">
                    {/* Purchase Price */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold small text-dark">
                        Purchase Price (Cost) ₹
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="0.00"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Selling Price */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold small text-dark">
                        Retail Selling Price ₹ <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white fw-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control form-control-lg fw-bold"
                          placeholder="0.00"
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* MRP */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold small text-dark">Maximum Retail Price (MRP) ₹</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="Printed packet MRP"
                          value={mrp}
                          onChange={(e) => setMrp(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Wholesale Price */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold small text-dark">Wholesale / Bulk Price ₹</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          placeholder="Optional B2B rate"
                          value={wholesalePrice}
                          onChange={(e) => setWholesalePrice(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Tax Type */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold small text-dark">Tax Treatment</label>
                      <select
                        className="form-select"
                        value={taxType}
                        onChange={(e) => setTaxType(e.target.value)}
                      >
                        <option value="exclusive">Tax Exclusive (Tax added on top)</option>
                        <option value="inclusive">Tax Inclusive (Selling price includes tax)</option>
                        <option value="exempt">GST Exempt (0% Tax)</option>
                      </select>
                    </div>

                    {/* GST Rate */}
                    <div className="col-12 col-sm-6">
                      <label className="form-label fw-bold small text-dark">GST Rate (%)</label>
                      <select
                        className="form-select"
                        value={gstRate}
                        onChange={(e) => setGstRate(Number(e.target.value))}
                        disabled={taxType === 'exempt'}
                      >
                        <option value="0">0% (Nil Rated / Exempt)</option>
                        <option value="5">5% (Essential Food / Garments &lt; ₹1000)</option>
                        <option value="12">12% (Standard Goods / Packaged Food)</option>
                        <option value="18">18% (Electronics, Plastics, General)</option>
                        <option value="28">28% (Luxury / High-End Electronics)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tax & Margin Live Preview Card */}
                <div className="col-12 col-lg-4">
                  <div className="bg-light rounded-4 p-3 border h-100 d-flex flex-column justify-content-between">
                    <div>
                      <h6 className="fw-bold text-dark mb-3">📊 Live Profit & Tax Preview</h6>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span className="text-muted">Base Price (excl. Tax):</span>
                        <span className="fw-bold">₹ {taxCalculations.basePrice}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span className="text-muted">GST Rate Applied:</span>
                        <span className="badge bg-secondary">{taxType === 'exempt' ? '0% Exempt' : `${gstRate}%`}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span className="text-muted">CGST ({(gstRate / 2).toFixed(1)}%):</span>
                        <span>₹ {taxCalculations.cgst}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span className="text-muted">SGST ({(gstRate / 2).toFixed(1)}%):</span>
                        <span>₹ {taxCalculations.sgst}</span>
                      </div>
                      <div className="d-flex justify-content-between py-1 border-bottom small">
                        <span className="text-muted">Total Tax Amount:</span>
                        <span className="text-primary fw-bold">₹ {taxCalculations.taxAmount}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="fw-bold text-dark">Customer Billing Price:</span>
                        <span className="fw-bold text-primary fs-5">₹ {taxCalculations.finalCustomerPrice}</span>
                      </div>
                    </div>

                    <div className="mt-3 p-2 rounded-3 bg-white border">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Estimated Margin:</span>
                        <span
                          className={`badge ${
                            parseFloat(taxCalculations.profitMargin) >= 15
                              ? 'bg-success'
                              : parseFloat(taxCalculations.profitMargin) > 0
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                        >
                          {taxCalculations.profitMargin}% (₹ {taxCalculations.profit})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: STOCK & INVENTORY                             */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-stock') && (
          <div id="sec-stock" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  3
                </span>
                Stock & Inventory Controls
              </h5>
              <small className="text-muted">Current quantity, reorder alerts, and warehouse shelf assignment.</small>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {/* Opening Stock */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label fw-bold small text-dark">Opening Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={openingStock}
                    onChange={(e) => setOpeningStock(e.target.value)}
                  />
                </div>

                {/* Current Stock */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label fw-bold small text-dark">
                    Current Stock On Hand
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-lg fw-bold text-success"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                  />
                </div>

                {/* Minimum Stock Alert */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label fw-bold small text-dark">
                    Minimum Stock Alert Level
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(e.target.value)}
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Alerts trigger when stock falls below this quantity.
                  </small>
                </div>

                {/* Maximum Stock */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label fw-bold small text-dark">Maximum Stock Capacity</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={maximumStock}
                    onChange={(e) => setMaximumStock(e.target.value)}
                  />
                </div>

                {/* Reorder Level */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label fw-bold small text-dark">Auto Reorder Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                  />
                </div>

                {/* Warehouse Location */}
                <div className="col-12 col-sm-6 col-md-4">
                  <label className="form-label fw-bold small text-dark">Warehouse / Rack Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Aisle 3, Shelf B-4"
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 4: STORE-SPECIFIC DETAILS                        */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-store') && (
          <div id="sec-store" className="card border border-primary border-opacity-25 rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-primary bg-opacity-10 border-bottom py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    4
                  </span>
                  {storeType?.name || 'Retail'} Specific Details
                </h5>
                <span className="badge bg-white text-primary border border-primary-subtle px-3 py-1 rounded-pill small">
                  Tailored for {storeType?.name}
                </span>
              </div>
              <small className="text-muted">
                Fields shown here are strictly customized for your registered store type.
              </small>
            </div>
            <div className="card-body p-4">
              {storeFields.length === 0 ? (
                <div className="text-muted small py-3">No custom fields defined for this store type.</div>
              ) : (
                <div className="row g-3">
                  {storeFields.map((field) => {
                    const fieldValue = storeDetails[field.name] !== undefined ? storeDetails[field.name] : '';

                    if (field.type === 'select') {
                      return (
                        <div key={field.name} className="col-12 col-md-6 col-lg-4">
                          <label className="form-label fw-bold small text-dark">
                            {field.label} {field.required && <span className="text-danger">*</span>}
                          </label>
                          <select
                            className="form-select"
                            value={fieldValue}
                            onChange={(e) => handleStoreDetailChange(field.name, e.target.value)}
                            required={field.required}
                          >
                            <option value="">Choose option...</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    if (field.type === 'boolean') {
                      return (
                        <div key={field.name} className="col-12 col-md-6 col-lg-4 d-flex align-items-center pt-md-4">
                          <div className="form-check form-switch p-2 bg-light rounded-3 border w-100">
                            <input
                              className="form-check-input ms-0 me-3"
                              type="checkbox"
                              role="switch"
                              id={`switch-${field.name}`}
                              checked={Boolean(fieldValue)}
                              onChange={(e) => handleStoreDetailChange(field.name, e.target.checked)}
                            />
                            <label className="form-check-label fw-bold small text-dark cursor-pointer" htmlFor={`switch-${field.name}`}>
                              {field.label}
                            </label>
                          </div>
                        </div>
                      );
                    }

                    if (field.type === 'date') {
                      return (
                        <div key={field.name} className="col-12 col-md-6 col-lg-4">
                          <label className="form-label fw-bold small text-dark">
                            {field.label} {field.required && <span className="text-danger">*</span>}
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={fieldValue ? fieldValue.toString().split('T')[0] : ''}
                            onChange={(e) => handleStoreDetailChange(field.name, e.target.value)}
                            required={field.required}
                          />
                        </div>
                      );
                    }

                    if (field.type === 'textarea') {
                      return (
                        <div key={field.name} className="col-12">
                          <label className="form-label fw-bold small text-dark">
                            {field.label} {field.required && <span className="text-danger">*</span>}
                          </label>
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder={field.placeholder || ''}
                            value={fieldValue}
                            onChange={(e) => handleStoreDetailChange(field.name, e.target.value)}
                            required={field.required}
                          ></textarea>
                        </div>
                      );
                    }

                    // Default text or number
                    return (
                      <div key={field.name} className="col-12 col-md-6 col-lg-4">
                        <label className="form-label fw-bold small text-dark">
                          {field.label} {field.required && <span className="text-danger">*</span>}
                        </label>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          className="form-control"
                          placeholder={field.placeholder || ''}
                          value={fieldValue}
                          onChange={(e) => handleStoreDetailChange(field.name, e.target.value)}
                          required={field.required}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 5: VARIANTS                                      */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-variants') && (
          <div id="sec-variants" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    5
                  </span>
                  Product Variants (Size, Color, Model Options)
                </h5>
                <small className="text-muted">Manage multi-variant SKU options with dedicated pricing and stock.</small>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  role="switch"
                  id="toggleVariants"
                  checked={hasVariants}
                  onChange={(e) => {
                    setHasVariants(e.target.checked);
                    if (e.target.checked && variantsList.length === 0) {
                      handleAddVariantRow();
                    }
                  }}
                />
                <label className="form-check-label fw-bold small cursor-pointer" htmlFor="toggleVariants">
                  {hasVariants ? 'Variants Enabled' : 'Single Product'}
                </label>
              </div>
            </div>

            {hasVariants && (
              <div className="card-body p-4">
                <div className="table-responsive mb-3">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light small">
                      <tr>
                        <th>Variant Option (Size/Color)</th>
                        <th>Variant SKU</th>
                        <th>Barcode</th>
                        <th style={{ width: '130px' }}>Price (₹)</th>
                        <th style={{ width: '110px' }}>Stock</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantsList.map((v, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="e.g. Size L / Navy Blue"
                              value={v.variant_name}
                              onChange={(e) => handleUpdateVariantRow(idx, 'variant_name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm font-monospace"
                              placeholder="SKU-L-BLU"
                              value={v.sku}
                              onChange={(e) => handleUpdateVariantRow(idx, 'sku', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm font-monospace"
                              placeholder="Barcode"
                              value={v.barcode}
                              onChange={(e) => handleUpdateVariantRow(idx, 'barcode', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={v.selling_price}
                              onChange={(e) => handleUpdateVariantRow(idx, 'selling_price', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={v.stock_quantity}
                              onChange={(e) => handleUpdateVariantRow(idx, 'stock_quantity', e.target.value)}
                            />
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => handleRemoveVariantRow(idx)}
                              title="Delete Variant"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  onClick={handleAddVariantRow}
                >
                  + Add Variant Option
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 6: BATCH & EXPIRY                                */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-batches') && (
          <div id="sec-batches" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    6
                  </span>
                  Batch & Expiry Management
                </h5>
                <small className="text-muted">
                  Essential for Pharmacy, Grocery & Agro retail sectors. Track lot numbers and expiry dates.
                </small>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  role="switch"
                  id="toggleBatches"
                  checked={hasBatches}
                  onChange={(e) => {
                    setHasBatches(e.target.checked);
                    if (e.target.checked && batchesList.length === 0) {
                      handleAddBatchRow();
                    }
                  }}
                />
                <label className="form-check-label fw-bold small cursor-pointer" htmlFor="toggleBatches">
                  {hasBatches ? 'Batch Tracking Active' : 'No Batches'}
                </label>
              </div>
            </div>

            {hasBatches && (
              <div className="card-body p-4">
                <div className="table-responsive mb-3">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light small">
                      <tr>
                        <th>Batch Number</th>
                        <th>Mfg Date</th>
                        <th>Expiry Date</th>
                        <th style={{ width: '100px' }}>Quantity</th>
                        <th style={{ width: '110px' }}>MRP (₹)</th>
                        <th style={{ width: '110px' }}>Cost (₹)</th>
                        <th style={{ width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchesList.map((b, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm font-monospace"
                              placeholder="BATCH-101"
                              value={b.batch_number}
                              onChange={(e) => handleUpdateBatchRow(idx, 'batch_number', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={b.manufacturing_date}
                              onChange={(e) => handleUpdateBatchRow(idx, 'manufacturing_date', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={b.expiry_date}
                              onChange={(e) => handleUpdateBatchRow(idx, 'expiry_date', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={b.current_quantity}
                              onChange={(e) => handleUpdateBatchRow(idx, 'current_quantity', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={b.mrp}
                              onChange={(e) => handleUpdateBatchRow(idx, 'mrp', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control form-control-sm"
                              value={b.purchase_price}
                              onChange={(e) => handleUpdateBatchRow(idx, 'purchase_price', e.target.value)}
                            />
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm p-1"
                              onClick={() => handleRemoveBatchRow(idx)}
                              title="Delete Batch"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3"
                  onClick={handleAddBatchRow}
                >
                  + Add New Batch
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 7: ALERTS & NOTIFICATIONS                        */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-alerts') && (
          <div id="sec-alerts" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  7
                </span>
                Automated Alerts & Notifications
              </h5>
              <small className="text-muted">Configure proactive warnings for low stock levels and expiring inventory.</small>
            </div>
            <div className="card-body p-4">
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input cursor-pointer"
                        type="checkbox"
                        role="switch"
                        id="enableLowStockSwitch"
                        checked={enableLowStockAlert}
                        onChange={(e) => setEnableLowStockAlert(e.target.checked)}
                      />
                      <label className="form-check-label fw-bold text-dark cursor-pointer" htmlFor="enableLowStockSwitch">
                        Low Stock Alert
                      </label>
                    </div>
                    <p className="text-muted small mb-0">
                      Alerts dashboard and notification bell when current stock falls to or below{' '}
                      <strong>{minimumStock || 5}</strong> units.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input cursor-pointer"
                        type="checkbox"
                        role="switch"
                        id="enableExpirySwitch"
                        checked={enableExpiryAlert}
                        onChange={(e) => setEnableExpiryAlert(e.target.checked)}
                      />
                      <label className="form-check-label fw-bold text-dark cursor-pointer" htmlFor="enableExpirySwitch">
                        Expiry Date Advance Warning
                      </label>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <span className="small text-muted">Warn</span>
                      <select
                        className="form-select form-select-sm w-auto"
                        value={expiryWarningDays}
                        onChange={(e) => setExpiryWarningDays(Number(e.target.value))}
                        disabled={!enableExpiryAlert}
                      >
                        <option value="15">15 Days Before</option>
                        <option value="30">30 Days Before</option>
                        <option value="60">60 Days Before</option>
                        <option value="90">90 Days Before</option>
                      </select>
                      <span className="small text-muted">prior to expiration.</span>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="d-flex gap-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifyEmail"
                        checked={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.checked)}
                      />
                      <label className="form-check-label small text-dark" htmlFor="notifyEmail">
                        Send alerts to Store Owner Email
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="notifySms"
                        checked={notifySms}
                        onChange={(e) => setNotifySms(e.target.checked)}
                      />
                      <label className="form-check-label small text-dark" htmlFor="notifySms">
                        Send SMS Notification
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 8: ADDITIONAL INFORMATION                        */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'sec-additional') && (
          <div id="sec-additional" className="card border rounded-4 mb-4 shadow-sm">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  8
                </span>
                Additional Information & Media
              </h5>
              <small className="text-muted">Product visual image, featured showcase, and active lifecycle status.</small>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                {/* Image URL */}
                <div className="col-12 col-md-8">
                  <label className="form-label fw-bold small text-dark">Product Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/images/product.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <small className="text-muted" style={{ fontSize: '11px' }}>
                    Enter web image URL or CDN link. Thumbnail preview renders below.
                  </small>
                </div>

                {/* Status */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-bold small text-dark">Catalog Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active (Available for Sale)</option>
                    <option value="inactive">Inactive (Hidden from POS)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                {/* Featured Checkbox */}
                <div className="col-12">
                  <div className="form-check form-switch p-2 bg-light rounded-3 border">
                    <input
                      className="form-check-input ms-0 me-3 cursor-pointer"
                      type="checkbox"
                      role="switch"
                      id="isFeaturedSwitch"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold small text-dark cursor-pointer" htmlFor="isFeaturedSwitch">
                      ⭐ Mark as Featured Item (Pinned prominently on POS quick-billing screen)
                    </label>
                  </div>
                </div>

                {/* Image Preview Thumbnail */}
                {imageUrl && (
                  <div className="col-12">
                    <div className="p-2 border rounded-3 d-inline-block bg-white shadow-sm">
                      <img
                        src={imageUrl}
                        alt="Product preview"
                        style={{ height: '90px', width: '90px', objectFit: 'cover' }}
                        className="rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="d-flex justify-content-between align-items-center p-3 bg-white border rounded-4 shadow-sm mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>

          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="px-4 py-2 fw-bold"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving Product...
                </>
              ) : isEditing ? (
                '✓ Update Product'
              ) : (
                '✓ Save & Add Product'
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* QUICK CATEGORY MODAL */}
      {showQuickCategoryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Add Store Category</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowQuickCategoryModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateQuickCategory}>
                <div className="modal-body p-4">
                  <label className="form-label fw-bold small">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Organic Pulses, Winter Jackets, Antibiotics"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                    required
                  />
                  <small className="text-muted mt-1 d-block">
                    This category will strictly belong to your authenticated store.
                  </small>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => setShowQuickCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    disabled={creatingCategory}
                  >
                    {creatingCategory ? 'Creating...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QUICK BRAND MODAL */}
      {showQuickBrandModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Add Store Brand</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowQuickBrandModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateQuickBrand}>
                <div className="modal-body p-4">
                  <label className="form-label fw-bold small">Brand Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tata Sampann, Raymond, Cipla"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    autoFocus
                    required
                  />
                  <small className="text-muted mt-1 d-block">
                    This brand will be available only to your store.
                  </small>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => setShowQuickBrandModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    disabled={creatingBrand}
                  >
                    {creatingBrand ? 'Creating...' : 'Save Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
