import React, { useState, useEffect } from 'react';
import { categoryService, productService, unitService } from '../../services';
import { Button } from '../common/Button';

export const ProductForm = ({
  initialProduct = null,
  initialCategoryId = null,
  onSuccess,
  onCancel
}) => {
  const isEditing = Boolean(initialProduct && initialProduct.id);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialProduct?.category_id || initialCategoryId || ''
  );
  const [dynamicFields, setDynamicFields] = useState([]);
  const [availableUnits, setAvailableUnits] = useState(['pcs', 'kg', 'g', 'pack', 'box', 'meter', 'pair', 'bottle']);
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Core Form State
  const [name, setName] = useState(initialProduct?.name || '');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || '');
  const [purchasePrice, setPurchasePrice] = useState(initialProduct?.purchase_price ?? '');
  const [sellingPrice, setSellingPrice] = useState(initialProduct?.selling_price ?? '');
  const [mrp, setMrp] = useState(initialProduct?.mrp ?? '');
  const [unit, setUnit] = useState(initialProduct?.unit || 'pcs');
  const [minStockLevel, setMinStockLevel] = useState(initialProduct?.min_stock_level ?? 5);
  const [initialStock, setInitialStock] = useState(initialProduct?.current_stock ?? 0);
  const [imageUrl, setImageUrl] = useState(initialProduct?.image_url || '');
  const [hasVariants, setHasVariants] = useState(initialProduct?.has_variants || false);

  // Dynamic Attributes State (key-value store based on category fields)
  const [attributes, setAttributes] = useState(initialProduct?.attributes || {});

  // Variants State
  const [variants, setVariants] = useState(
    initialProduct?.variants && initialProduct.variants.length > 0
      ? initialProduct.variants.map((v) => ({
          sku: v.sku || '',
          attributes: v.attributes || {},
          price: v.price ?? initialProduct.selling_price ?? 0,
          stock: v.inventory?.quantity ?? 0
        }))
      : []
  );

  // Load Categories & Units
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      try {
        const [catList, unitList] = await Promise.all([
          categoryService.getCategories(true),
          unitService.getUnits().catch(() => [])
        ]);
        if (isMounted) {
          setCategories(catList);
          if (unitList && unitList.length > 0) {
            setAvailableUnits(unitList.map((u) => u.symbol));
          }
          if (!selectedCategoryId && catList.length > 0) {
            setSelectedCategoryId(catList[0].id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage('Failed to load store categories. Please check connection.');
        }
      }
    }
    loadMetadata();
    return () => { isMounted = false; };
  }, []);

  // Fetch Category Dynamic Fields when category changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    let isMounted = true;
    async function loadFields() {
      setLoadingFields(true);
      try {
        const fields = await categoryService.getCategoryFields(selectedCategoryId);
        if (isMounted) {
          setDynamicFields(fields);
          // If a category specifies default units or variants, apply them
          const currentCat = categories.find((c) => c.id === Number(selectedCategoryId));
          if (currentCat && currentCat.code) {
            if (['clothing', 'footwear'].includes(currentCat.code)) {
              setHasVariants(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load category fields:', err);
      } finally {
        if (isMounted) setLoadingFields(false);
      }
    }
    loadFields();
    return () => { isMounted = false; };
  }, [selectedCategoryId, categories]);

  const handleAttributeChange = (fieldName, value) => {
    setAttributes((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        sku: '',
        attributes: {},
        price: sellingPrice || 0,
        stock: 0
      }
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      if (field === 'price' || field === 'stock' || field === 'sku') {
        updated[index][field] = value;
      } else {
        updated[index].attributes = {
          ...updated[index].attributes,
          [field]: value
        };
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!name.trim()) {
      setErrorMessage('Product name is required.');
      return;
    }
    if (!selectedCategoryId) {
      setErrorMessage('Store category selection is required.');
      return;
    }
    if (sellingPrice === '' || Number(sellingPrice) < 0) {
      setErrorMessage('Valid selling price is required.');
      return;
    }

    // Dynamic field validation
    for (const field of dynamicFields) {
      if (field.is_required) {
        const val = attributes[field.field_name];
        if (val === undefined || val === null || String(val).trim() === '') {
          setErrorMessage(`Category requirement: '${field.label || field.field_name}' cannot be empty.`);
          return;
        }
      }
    }

    const payload = {
      name: name.trim(),
      category_id: Number(selectedCategoryId),
      barcode: barcode.trim() || null,
      purchase_price: purchasePrice !== '' ? Number(purchasePrice) : 0,
      selling_price: Number(sellingPrice),
      mrp: mrp !== '' ? Number(mrp) : null,
      unit: unit || 'pcs',
      min_stock_level: Number(minStockLevel) || 5,
      image_url: imageUrl.trim() || null,
      has_variants: hasVariants,
      attributes: attributes,
      variants: hasVariants ? variants : []
    };

    if (!isEditing && initialStock > 0) {
      payload.initial_stock = Number(initialStock);
    }

    setSubmitting(true);
    try {
      let saved;
      if (isEditing) {
        saved = await productService.updateProduct(initialProduct.id, payload);
      } else {
        saved = await productService.createProduct(payload);
      }
      if (onSuccess) onSuccess(saved);
    } catch (err) {
      setErrorMessage(err.message || 'Error saving product. Please verify values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form p-3 p-md-4 bg-white rounded-3 shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h4 className="mb-1 text-dark fw-bold">
            {isEditing ? `Edit Product: ${initialProduct?.name}` : 'Add New Category Product'}
          </h4>
          <p className="text-muted small mb-0">
            Dynamic attributes and rules adapt according to store category standards.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancel}
          >
            ✕ Close
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Category Selection */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Store Category <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={isEditing || categories.length === 0}
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon || '📦'} {cat.name} ({cat.code})
              </option>
            ))}
          </select>
          <div className="form-text small">
            Fields below automatically change based on this category.
          </div>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Product Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Organic Rolled Oats 1kg / Paracetamol 500mg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      {/* 2. Core Pricing & Measurement */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Selling Price (₹) <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control"
            placeholder="0.00"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Purchase Cost (₹)
          </label>
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

        <div className="col-6 col-md-3">
          <label className="form-label fw-semibold text-secondary small mb-1">
            MRP (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control"
            placeholder="Optional MRP"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
          />
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Measurement Unit <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            {availableUnits.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Barcode & Inventory Tracking */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Barcode / EAN / UPC
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Scan or enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>

        <div className="col-6 col-md-4">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Min Stock Alert Level
          </label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={minStockLevel}
            onChange={(e) => setMinStockLevel(e.target.value)}
          />
        </div>

        {!isEditing && (
          <div className="col-6 col-md-4">
            <label className="form-label fw-semibold text-secondary small mb-1">
              Opening Stock Quantity
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              placeholder="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* 4. DYNAMIC CATEGORY-SPECIFIC ATTRIBUTES */}
      <div className="p-3 bg-light rounded-3 border mb-4">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <span>✨</span> Category-Specific Specifications
          </h6>
          {loadingFields && <span className="spinner-border spinner-border-sm text-primary"></span>}
        </div>
        <p className="small text-muted mb-3">
          Configured rules and properties tailored specifically for this retail sector.
        </p>

        {dynamicFields.length === 0 && !loadingFields ? (
          <p className="text-muted small mb-0 fst-italic">
            Standard product attributes apply to this category.
          </p>
        ) : (
          <div className="row g-3">
            {dynamicFields.map((field) => {
              const val = attributes[field.field_name] ?? '';
              const isRequired = field.is_required;

              return (
                <div key={field.id || field.field_name} className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small mb-1">
                    {field.label} {isRequired && <span className="text-danger">*</span>}
                  </label>

                  {/* Render based on field_type */}
                  {field.field_type === 'select' && field.options && field.options.length > 0 ? (
                    <select
                      className="form-select"
                      value={val}
                      onChange={(e) => handleAttributeChange(field.field_name, e.target.value)}
                      required={isRequired}
                    >
                      <option value="">-- Select {field.label} --</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.field_type === 'date' ? (
                    <input
                      type="date"
                      className="form-control"
                      value={typeof val === 'string' ? val.substring(0, 10) : ''}
                      onChange={(e) => handleAttributeChange(field.field_name, e.target.value)}
                      required={isRequired}
                    />
                  ) : field.field_type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      className="form-control"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={val}
                      onChange={(e) => handleAttributeChange(field.field_name, e.target.value)}
                      required={isRequired}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      value={val}
                      onChange={(e) => handleAttributeChange(field.field_name, e.target.value)}
                      required={isRequired}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. VARIANTS TOGGLE & CONFIGURATION (e.g. Size / Color for Clothing & Footwear) */}
      <div className="mb-4">
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="variantSwitch"
            checked={hasVariants}
            onChange={(e) => {
              setHasVariants(e.target.checked);
              if (e.target.checked && variants.length === 0) {
                handleAddVariant();
              }
            }}
          />
          <label className="form-check-label fw-semibold small text-dark" htmlFor="variantSwitch">
            Enable Multi-Variants (Size, Color, Model breakdown)
          </label>
        </div>

        {hasVariants && (
          <div className="border rounded-3 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-bold text-secondary">Product Variant Items</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={handleAddVariant}
              >
                + Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="small text-muted mb-0">No variants added yet. Click &apos;+ Add Variant&apos;.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ fontSize: '12px' }}>SKU</th>
                      <th style={{ fontSize: '12px' }}>Size / Spec</th>
                      <th style={{ fontSize: '12px' }}>Color / Finish</th>
                      <th style={{ fontSize: '12px' }}>Price (₹)</th>
                      <th style={{ fontSize: '12px' }}>Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Auto-generated"
                            value={v.sku}
                            onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. M, XL, 42"
                            value={v.attributes?.size || ''}
                            onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Blue, Black"
                            value={v.attributes?.color || ''}
                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            className="form-control form-control-sm"
                            value={v.price}
                            onChange={(e) => handleVariantChange(idx, 'price', Number(e.target.value))}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, 'stock', Number(e.target.value))}
                          />
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger py-0 px-2"
                            onClick={() => handleRemoveVariant(idx)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

