import React, { useState, useEffect, useMemo } from 'react';
import { productService, categoryService } from '../../services';
import './ProductForm.css';

// Pre-defined Clothing Specification Options
const CLOTHING_SPEC_OPTIONS = {
  patterns: ['Solid / Plain', 'Printed', 'Striped', 'Checked', 'Graphic Print', 'Floral', 'Embroidered'],
  genders: ['Men', 'Women', 'Unisex', 'Boys', 'Girls'],
  fabrics: ['100% Cotton', 'Cotton Blend', 'Pure Silk', 'Denim', 'Linen', 'Wool', 'Rayon', 'Polyester', 'Georgette', 'Chiffon'],
  fitTypes: ['Regular Fit', 'Slim Fit', 'Oversized Fit', 'Relaxed Fit', 'Tailored Fit', 'Skinny Fit'],
  neckTypes: ['Round Neck', 'V-Neck', 'Polo Neck', 'Henley Neck', 'Mandarin Neck', 'Boat Neck', 'Collar Neck'],
  sleeveTypes: ['Half Sleeve', 'Full Sleeve', 'Sleeveless', 'Three-Quarter Sleeve', 'Roll-up Sleeve'],
  collarTypes: ['Regular Spread', 'Button-Down', 'Mandarin / Chinese', 'Cutaway', 'Cuban Collar'],
  closureTypes: ['Button Down', 'Zip Fly with Button', 'Zipper', 'Drawstring', 'Snap Button', 'Elastic Waistband'],
  pocketTypes: ['Single Pocket', 'Double Pocket', 'No Pocket', 'Side Pockets'],
  waistTypes: ['Mid Rise', 'High Rise', 'Low Rise', 'Elasticated Waist'],
  washTypes: ['Light Wash', 'Medium Wash', 'Dark Wash', 'Acid Wash', 'Raw / Rinse'],
  occasions: ['Casual', 'Daily Wear', 'Festive', 'Formal / Office', 'Party', 'Sports / Activewear', 'Wedding'],
  kurtiLengths: ['Knee Length', 'Calf Length', 'Ankle Length', 'Short / Hip Length'],
  kurtiWorks: ['Plain / Minimal', 'Hand Block Print', 'Chikankari', 'Zari Work', 'Mirror Work', 'Embroidered'],
  sareeBorders: ['Zari Border', 'Broad Border', 'Contrast Border', 'Embroidered Border', 'Temple Border', 'No Border'],
  sareeWorks: ['Woven Zari', 'Digital Printed', 'Handloom Weave', 'Embroidered', 'Stone Work'],
  blousePieceOptions: ['Available (Attached)', 'Available (Unstitched)', 'Not Included'],
  dressTypes: ['Maxi Dress', 'Midi Dress', 'Mini Dress', 'Bodycon', 'A-Line Dress', 'Shift Dress', 'Wrap Dress']
};

