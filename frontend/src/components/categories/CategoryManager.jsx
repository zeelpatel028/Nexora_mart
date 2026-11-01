import React, { useState, useEffect } from 'react';
import { categoryService, storeService } from '../../services';
import { Button } from '../common/Button';

export const CategoryManager = ({ currentStore, onCategoryChanged, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(currentStore?.category_id || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Future category creation form state
  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏪');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories(false);
      setCategories(data);
      if (!selectedCatId && currentStore?.category_id) {
        setSelectedCatId(currentStore.category_id);
      }
    } catch (err) {
      setErrorMsg('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSelectStoreCategory = async (catId) => {
    setSaving(true);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const updated = await storeService.updateMyStore({ category_id: catId });
      setSelectedCatId(catId);
      setStatusMsg(`Store category switched to ${updated.category?.name || 'new category'}!`);
      if (onCategoryChanged) onCategoryChanged(updated);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update store category');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const created = await categoryService.createCategory({
        name: newCatName.trim(),
        code: newCatCode.trim() || newCatName.toLowerCase().replace(/\s+/g, '_'),
        description: newCatDesc.trim(),
        icon: newCatIcon
      });
      setStatusMsg(`New category '${created.name}' created!`);
      setShowNewCatForm(false);
      setNewCatName('');
      setNewCatCode('');
      setNewCatDesc('');
      await loadCategories();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3 p-3 p-md-4 shadow-sm border">
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Store Category Configuration</h4>
          <p className="text-muted small mb-0">
            Select your retail store sector. Dynamic forms, inventory models, and compliance rules adapt accordingly.
          </p>
        </div>
        {onClose && (
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="alert alert-success py-2 px-3 small mb-3">
          ✓ {statusMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-muted">
          <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
          <p className="small mb-0">Loading categories...</p>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {categories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <div key={cat.id} className="col-12 col-sm-6 col-lg-4">
                  <div
                    onClick={() => handleSelectStoreCategory(cat.id)}
                    className={`card h-100 p-3 border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-subtle shadow-sm'
                        : 'border-light-subtle bg-white hover-shadow'
                    }`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span style={{ fontSize: '24px' }}>{cat.icon || '🏬'}</span>
                      {isSelected ? (
                        <span className="badge bg-primary text-white px-2 py-1 small">
                          Active Store Category
                        </span>
                      ) : (
                        <span className="badge bg-light text-secondary border px-2 py-1 small">
                          Select
                        </span>
                      )}
                    </div>
                    <h6 className="fw-bold mb-1 text-dark">{cat.name}</h6>
                    <p className="small text-muted mb-2" style={{ minHeight: '36px' }}>
                      {cat.description || 'Sector specific inventory and dynamic attributes.'}
                    </p>
                    <div className="small text-secondary mt-auto">
                      <strong>{cat.fields?.length || 0}</strong> custom attributes configured
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin / Future Category Addition */}
          <div className="border-top pt-3">
            {!showNewCatForm ? (
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Need an unlisted category (e.g. Jewellery, Furniture, Toys, Sports)?
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowNewCatForm(true)}
                >
                  + Add New Store Category
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateNewCategory} className="bg-light p-3 rounded-3 border">
                <h6 className="fw-bold mb-3 text-dark">Add New Category (Dynamic System)</h6>
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-5">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Jewellery Store"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      System Code
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. jewellery"
                      value={newCatCode}
                      onChange={(e) => setNewCatCode(e.target.value)}
                    />
                  </div>
                  <div className="col-6 col-md-4">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Icon Emoji
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Brief description of products handled..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowNewCatForm(false)}
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Category'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryManager;

