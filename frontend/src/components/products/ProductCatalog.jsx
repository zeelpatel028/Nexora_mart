import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services';
import { ProductForm } from './ProductForm';
import { Button } from '../common/Button';
import { EmptyState, TableSkeleton } from '../common';

export const ProductCatalog = ({ onSelectProductForSale }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [cats, brandList, prods] = await Promise.all([
        categoryService.getCategories(true).catch(() => []),
        productService.getBrands().catch(() => []),
        productService.getProducts({
          categoryId: selectedCategory || null,
          brandId: selectedBrand || null,
          search: search.trim() || undefined,
          stockFilter: stockFilter || undefined,
          status: statusFilter || undefined
        })
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setBrands(Array.isArray(brandList) ? brandList : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedBrand, stockFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from catalog?`)) return;
    try {
      await productService.deleteProduct(id);
      setSuccessMsg(`Product "${name}" was safely removed from your store.`);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete product.');
    }
  };

  // Helper to extract store-specific detail entries
  const getStoreDetailEntries = (product) => {
    if (!product) return [];
    const possibleKeys = [
      'clothing_details',
      'grocery_details',
      'medicine_details',
      'electronics_details',
      'plastic_details',
      'handloom_details',
      'furniture_details',
      'agro_details',
      'store_details',
      'attributes'
    ];
    const excludedKeys = [
      'id', 'store_id', 'product_id', 'created_at', 'updated_at',
      'fssai_license', 'fssai_license_no', 'shelf_life_days', 'storage_condition',
      'storage_temperature', 'rack_number', 'bin_number', 'warehouse_location',
      'barcode', 'hsn_code', 'short_description'
    ];

    const entries = [];
    for (const key of possibleKeys) {
      if (product[key] && typeof product[key] === 'object' && Object.keys(product[key]).length > 0) {
        Object.entries(product[key]).forEach(([k, v]) => {
          if (excludedKeys.includes(k) || v === null || v === undefined || v === '') return;
          // Unpack nested clothing specifications
          if (k === 'specifications' && typeof v === 'object') {
            Object.entries(v).forEach(([subK, subV]) => {
              if (subV !== null && subV !== undefined && subV !== '') {
                entries.push([subK, subV]);
              }
            });
          } else if (typeof v !== 'object') {
            entries.push([k, v]);
          }
        });
        if (entries.length > 0) break;
      }
    }
    return entries;
  };

  return (
    <div className="product-catalog">
      {/* Top Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Store Product Catalog</h4>
          <p className="text-muted small mb-0">
            Isolated multi-store catalog with real-time stock, pricing, and retail attributes.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => {
              setEditingProduct(null);
              setShowAddForm(true);
            }}
          >
            + Add Product
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 small mb-3">
          ✓ {successMsg}
          <button type="button" className="btn-close py-2" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small mb-3">
          ⚠️ {errorMsg}
          <button type="button" className="btn-close py-2" onClick={() => setErrorMsg('')}></button>
        </div>
      )}

      {/* Product Form Modal / Overlay */}
      {(showAddForm || editingProduct) && (
        <div className="mb-4">
          <div className="bg-white rounded-4 p-4 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h4 className="fw-bold mb-1 text-dark">
                  {editingProduct ? `Edit Product: ${editingProduct.product_name || editingProduct.name}` : 'Add New Product'}
                </h4>
                <p className="text-muted small mb-0">
                  Configure product details, pricing, inventory, and store-specific attributes.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
              >
                ← Back to Catalog
              </button>
            </div>
            <ProductForm
              initialProduct={editingProduct}
              initialCategoryId={selectedCategory}
              onSuccess={(saved) => {
                setShowAddForm(false);
                setEditingProduct(null);
                setSuccessMsg(`Product "${saved.product_name || saved.name}" saved successfully!`);
                loadData();
              }}
              onCancel={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card border-0 bg-white shadow-sm rounded-4 mb-4 p-3">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">🔍</span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by name, SKU, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit">
                Search
              </button>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={selectedBrand || ''}
              onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock Alerts</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="col-6 col-md-1 text-end">
            {(selectedCategory || selectedBrand || stockFilter || search) && (
              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedBrand(null);
                  setStockFilter('');
                  setSearch('');
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Products Table */}
      {loading ? (
        <TableSkeleton rows={6} columns={6} />
      ) : products.length === 0 ? (
        search || selectedCategory || stockFilter ? (
          <EmptyState
            type="no-search-results"
            onAction={() => {
              setSearch('');
              setSelectedCategory(null);
              setSelectedBrand(null);
              setStockFilter('');
            }}
            actionLabel="Reset Search & Filters"
          />
        ) : (
          <EmptyState
            type="no-products"
            onAction={() => {
              setEditingProduct(null);
              setShowAddForm(true);
            }}
            actionLabel="+ Add Your First Product"
          />
        )
      ) : (
        <div className="table-responsive bg-white rounded-4 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Product & Identification</th>
                <th style={{ fontSize: '13px' }}>Category & Brand</th>
                <th style={{ fontSize: '13px' }}>Store Specifications</th>
                <th style={{ fontSize: '13px' }}>Price / MRP</th>
                <th style={{ fontSize: '13px' }}>Stock Status</th>
                <th style={{ fontSize: '13px' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.inventory_record?.current_stock ?? p.current_stock ?? 0;
                const minStock = p.inventory_record?.minimum_stock ?? p.min_stock_level ?? 5;
                const isLow = stock <= minStock && stock > 0;
                const isOut = stock <= 0;
                const detailEntries = getStoreDetailEntries(p);
                const pName = p.product_name || p.name;
                const sp = p.pricing?.selling_price ?? p.selling_price ?? 0;
                const pp = p.pricing?.purchase_price ?? p.purchase_price ?? 0;
                const mrpVal = p.pricing?.mrp ?? p.mrp;
                const unitSymbol = p.unit_record?.symbol || p.unit || 'pcs';

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {p.is_featured && <span title="Featured Product">⭐</span>}
                        <div>
                          <div className="fw-bold text-dark">{pName}</div>
                          <div className="small text-muted font-monospace d-flex align-items-center gap-1 flex-wrap">
                            {p.sku && <span>SKU: {p.sku}</span>}
                            {p.low_stock_alert_enabled && (
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-1 py-0" style={{ fontSize: '10px' }} title="Low Stock Alert Active">
                                🔔 ≤{p.low_stock_threshold || p.min_stock_level}
                              </span>
                            )}
                            {p.expiry_alert_enabled && p.expiry_date && (
                              <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle px-1 py-0" style={{ fontSize: '10px' }} title="Expiry Alert Active">
                                ⏳ Exp: {p.expiry_date.split('T')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="d-flex flex-column gap-1">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1 align-self-start">
                          {p.category?.name || p.category_name || 'General'}
                        </span>
                        {p.brand && (
                          <span className="small text-secondary fw-semibold">
                            🏷️ {p.brand.name}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '280px' }}>
                        {detailEntries.length === 0 ? (
                          <span className="small text-muted fst-italic">Standard item</span>
                        ) : (
                          detailEntries.slice(0, 3).map(([k, v]) => (
                            <span
                              key={k}
                              className="badge bg-light text-dark border small fw-normal"
                              title={`${k}: ${v}`}
                            >
                              <strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}
                            </span>
                          ))
                        )}
                        {detailEntries.length > 3 && (
                          <button
                            type="button"
                            className="badge bg-primary-subtle text-primary border-0 small cursor-pointer"
                            onClick={() => setViewingProduct(p)}
                          >
                            +{detailEntries.length - 3} more...
                          </button>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold text-dark fs-6">₹ {Number(sp).toLocaleString()}</div>
                      <div className="small text-muted">
                        Cost: ₹ {Number(pp).toLocaleString()}
                        {mrpVal && <span> • MRP: ₹ {Number(mrpVal).toLocaleString()}</span>}
                      </div>
                    </td>

                    <td>
                      <div>
                        <span className={`fw-bold ${isOut ? 'text-danger' : isLow ? 'text-warning' : 'text-success'}`}>
                          {stock} {unitSymbol}
                        </span>
                      </div>
                      <span
                        className={`badge ${
                          isOut
                            ? 'bg-danger text-white'
                            : isLow
                            ? 'bg-warning text-dark'
                            : 'bg-success-subtle text-success border border-success-subtle'
                        } small px-2 py-0`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>

                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {onSelectProductForSale && (
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => onSelectProductForSale(p)}
                            title="Add to Billing Cart"
                          >
                            + Bill
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => setViewingProduct(p)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setEditingProduct(p);
                            setShowAddForm(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          title="Edit Product"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(p.id, pName)}
                          title="Remove from Catalog"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW PRODUCT DETAILS MODAL */}
      {viewingProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom py-3 px-4">
                <div>
                  <h5 className="modal-title fw-bold text-dark">
                    {viewingProduct.product_name || viewingProduct.name}
                  </h5>
                  <span className="badge bg-primary px-2 py-1 small me-2">
                    {viewingProduct.category?.name || 'General Category'}
                  </span>
                  {viewingProduct.sku && (
                    <span className="font-monospace small text-muted">SKU: {viewingProduct.sku}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingProduct(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Product Image preview if available (Agro / Clothing) */}
                {(viewingProduct.images?.length > 0 || viewingProduct.image_url) && (
                  <div className="mb-3 text-center">
                    <img
                      src={viewingProduct.images?.[0]?.image_url || viewingProduct.image_url}
                      alt={viewingProduct.product_name}
                      style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px' }}
                      className="border shadow-sm"
                    />
                  </div>
                )}
                <div className="row g-4">
                  {/* Left Column: Pricing & Inventory */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-dark border-bottom pb-2">💰 Pricing & Financials</h6>
                    <div className="small">
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Retail Selling Price:</span>
                        <span className="fw-bold text-success fs-6">
                          ₹ {Number(viewingProduct.pricing?.selling_price ?? viewingProduct.selling_price ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Purchase Cost:</span>
                        <span>₹ {Number(viewingProduct.pricing?.purchase_price ?? viewingProduct.purchase_price ?? 0).toLocaleString()}</span>
                      </div>
                      {viewingProduct.pricing?.mrp && (
                        <div className="d-flex justify-content-between py-1">
                          <span className="text-muted">MRP:</span>
                          <span>₹ {Number(viewingProduct.pricing.mrp).toLocaleString()}</span>
                        </div>
                      )}
                      {viewingProduct.pricing?.wholesale_price && (
                        <div className="d-flex justify-content-between py-1">
                          <span className="text-muted">Wholesale:</span>
                          <span>₹ {Number(viewingProduct.pricing.wholesale_price).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Tax Treatment:</span>
                        <span className="text-capitalize">{viewingProduct.pricing?.tax_type || 'Exclusive'}</span>
                      </div>
                      {viewingProduct.pricing?.gst_rate !== undefined && (
                        <div className="d-flex justify-content-between py-1">
                          <span className="text-muted">GST Rate:</span>
                          <span>{viewingProduct.pricing.gst_rate}% (CGST {viewingProduct.pricing.gst_rate / 2}% + SGST {viewingProduct.pricing.gst_rate / 2}%)</span>
                        </div>
                      )}
                    </div>

                    <h6 className="fw-bold text-dark border-bottom pb-2 mt-4">📦 Inventory & Alerts</h6>
                    <div className="small">
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Current Stock:</span>
                        <span className="fw-bold">
                          {viewingProduct.inventory_record?.current_stock ?? viewingProduct.current_stock ?? 0}{' '}
                          {viewingProduct.unit_record?.symbol || viewingProduct.unit || 'pcs'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Low Stock Alert:</span>
                        <span className="fw-semibold">
                          {viewingProduct.low_stock_alert_enabled
                            ? `🔔 Enabled (Threshold: ≤ ${viewingProduct.low_stock_threshold || viewingProduct.min_stock_level || 5} units)`
                            : 'Disabled'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between py-1">
                        <span className="text-muted">Expiry Alert:</span>
                        <span className="fw-semibold">
                          {viewingProduct.expiry_alert_enabled && viewingProduct.expiry_date
                            ? `⏳ Enabled (${viewingProduct.expiry_date.split('T')[0]}, alert ${viewingProduct.alert_days_before || 7} days prior)`
                            : 'Disabled / N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Store-Specific Details */}
                  <div className="col-12 col-md-6">
                    <h6 className="fw-bold text-primary border-bottom pb-2">🏬 Store-Specific Attributes</h6>
                    <div className="bg-light rounded-3 p-3 small">
                      {getStoreDetailEntries(viewingProduct).length === 0 ? (
                        <p className="text-muted fst-italic mb-0">No custom store attributes recorded.</p>
                      ) : (
                        getStoreDetailEntries(viewingProduct).map(([k, v]) => (
                          <div key={k} className="d-flex justify-content-between py-1 border-bottom border-light">
                            <span className="text-muted text-capitalize">{k.replace(/_/g, ' ')}:</span>
                            <span className="fw-semibold text-dark text-end ms-2">
                              {typeof v === 'boolean' ? (v ? '✓ Yes' : '✕ No') : String(v)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Batches if any */}
                    {viewingProduct.batches && viewingProduct.batches.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold text-dark border-bottom pb-1 small">⏳ Active Batches</h6>
                        <ul className="list-unstyled small mb-0">
                          {viewingProduct.batches.map((b) => (
                            <li key={b.id || b.batch_number} className="py-1">
                              <strong>{b.batch_number}</strong> • Qty: {b.current_quantity} • Exp:{' '}
                              {b.expiry_date ? b.expiry_date.split('T')[0] : 'N/A'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top py-2 px-4">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill"
                  onClick={() => setViewingProduct(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-pill px-3"
                  onClick={() => {
                    const prodToEdit = viewingProduct;
                    setViewingProduct(null);
                    setEditingProduct(prodToEdit);
                    setShowAddForm(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  ✎ Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