export const ProductForm = ({
  initialProduct = null,
  initialCategoryId = null,
  onSuccess,
  onCancel
}) => {
  const isEditing = Boolean(initialProduct && initialProduct.id);

  // Form Configuration
  const [formConfig, setFormConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ----------------------------------------------------
  // SECTION 1: BASIC PRODUCT INFORMATION
  // ----------------------------------------------------
  const [productName, setProductName] = useState(initialProduct?.product_name || initialProduct?.name || '');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || initialCategoryId || '');
  const [brandId, setBrandId] = useState(initialProduct?.brand_id || '');
  const [unitId, setUnitId] = useState(initialProduct?.unit_id || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images[0].image_url
      : initialProduct?.image_url || ''
  );

  // ----------------------------------------------------
  // SECTION 2: PRICING INFORMATION
  // ----------------------------------------------------
  const [purchasePrice, setPurchasePrice] = useState(
    initialProduct?.pricing?.purchase_price ?? initialProduct?.purchase_price ?? ''
  );
  const [sellingPrice, setSellingPrice] = useState(
    initialProduct?.pricing?.selling_price ?? initialProduct?.selling_price ?? ''
  );
  const [mrp, setMrp] = useState(
    initialProduct?.pricing?.mrp ?? initialProduct?.mrp ?? ''
  );
  const [taxType, setTaxType] = useState(
    initialProduct?.pricing?.tax_type || 'exclusive'
  );
  const [gstRate, setGstRate] = useState(
    initialProduct?.pricing?.gst_rate !== undefined && initialProduct?.pricing?.gst_rate !== null
      ? Number(initialProduct.pricing.gst_rate)
      : 0
  );
  const [currentStock, setCurrentStock] = useState(
    initialProduct?.inventory_record?.current_stock ?? initialProduct?.current_stock ?? 0
  );

  // ----------------------------------------------------
  // SECTION 3: STORE-SPECIFIC SPECIFICATIONS
  // ----------------------------------------------------
  const [storeDetails, setStoreDetails] = useState({});

  // Clothing Smart Specifications State
  const [clothingSpecType, setClothingSpecType] = useState('T-Shirt');
  const [clothingSpecs, setClothingSpecs] = useState({
    pattern: 'Solid / Plain',
    neck_type: 'Round Neck',
    sleeve_type: 'Half Sleeve',
    fabric: '100% Cotton',
    fit_type: 'Regular Fit',
    color: '',
    material: '100% Combed Cotton',
    gender: 'Men',
    occasion: 'Casual'
  });
  // Dynamic custom specifications when "Other" is chosen
  const [customSpecs, setCustomSpecs] = useState([
    { name: '', value: '' }
  ]);

  // ----------------------------------------------------
  // SECTION 4: STOCK ALERT SETTINGS
  // ----------------------------------------------------
  // Low Stock Alert (Default: OFF)
  const [lowStockAlertEnabled, setLowStockAlertEnabled] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  // Expiry Alert (Default: OFF) - Only for Grocery, Medical, Agro
  const [expiryAlertEnabled, setExpiryAlertEnabled] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [alertDaysBefore, setAlertDaysBefore] = useState(7);

  // Quick modals for Category and Brand
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [showQuickBrandModal, setShowQuickBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [creatingBrand, setCreatingBrand] = useState(false);

  // ----------------------------------------------------
  // 1. Fetch Form Configuration
  // ----------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setLoadingConfig(true);
      try {
        const config = await productService.getFormConfig();
        if (isMounted && config) {
          setFormConfig(config);

          // Defaults
          if (!categoryId && config.categories && config.categories.length > 0) {
            setCategoryId(config.categories[0].id);
          }
          if (!unitId && config.units && config.units.length > 0) {
            setUnitId(config.units[0].id);
          }

          const storeCode = config.store_type?.code || 'grocery';
          const existingDetails =
            initialProduct?.[`${storeCode}_details`] ||
            initialProduct?.store_details ||
            initialProduct?.attributes ||
            {};

          // Initialize store-specific details
          const initialDetails = {};
          if (config.store_specific_fields) {
            config.store_specific_fields.forEach((field) => {
              if (existingDetails[field.name] !== undefined) {
                initialDetails[field.name] = existingDetails[field.name];
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

          // Restore Clothing Smart Specifications if editing clothing product
          if (storeCode === 'clothing') {
            const rawClothing = initialProduct?.clothing_details || initialProduct?.store_details || {};
            const savedType =
              rawClothing.specification_type ||
              rawClothing.clothing_type ||
              'T-Shirt';
            setClothingSpecType(savedType);

            const savedSpecs = rawClothing.specifications || {};
            setClothingSpecs({
              pattern: rawClothing.pattern || savedSpecs.pattern || 'Solid / Plain',
              neck_type: rawClothing.neck_type || savedSpecs.neck_type || 'Round Neck',
              sleeve_type: rawClothing.sleeve_type || savedSpecs.sleeve_type || 'Half Sleeve',
              fabric: rawClothing.fabric_type || rawClothing.fabric || savedSpecs.fabric || '100% Cotton',
              fit_type: rawClothing.fit_type || savedSpecs.fit_type || 'Regular Fit',
              color: rawClothing.color || savedSpecs.color || '',
              material: savedSpecs.material || '100% Combed Cotton',
              gender: rawClothing.gender || savedSpecs.gender || 'Men',
              occasion: savedSpecs.occasion || 'Casual',
              collar_type: savedSpecs.collar_type || 'Regular Spread',
              closure_type: savedSpecs.closure_type || 'Button Down',
              pocket_type: savedSpecs.pocket_type || 'Single Pocket',
              waist_type: savedSpecs.waist_type || 'Mid Rise',
              rise_type: savedSpecs.rise_type || 'Mid Rise',
              wash_type: savedSpecs.wash_type || 'Medium Wash',
              length: savedSpecs.length || '',
              work_type: savedSpecs.work_type || 'Plain / Minimal',
              border_type: savedSpecs.border_type || 'Zari Border',
              blouse_piece: savedSpecs.blouse_piece || 'Available (Attached)',
              dress_type: savedSpecs.dress_type || 'A-Line Dress'
            });

            // If "Other", parse custom key-values
            if (savedType === 'Other') {
              const customEntries = Object.entries(savedSpecs);
              if (customEntries.length > 0) {
                setCustomSpecs(customEntries.map(([k, v]) => ({ name: k, value: String(v) })));
              }
            }
          }

          // Restore Alert Settings if editing
          if (initialProduct) {
            // Low stock
            const isLowEnabled = Boolean(
              initialProduct.low_stock_alert_enabled ||
              (initialProduct.alerts && initialProduct.alerts.some((a) => a.alert_type === 'low_stock' && a.is_enabled))
            );
            setLowStockAlertEnabled(isLowEnabled);
            if (initialProduct.low_stock_threshold !== undefined && initialProduct.low_stock_threshold !== null) {
              setLowStockThreshold(initialProduct.low_stock_threshold);
            } else if (initialProduct.min_stock_level) {
              setLowStockThreshold(initialProduct.min_stock_level);
            }

            // Expiry
            const isExpEnabled = Boolean(
              initialProduct.expiry_alert_enabled ||
              initialProduct.expiry_date ||
              (initialProduct.alerts && initialProduct.alerts.some((a) => a.alert_type === 'expiring_soon' && a.is_enabled))
            );
            setExpiryAlertEnabled(isExpEnabled);
            if (initialProduct.expiry_date) {
              setExpiryDate(initialProduct.expiry_date.split('T')[0]);
            }
            if (initialProduct.alert_days_before) {
              setAlertDaysBefore(initialProduct.alert_days_before);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load store configuration.');
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

  // Determine store capabilities
  const storeTypeCode = formConfig?.store_type?.code || 'grocery';
  const hasBrand = formConfig?.store_type?.has_brand ?? (storeTypeCode !== 'grocery');
  // Image is ONLY allowed in Clothing and Agro stores
  const hasImage = formConfig?.store_type?.has_image ?? (storeTypeCode === 'clothing' || storeTypeCode === 'agro');
  // Expiry is ONLY allowed for Grocery, Medical, and Agro
  const hasExpiry = formConfig?.store_type?.has_expiry ?? (storeTypeCode === 'grocery' || storeTypeCode === 'medical' || storeTypeCode === 'agro');
  const isClothingStore = storeTypeCode === 'clothing';

  // Auto-generate SKU
  const handleGenerateSku = () => {
    const storeCode = formConfig?.store?.code || 'NEX';
    const stCode = storeTypeCode.substring(0, 3).toUpperCase();
    const cleanName = (productName || 'ITEM').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${storeCode}-${stCode}-${cleanName}-${rand}`);
  };

  // Change Clothing Specification Type
  const handleClothingTypeChange = (type) => {
    setClothingSpecType(type);
    // Adjust default values based on type
    if (type === 'T-Shirt') {
      setClothingSpecs((prev) => ({
        ...prev,
        pattern: 'Solid / Plain',
        neck_type: 'Round Neck',
        sleeve_type: 'Half Sleeve',
        fabric: '100% Cotton',
        fit_type: 'Regular Fit',
        material: '100% Combed Cotton',
        gender: 'Men',
        occasion: 'Casual'
      }));
    } else if (type === 'Shirt') {
      setClothingSpecs((prev) => ({
        ...prev,
        pattern: 'Solid / Plain',
        collar_type: 'Regular Spread',
        sleeve_type: 'Full Sleeve',
        fabric: '100% Cotton',
        fit_type: 'Slim Fit',
        closure_type: 'Button Down',
        pocket_type: 'Single Pocket',
        gender: 'Men'
      }));
    } else if (type === 'Jeans') {
      setClothingSpecs((prev) => ({
        ...prev,
        fit_type: 'Slim Fit',
        waist_type: 'Mid Rise',
        rise_type: 'Mid Rise',
        wash_type: 'Medium Wash',
        pattern: 'Solid / Plain',
        fabric: 'Stretch Denim',
        closure_type: 'Zip Fly with Button',
        gender: 'Men'
      }));
    } else if (type === 'Pants' || type === 'Trousers') {
      setClothingSpecs((prev) => ({
        ...prev,
        fit_type: 'Slim Fit',
        waist_type: 'Mid Rise',
        length: 'Full Length',
        pattern: 'Solid / Plain',
        fabric: 'Cotton Chino',
        closure_type: 'Zip Fly with Button',
        gender: 'Men'
      }));
    } else if (type === 'Kurti') {
      setClothingSpecs((prev) => ({
        ...prev,
        pattern: 'Printed',
        neck_type: 'Round Neck',
        sleeve_type: 'Three-Quarter Sleeve',
        length: 'Calf Length',
        fabric: 'Rayon',
        fit_type: 'Straight',
        work_type: 'Hand Block Print',
        occasion: 'Festive',
        gender: 'Women'
      }));
    } else if (type === 'Saree') {
      setClothingSpecs((prev) => ({
        ...prev,
        fabric: 'Pure Silk',
        pattern: 'Floral',
        border_type: 'Zari Border',
        work_type: 'Woven Zari',
        occasion: 'Wedding',
        length: '5.5 Metres',
        blouse_piece: 'Available (Attached)',
        gender: 'Women'
      }));
    } else if (type === 'Dress') {
      setClothingSpecs((prev) => ({
        ...prev,
        dress_type: 'A-Line Dress',
        neck_type: 'V-Neck',
        sleeve_type: 'Short Sleeve',
        length: 'Midi',
        pattern: 'Floral',
        fabric: 'Cotton',
        fit_type: 'Regular Fit',
        occasion: 'Casual',
        gender: 'Women'
      }));
    } else if (type === 'Jacket') {
      setClothingSpecs((prev) => ({
        ...prev,
        fit_type: 'Regular Fit',
        closure_type: 'Zipper',
        fabric: 'Denim',
        pattern: 'Solid / Plain',
        sleeve_type: 'Full Sleeve',
        occasion: 'Casual',
        gender: 'Men'
      }));
    } else if (type === 'Shorts') {
      setClothingSpecs((prev) => ({
        ...prev,
        fit_type: 'Regular Fit',
        waist_type: 'Elasticated Waist',
        length: 'Above Knee',
        fabric: '100% Cotton',
        pattern: 'Solid / Plain',
        gender: 'Men'
      }));
    } else if (type === 'Other') {
      if (customSpecs.length === 0) {
        setCustomSpecs([{ name: '', value: '' }]);
      }
    }
  };

  // Custom Spec Helpers (for "Other" type)
  const handleAddCustomSpec = () => {
    setCustomSpecs([...customSpecs, { name: '', value: '' }]);
  };

  const handleRemoveCustomSpec = (idx) => {
    setCustomSpecs(customSpecs.filter((_, i) => i !== idx));
  };

  const handleCustomSpecChange = (idx, field, val) => {
    const updated = [...customSpecs];
    updated[idx][field] = val;
    setCustomSpecs(updated);
  };

  // Quick Category Creation
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

  // Quick Brand Creation
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

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validations
    if (!productName.trim()) {
      setErrorMessage('Product Name is required.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Please select a Category.');
      return;
    }
    if (sellingPrice === '' || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      setErrorMessage('A valid Selling Price is required.');
      return;
    }
    if (lowStockAlertEnabled) {
      if (lowStockThreshold === '' || isNaN(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0) {
        setErrorMessage('Please enter a valid Low Stock Alert Quantity threshold.');
        return;
      }
    }
    if (expiryAlertEnabled) {
      if (!expiryDate) {
        setErrorMessage('Please enter an Expiry Date for the Expiry Alert.');
        return;
      }
      if (alertDaysBefore === '' || isNaN(Number(alertDaysBefore)) || Number(alertDaysBefore) < 1) {
        setErrorMessage('Please specify how many days before expiry to alert.');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Build store details
      let detailsPayload = { ...storeDetails };

      if (isClothingStore) {
        let specsObj = {};
        if (clothingSpecType === 'Other') {
          customSpecs.forEach((item) => {
            if (item.name.trim() && item.value.trim()) {
              specsObj[item.name.trim()] = item.value.trim();
            }
          });
        } else {
          specsObj = { ...clothingSpecs };
        }

        detailsPayload = {
          clothing_type: clothingSpecType,
          specification_type: clothingSpecType,
          gender: clothingSpecs.gender || 'Unisex',
          fabric_type: clothingSpecs.fabric || '100% Cotton',
          fit_type: clothingSpecs.fit_type || 'Regular Fit',
          pattern: clothingSpecs.pattern || 'Solid / Plain',
          color: clothingSpecs.color || '',
          specifications: specsObj
        };
      }

      const detailKey = `${storeTypeCode}_details`;

      const payload = {
        product_name: productName.trim(),
        sku: sku.trim() || undefined,
        category_id: Number(categoryId),
        brand_id: hasBrand && brandId ? Number(brandId) : undefined,
        unit_id: unitId ? Number(unitId) : undefined,
        selling_price: parseFloat(sellingPrice) || 0,
        purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
        mrp: mrp !== '' ? parseFloat(mrp) : undefined,
        pricing: {
          purchase_price: purchasePrice !== '' ? parseFloat(purchasePrice) : 0,
          selling_price: parseFloat(sellingPrice) || 0,
          mrp: mrp !== '' ? parseFloat(mrp) : undefined,
          tax_type: taxType,
          gst_rate: parseFloat(gstRate) || 0
        },
        current_stock: parseFloat(currentStock) || 0,
        initial_stock: parseFloat(currentStock) || 0,
        min_stock_level: lowStockAlertEnabled && lowStockThreshold !== '' ? parseFloat(lowStockThreshold) : 0,
        inventory: {
          current_stock: parseFloat(currentStock) || 0,
          minimum_stock: lowStockAlertEnabled && lowStockThreshold !== '' ? parseFloat(lowStockThreshold) : 0
        },
        store_details: detailsPayload,
        [detailKey]: detailsPayload,

        // Low stock alert settings
        low_stock_alert_enabled: Boolean(lowStockAlertEnabled),
        low_stock_threshold: lowStockAlertEnabled && lowStockThreshold !== '' ? parseFloat(lowStockThreshold) : null,

        // Expiry alert settings (only if store supports expiry)
        expiry_alert_enabled: Boolean(hasExpiry && expiryAlertEnabled),
        expiry_date: hasExpiry && expiryAlertEnabled && expiryDate ? expiryDate : null,
        alert_days_before: hasExpiry && expiryAlertEnabled ? parseInt(alertDaysBefore, 10) : 7,

        // Images - strictly allowed for Agro and Clothing only
        images: hasImage && imageUrl.trim() ? [{ image_url: imageUrl.trim(), is_primary: true }] : []
      };

      let result;
      if (isEditing) {
        result = await productService.updateProduct(initialProduct.id, payload);
        setSuccessMessage(`Product "${result.product_name || result.name}" updated successfully!`);
      } else {
        result = await productService.createProduct(payload);
        setSuccessMessage(`Product "${result.product_name || result.name}" added successfully!`);
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(result), 750);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save product. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <h5 className="fw-bold text-dark">Loading Store Configuration...</h5>
        <p className="text-muted small">
          Customizing form layout and retail attributes for your store.
        </p>
      </div>
    );
  }

  const storeInfo = formConfig?.store;
  const storeType = formConfig?.store_type;
  const categoriesList = formConfig?.categories || [];
  const brandsList = formConfig?.brands || [];
  const unitsList = formConfig?.units || [];
  const storeFields = formConfig?.store_specific_fields || [];

  return (
    <div className="product-form-container">
      {/* 🏬 Store Verification Banner */}
      <div className="pf-store-banner">
        <div className="pf-store-info">
          <div className="pf-store-icon">
            {storeTypeCode === 'clothing' ? '👗' :
             storeTypeCode === 'medical' ? '💊' :
             storeTypeCode === 'mobile_electronics' || storeTypeCode === 'electronics' ? '📱' :
             storeTypeCode === 'plastic' ? '🧪' :
             storeTypeCode === 'handloom' ? '🧵' :
             storeTypeCode === 'furniture' ? '🛋️' :
             storeTypeCode === 'agro' ? '🌾' : '🛒'}
          </div>
          <div className="pf-store-meta">
            <h5>{storeInfo?.name || 'Retail Store'}</h5>
            <p>
              Type: <strong>{storeType?.name || 'Store'}</strong> • Store Code: <code>{storeInfo?.code || 'STORE-01'}</code>
            </p>
          </div>
        </div>
        <div>
          <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill small">
            ✓ Store Verified
          </span>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show rounded-3 py-3 mb-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 py-3 mb-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '18px' }}>✓</span>
            <div>{successMessage}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ======================================================== */}
        {/* SECTION 1: BASIC PRODUCT INFORMATION                     */}
        {/* ======================================================== */}
        <div className="pf-section-card">
          <div className="pf-section-header">
            <div className="pf-section-badge">1</div>
            <div className="pf-section-title-wrap">
              <h5>Basic Product Information</h5>
              <p>Essential identification, category classification, and measurement units.</p>
            </div>
          </div>
          <div className="pf-section-body">
            <div className="row g-3">
              {/* Product Name */}
              <div className="col-12 col-md-8">
                <label className="pf-label">
                  Product Name <span className="pf-label-required">*</span>
                </label>
                <input
                  type="text"
                  className="pf-input"
                  placeholder="e.g. Parle-G Gold Biscuit, Cotton Slim Fit Shirt, Paracetamol 500mg"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>

              {/* SKU */}
              <div className="col-12 col-md-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="pf-label mb-0">SKU / Item Code</label>
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
                  className="pf-input font-monospace"
                  placeholder="e.g. SKU-1002"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="pf-label mb-0">
                    Category <span className="pf-label-required">*</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                    onClick={() => setShowQuickCategoryModal(true)}
                  >
                    + Add Category
                  </button>
                </div>
                <select
                  className="pf-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand (HIDDEN FOR GROCERY) */}
              {hasBrand && (
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="pf-label mb-0">Brand</label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-primary small text-decoration-none"
                      onClick={() => setShowQuickBrandModal(true)}
                    >
                      + Add Brand
                    </button>
                  </div>
                  <select
                    className="pf-select"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">-- No Brand / Generic --</option>
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Unit of Measure */}
              <div className={`col-12 ${hasBrand ? 'col-md-6' : 'col-md-6'}`}>
                <label className="pf-label">Unit of Measure</label>
                <select
                  className="pf-select"
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                >
                  {unitsList.length > 0 ? (
                    unitsList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.symbol})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Pieces (pcs)</option>
                      <option value="2">Kilograms (kg)</option>
                      <option value="3">Grams (g)</option>
                      <option value="4">Liters (L)</option>
                      <option value="5">Meters (m)</option>
                      <option value="6">Box (box)</option>
                      <option value="7">Packet (pkt)</option>
                      <option value="8">Pair (pair)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Image Upload/URL (ONLY FOR AGRO AND CLOTHING) */}
              {hasImage && (
                <div className="col-12">
                  <label className="pf-label">
                    Product Image <span className="pf-label-hint">(Agro & Clothing Stores Only)</span>
                  </label>
                  <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-8">
                      <input
                        type="url"
                        className="pf-input"
                        placeholder="https://example.com/product-image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      {imageUrl ? (
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="pf-image-preview"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setImageUrl('')}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span className="small text-muted fst-italic">Paste an image link or leave blank</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: PRICING INFORMATION                           */}
        {/* ======================================================== */}
        <div className="pf-section-card">
          <div className="pf-section-header">
            <div className="pf-section-badge">2</div>
            <div className="pf-section-title-wrap">
              <h5>Pricing & Tax Information</h5>
              <p>Configure purchase price, customer selling price, MRP, and GST rates.</p>
            </div>
          </div>
          <div className="pf-section-body">
            <div className="row g-3">
              {/* Purchase Price */}
              <div className="col-12 col-md-4">
                <label className="pf-label">Purchase Price</label>
                <div className="pf-input-group">
                  <span className="pf-input-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pf-input pf-input-has-prefix"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div className="col-12 col-md-4">
                <label className="pf-label">
                  Selling Price <span className="pf-label-required">*</span>
                </label>
                <div className="pf-input-group">
                  <span className="pf-input-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pf-input pf-input-has-prefix fw-bold text-primary"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* MRP */}
              <div className="col-12 col-md-4">
                <label className="pf-label">Maximum Retail Price (MRP)</label>
                <div className="pf-input-group">
                  <span className="pf-input-prefix">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="pf-input pf-input-has-prefix"
                    placeholder="Optional MRP"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                  />
                </div>
              </div>

              {/* Tax Treatment */}
              <div className="col-12 col-md-4">
                <label className="pf-label">Tax Treatment</label>
                <select
                  className="pf-select"
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                >
                  <option value="exclusive">Tax Exclusive (Base + GST)</option>
                  <option value="inclusive">Tax Inclusive (MRP includes GST)</option>
                  <option value="exempt">Tax Exempt (0% GST)</option>
                </select>
              </div>

              {/* GST Rate */}
              <div className="col-12 col-md-4">
                <label className="pf-label">GST Rate (%)</label>
                <select
                  className="pf-select"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                >
                  <option value="0">0% (Nil / Exempt)</option>
                  <option value="5">5% GST (CGST 2.5% + SGST 2.5%)</option>
                  <option value="12">12% GST (CGST 6% + SGST 6%)</option>
                  <option value="18">18% GST (CGST 9% + SGST 9%)</option>
                  <option value="28">28% GST (CGST 14% + SGST 14%)</option>
                </select>
              </div>

              {/* Current Stock Quantity */}
              <div className="col-12 col-md-4">
                <label className="pf-label">Current Stock on Hand</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  className="pf-input"
                  placeholder="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: STORE-SPECIFIC SPECIFICATIONS                 */}
        {/* ======================================================== */}
        <div className="pf-section-card">
          <div className="pf-section-header">
            <div className="pf-section-badge">3</div>
            <div className="pf-section-title-wrap">
              <h5>Store-Specific Specifications</h5>
              <p>Tailored attributes for {storeType?.name || 'your store type'}.</p>
            </div>
          </div>
          <div className="pf-section-body">
            {isClothingStore ? (
              /* CLOTHING STORE SMART PRODUCT SPECIFICATIONS */
              <div className="pf-smart-specs">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <label className="pf-label">
                      Select Specification Type <span className="pf-label-required">*</span>
                    </label>
                    <select
                      className="pf-select pf-smart-type-select"
                      value={clothingSpecType}
                      onChange={(e) => handleClothingTypeChange(e.target.value)}
                    >
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Shirt">Shirt</option>
                      <option value="Jeans">Jeans</option>
                      <option value="Pants">Pants</option>
                      <option value="Trousers">Trousers</option>
                      <option value="Kurti">Kurti</option>
                      <option value="Saree">Saree</option>
                      <option value="Dress">Dress</option>
                      <option value="Jacket">Jacket</option>
                      <option value="Shorts">Shorts</option>
                      <option value="Other">Other (Custom Specifications)</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6 d-flex align-items-center">
                    <span className="small text-muted">
                      💡 Attributes update dynamically based on the selected apparel category.
                    </span>
                  </div>
                </div>

                {/* TYPE 1: T-SHIRT */}
                {clothingSpecType === 'T-Shirt' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Neck Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.neck_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, neck_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.neckTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Sleeve Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.sleeve_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, sleeve_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.sleeveTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fabrics.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fitTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Navy Blue, Jet Black"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Material</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. 100% Combed Cotton"
                        value={clothingSpecs.material || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, material: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Gender</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.gender}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, gender: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.genders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Occasion</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.occasion}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, occasion: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.occasions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 2: SHIRT */}
                {clothingSpecType === 'Shirt' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Collar Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.collar_type || 'Regular Spread'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, collar_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.collarTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Sleeve Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.sleeve_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, sleeve_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.sleeveTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fabrics.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fitTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Closure Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.closure_type || 'Button Down'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, closure_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.closureTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pocket Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pocket_type || 'Single Pocket'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pocket_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.pocketTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Sky Blue, Crisp White"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Gender</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.gender}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, gender: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.genders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 3: JEANS */}
                {clothingSpecType === 'Jeans' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fitTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Waist Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.waist_type || 'Mid Rise'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, waist_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.waistTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Rise Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.rise_type || 'Mid Rise'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, rise_type: e.target.value })}
                      >
                        <option value="Mid Rise">Mid Rise</option>
                        <option value="High Rise">High Rise</option>
                        <option value="Low Rise">Low Rise</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Wash Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.wash_type || 'Medium Wash'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, wash_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.washTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        <option value="Solid / Plain">Solid / Plain</option>
                        <option value="Faded">Faded</option>
                        <option value="Distressed / Ripped">Distressed / Ripped</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        <option value="Stretch Denim">Stretch Denim</option>
                        <option value="100% Cotton Denim">100% Cotton Denim</option>
                        <option value="Poly-Spandex Denim">Poly-Spandex Denim</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Closure Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.closure_type || 'Zip Fly with Button'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, closure_type: e.target.value })}
                      >
                        <option value="Zip Fly with Button">Zip Fly with Button</option>
                        <option value="Button Fly">Button Fly</option>
                        <option value="Drawstring">Drawstring</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Indigo Dark Blue, Light Washed"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Gender</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.gender}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, gender: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.genders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 4 & 5: PANTS / TROUSERS */}
                {(clothingSpecType === 'Pants' || clothingSpecType === 'Trousers') && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        <option value="Slim Fit">Slim Fit</option>
                        <option value="Regular Fit">Regular Fit</option>
                        <option value="Straight Fit">Straight Fit</option>
                        <option value="Chino">Chino</option>
                        <option value="Formal">Formal</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Waist Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.waist_type || 'Mid Rise'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, waist_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.waistTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Length</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.length || 'Full Length'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, length: e.target.value })}
                      >
                        <option value="Full Length">Full Length</option>
                        <option value="Ankle Length">Ankle Length</option>
                        <option value="Cropped">Cropped</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        <option value="Cotton Chino">Cotton Chino</option>
                        <option value="Poly-Viscose">Poly-Viscose</option>
                        <option value="Linen Blend">Linen Blend</option>
                        <option value="Wool Blend">Wool Blend</option>
                        <option value="100% Cotton">100% Cotton</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Closure Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.closure_type || 'Zip Fly with Button'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, closure_type: e.target.value })}
                      >
                        <option value="Zip Fly with Button">Zip Fly with Button</option>
                        <option value="Zip Fly with Hook">Zip Fly with Hook</option>
                        <option value="Elastic Waistband">Elastic Waistband</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Khaki, Charcoal Grey, Navy"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Gender</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.gender}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, gender: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.genders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 6: KURTI */}
                {clothingSpecType === 'Kurti' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Neck Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.neck_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, neck_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.neckTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Sleeve Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.sleeve_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, sleeve_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.sleeveTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Length</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.length || 'Calf Length'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, length: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.kurtiLengths.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fabrics.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        <option value="Straight">Straight</option>
                        <option value="A-Line">A-Line</option>
                        <option value="Anarkali">Anarkali</option>
                        <option value="Flared">Flared</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Work Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.work_type || 'Plain / Minimal'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, work_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.kurtiWorks.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Occasion</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.occasion}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, occasion: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.occasions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Mustard Yellow, Coral Pink"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* TYPE 7: SAREE */}
                {clothingSpecType === 'Saree' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        <option value="Pure Silk">Pure Silk</option>
                        <option value="Cotton Silk">Cotton Silk</option>
                        <option value="Georgette">Georgette</option>
                        <option value="Chiffon">Chiffon</option>
                        <option value="Banarasi Silk">Banarasi Silk</option>
                        <option value="Kanjivaram Silk">Kanjivaram Silk</option>
                        <option value="Linen">Linen</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Border Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.border_type || 'Zari Border'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, border_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.sareeBorders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Work Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.work_type || 'Woven Zari'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, work_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.sareeWorks.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Occasion</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.occasion}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, occasion: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.occasions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Length</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.length || '5.5 Metres'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, length: e.target.value })}
                      >
                        <option value="5.5 Metres">5.5 Metres</option>
                        <option value="6 Metres">6 Metres</option>
                        <option value="6.3 Metres (with Blouse)">6.3 Metres (with Blouse)</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Royal Blue, Emerald Green"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-8">
                      <label className="pf-label">Blouse Piece Availability</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.blouse_piece || 'Available (Attached)'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, blouse_piece: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.blousePieceOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 8: DRESS */}
                {clothingSpecType === 'Dress' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Dress Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.dress_type || 'A-Line Dress'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, dress_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.dressTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Neck Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.neck_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, neck_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.neckTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Sleeve Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.sleeve_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, sleeve_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.sleeveTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Length</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.length || 'Midi'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, length: e.target.value })}
                      >
                        <option value="Maxi Length">Maxi Length</option>
                        <option value="Midi Length">Midi Length</option>
                        <option value="Knee Length">Knee Length</option>
                        <option value="Above Knee">Above Knee</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fabrics.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.fitTypes.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Occasion</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.occasion}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, occasion: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.occasions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Lavender, Maroon, Black"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* TYPE 9: JACKET */}
                {clothingSpecType === 'Jacket' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        <option value="Regular Fit">Regular Fit</option>
                        <option value="Slim Fit">Slim Fit</option>
                        <option value="Bomber">Bomber</option>
                        <option value="Oversized Fit">Oversized Fit</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Closure Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.closure_type || 'Zipper'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, closure_type: e.target.value })}
                      >
                        <option value="Zipper">Zipper</option>
                        <option value="Button Down">Button Down</option>
                        <option value="Snap Button">Snap Button</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        <option value="Denim">Denim</option>
                        <option value="Leather / Faux Leather">Leather / Faux Leather</option>
                        <option value="Fleece / Polyester">Fleece / Polyester</option>
                        <option value="100% Cotton">100% Cotton</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        <option value="Solid / Plain">Solid / Plain</option>
                        <option value="Quilted">Quilted</option>
                        <option value="Colorblock">Colorblock</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Sleeve Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.sleeve_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, sleeve_type: e.target.value })}
                      >
                        <option value="Full Sleeve">Full Sleeve</option>
                        <option value="Sleeveless / Vest">Sleeveless / Vest</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Jet Black, Olive Green"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Gender</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.gender}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, gender: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.genders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Occasion</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.occasion}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, occasion: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.occasions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 10: SHORTS */}
                {clothingSpecType === 'Shorts' && (
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fit Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fit_type}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fit_type: e.target.value })}
                      >
                        <option value="Regular Fit">Regular Fit</option>
                        <option value="Slim Fit">Slim Fit</option>
                        <option value="Bermuda">Bermuda</option>
                        <option value="Athletic / Running">Athletic / Running</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Waist Type</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.waist_type || 'Elasticated Waist'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, waist_type: e.target.value })}
                      >
                        <option value="Elastic with Drawstring">Elastic with Drawstring</option>
                        <option value="Button & Zip Fly">Button & Zip Fly</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Length</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.length || 'Above Knee'}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, length: e.target.value })}
                      >
                        <option value="Above Knee">Above Knee</option>
                        <option value="Mid-Thigh">Mid-Thigh</option>
                        <option value="Knee Length">Knee Length</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Fabric</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.fabric}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, fabric: e.target.value })}
                      >
                        <option value="100% Cotton">100% Cotton</option>
                        <option value="Denim">Denim</option>
                        <option value="French Terry">French Terry</option>
                        <option value="Polyester">Polyester</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Pattern</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.pattern}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, pattern: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.patterns.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Color</label>
                      <input
                        type="text"
                        className="pf-input"
                        placeholder="e.g. Navy Blue, Grey Marl"
                        value={clothingSpecs.color || ''}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, color: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="pf-label">Gender</label>
                      <select
                        className="pf-select"
                        value={clothingSpecs.gender}
                        onChange={(e) => setClothingSpecs({ ...clothingSpecs, gender: e.target.value })}
                      >
                        {CLOTHING_SPEC_OPTIONS.genders.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* TYPE 11: OTHER (CUSTOM SPECIFICATIONS) */}
                {clothingSpecType === 'Other' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold small text-dark">Custom Product Specifications</span>
                      <button
                        type="button"
                        className="pf-btn-add-spec"
                        onClick={handleAddCustomSpec}
                      >
                        + Add More Specification
                      </button>
                    </div>

                    {customSpecs.map((spec, idx) => (
                      <div key={idx} className="pf-custom-spec-row">
                        <input
                          type="text"
                          className="pf-input"
                          placeholder="Specification Name (e.g. Sleeve Cut, Embroidery)"
                          value={spec.name}
                          onChange={(e) => handleCustomSpecChange(idx, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          className="pf-input"
                          placeholder="Specification Value (e.g. Raglan, Gold Thread)"
                          value={spec.value}
                          onChange={(e) => handleCustomSpecChange(idx, 'value', e.target.value)}
                        />
                        {customSpecs.length > 1 && (
                          <button
                            type="button"
                            className="pf-btn-remove-spec"
                            onClick={() => handleRemoveCustomSpec(idx)}
                            title="Remove specification"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* OTHER 7 STORE TYPES: CLEAN STREAMLINED FORM */
              <div className="row g-3">
                {storeFields.length === 0 ? (
                  <div className="col-12 text-muted fst-italic py-2">
                    Standard retail item. No additional technical specifications required.
                  </div>
                ) : (
                  storeFields.map((field) => (
                    <div key={field.name} className="col-12 col-md-6">
                      <label className="pf-label">
                        {field.label} {field.required && <span className="pf-label-required">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          className="pf-select"
                          value={storeDetails[field.name] ?? field.default ?? ''}
                          onChange={(e) =>
                            setStoreDetails({ ...storeDetails, [field.name]: e.target.value })
                          }
                          required={field.required}
                        >
                          {(field.options || []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <div className="form-check form-switch pt-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`chk-${field.name}`}
                            checked={Boolean(storeDetails[field.name])}
                            onChange={(e) =>
                              setStoreDetails({ ...storeDetails, [field.name]: e.target.checked })
                            }
                          />
                          <label className="form-check-label small" htmlFor={`chk-${field.name}`}>
                            {storeDetails[field.name] ? 'Yes (Enabled)' : 'No (Disabled)'}
                          </label>
                        </div>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          className="pf-input"
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          value={storeDetails[field.name] ?? ''}
                          onChange={(e) =>
                            setStoreDetails({ ...storeDetails, [field.name]: e.target.value })
                          }
                          required={field.required}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4: STOCK ALERT SETTINGS                          */}
        {/* ======================================================== */}
        <div className="pf-section-card">
          <div className="pf-section-header">
            <div className="pf-section-badge">4</div>
            <div className="pf-section-title-wrap">
              <h5>Stock Alert Settings</h5>
              <p>Configure automated proactive notifications for low inventory and expiry thresholds.</p>
            </div>
          </div>
          <div className="pf-section-body">
            {/* TOGGLE A: LOW STOCK ALERT */}
            <div className={`pf-toggle-card ${lowStockAlertEnabled ? 'active' : ''}`}>
              <div
                className="pf-toggle-header"
                onClick={() => setLowStockAlertEnabled(!lowStockAlertEnabled)}
              >
                <div className="pf-toggle-meta">
                  <div className="pf-toggle-icon">🔔</div>
                  <div>
                    <h6 className="pf-toggle-title">Low Stock Alert</h6>
                    <p className="pf-toggle-desc">
                      Get real-time notification alerts when inventory hits a minimum reorder threshold.
                    </p>
                  </div>
                </div>
                <label className="pf-switch" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={lowStockAlertEnabled}
                    onChange={(e) => setLowStockAlertEnabled(e.target.checked)}
                  />
                  <span className="pf-slider"></span>
                </label>
              </div>

              {/* Dynamic field reveal when Low Stock Alert is ON */}
              {lowStockAlertEnabled && (
                <div className="pf-toggle-content">
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-md-6">
                      <label className="pf-label">
                        Low Stock Alert Quantity / Threshold <span className="pf-label-required">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="pf-input"
                        placeholder="e.g. 10"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        required={lowStockAlertEnabled}
                      />
                      <small className="text-muted" style={{ fontSize: '11px' }}>
                        You will be notified whenever product stock reaches this quantity or falls below it.
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TOGGLE B: EXPIRY ALERT (ONLY FOR STORES WITH EXPIRY TRACKING) */}
            {hasExpiry && (
              <div className={`pf-toggle-card ${expiryAlertEnabled ? 'active' : ''}`}>
                <div
                  className="pf-toggle-header"
                  onClick={() => setExpiryAlertEnabled(!expiryAlertEnabled)}
                >
                  <div className="pf-toggle-meta">
                    <div className="pf-toggle-icon">⏳</div>
                    <div>
                      <h6 className="pf-toggle-title">Expiry Alert</h6>
                      <p className="pf-toggle-desc">
                        Track expiration dates and receive advance warnings before products expire.
                      </p>
                    </div>
                  </div>
                  <label className="pf-switch" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={expiryAlertEnabled}
                      onChange={(e) => setExpiryAlertEnabled(e.target.checked)}
                    />
                    <span className="pf-slider"></span>
                  </label>
                </div>

                {/* Dynamic fields reveal when Expiry Alert is ON */}
                {expiryAlertEnabled && (
                  <div className="pf-toggle-content">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="pf-label">
                          Expiry Date <span className="pf-label-required">*</span>
                        </label>
                        <input
                          type="date"
                          className="pf-input"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          required={expiryAlertEnabled}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="pf-label">
                          Alert Before Expiry (Days) <span className="pf-label-required">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className="pf-input"
                          placeholder="e.g. 7"
                          value={alertDaysBefore}
                          onChange={(e) => setAlertDaysBefore(e.target.value)}
                          required={expiryAlertEnabled}
                        />
                        <small className="text-muted" style={{ fontSize: '11px' }}>
                          Example: 7 days warning before the product reaches expiry date.
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pf-form-footer">
          {onCancel && (
            <button
              type="button"
              className="pf-btn-cancel"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="pf-btn-submit ms-auto"
            disabled={submitting}
          >
            {submitting ? 'Saving Product...' : isEditing ? '✓ Update Product' : '+ Add Product'}
          </button>
        </div>
      </form>

      {/* QUICK CATEGORY MODAL */}
      {showQuickCategoryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">Add New Category</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowQuickCategoryModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateQuickCategory}>
                <div className="modal-body p-4">
                  <label className="pf-label">Category Name</label>
                  <input
                    type="text"
                    className="pf-input"
                    placeholder="e.g. Beverages, Men's Wear, Antibiotics"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="modal-footer border-top py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm rounded-pill"
                    onClick={() => setShowQuickCategoryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    disabled={creatingCategory}
                  >
                    {creatingCategory ? 'Creating...' : '+ Create Category'}
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
              <div className="modal-header border-bottom py-3 px-4">
                <h5 className="modal-title fw-bold text-dark">Add New Brand</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowQuickBrandModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateQuickBrand}>
                <div className="modal-body p-4">
                  <label className="pf-label">Brand Name</label>
                  <input
                    type="text"
                    className="pf-input"
                    placeholder="e.g. Nike, Levi's, Cipla"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="modal-footer border-top py-2 px-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm rounded-pill"
                    onClick={() => setShowQuickBrandModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                    disabled={creatingBrand}
                  >
                    {creatingBrand ? 'Creating...' : '+ Create Brand'}
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
