import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services';
import { ProductForm } from './ProductForm';
import { Button } from '../common/Button';

export const ProductCatalog = ({ onSelectProductForSale }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        categoryService.getCategories(true),
        productService.getProducts({
          categoryId: selectedCategory,
          search: search.trim()
        })
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setErrorMsg('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      setSuccessMsg(`Product "${name}" deactivated.`);
      loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="product-catalog">
      {/* Top Action Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Multi-Category Product Catalog</h4>
          <p className="text-muted small mb-0">
            Unified catalog supporting 10 retail sectors with dynamic specifications & variants.
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
        <div className="alert alert-success py-2 px-3 small mb-3">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
        <button
          type="button"
          className={`btn btn-sm text-nowrap rounded-pill ${
            selectedCategory === null ? 'btn-primary' : 'btn-outline-secondary'
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`btn btn-sm text-nowrap rounded-pill ${
              selectedCategory === c.id ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setSelectedCategory(c.id)}
          >
            {c.icon || '📦'} {c.name}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-outline-secondary" type="submit">
            Search
          </button>
        </div>
      </form>

      {/* Product Form Modal / Overlay */}
      {(showAddForm || editingProduct) && (
        <div className="mb-4">
          <ProductForm
            initialProduct={editingProduct}
            initialCategoryId={selectedCategory}
            onSuccess={(saved) => {
              setShowAddForm(false);
              setEditingProduct(null);
              setSuccessMsg(`Product "${saved.name}" saved successfully!`);
              loadData();
            }}
            onCancel={() => {
              setShowAddForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary spinner-border-sm mb-2"></div>
          <p className="small mb-0">Loading products catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <p className="text-muted mb-3">No products found in this category.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              setShowAddForm(true);
            }}
          >
            Create Your First Product
          </Button>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Product & SKU</th>
                <th style={{ fontSize: '13px' }}>Category</th>
                <th style={{ fontSize: '13px' }}>Dynamic Attributes</th>
                <th style={{ fontSize: '13px' }}>Price / Cost</th>
                <th style={{ fontSize: '13px' }}>Stock Level</th>
                <th style={{ fontSize: '13px' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock = p.current_stock ?? 0;
                const minStock = p.min_stock_level ?? 5;
                const isLow = stock <= minStock;
                const attrEntries = Object.entries(p.attributes || {}).filter(
                  ([, v]) => v !== null && v !== undefined && v !== ''
                );

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-bold text-dark">{p.name}</div>
                      <div className="small text-muted">
                        SKU: <span className="font-monospace text-secondary">{p.sku}</span>
                        {p.barcode && <span> • Barcode: {p.barcode}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                        {p.category_name || 'General'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '320px' }}>
                        {attrEntries.length === 0 ? (
                          <span className="small text-muted fst-italic">Standard item</span>
                        ) : (
                          attrEntries.slice(0, 4).map(([k, v]) => (
                            <span
                              key={k}
                              className="badge bg-light text-dark border small fw-normal"
                              title={`${k}: ${v}`}
                            >
                              <strong>{k}:</strong> {String(v)}
                            </span>
                          ))
                        )}
                        {attrEntries.length > 4 && (
                          <span className="badge bg-light text-muted border small">
                            +{attrEntries.length - 4} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">${Number(p.selling_price).toFixed(2)}</div>
                      <div className="small text-muted">
                        Cost: ${Number(p.purchase_price || 0).toFixed(2)} / {p.unit}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className={`fw-bold ${isLow ? 'text-danger' : 'text-success'}`}>
                          {stock} {p.unit}
                        </span>
                      </div>
                      <span
                        className={`badge ${
                          stock === 0
                            ? 'bg-danger text-white'
                            : isLow
                            ? 'bg-warning text-dark'
                            : 'bg-success-subtle text-success border border-success-subtle'
                        } small px-2 py-0`}
                      >
                        {stock === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Adequate'}
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
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setEditingProduct(p);
                            setShowAddForm(false);
                          }}
                          title="Edit Product"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(p.id, p.name)}
                          title="Deactivate"
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
    </div>
  );
};

export default ProductCatalog;

