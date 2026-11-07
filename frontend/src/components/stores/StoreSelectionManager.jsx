import React, { useState, useEffect, useCallback } from 'react';
import { storeService, categoryService } from '../../services';
import { Button } from '../common/Button';

export const StoreSelectionManager = ({ onStoreChanged }) => {
  const [stores, setStores] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create Store Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [taxNumber, setTaxNumber] = useState('');
  const [creating, setCreating] = useState(false);
  const [switchingId, setSwitchingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allStores, myStore, catList] = await Promise.all([
        storeService.getStores().catch(() => []),
        storeService.getMyStore().catch(() => null),
        categoryService.getCategories(true).catch(() => [])
      ]);
      setStores(allStores || []);
      setCurrentStore(myStore);
      setCategories(catList || []);
      if (!categoryId && catList.length > 0) {
        setCategoryId(catList[0].id);
      }
    } catch (err) {
      setErrorMsg('Failed to load store list');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSwitchStore = async (store) => {
    setSwitchingId(store.id);
    setErrorMsg('');
    try {
      await storeService.switchStore(store.id);
      setCurrentStore(store);
      setSuccessMsg(`Switched active store context to "${store.name}".`);
      if (onStoreChanged) onStoreChanged(store);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to switch store');
    } finally {
      setSwitchingId(null);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Store name is required');
      return;
    }
    setCreating(true);
    setErrorMsg('');
    try {
      const newStore = await storeService.createStore({
        name: name.trim(),
        category_id: Number(categoryId),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        tax_number: taxNumber.trim() || undefined,
        currency: 'INR'
      });
      setSuccessMsg(`Store "${name}" created successfully with full document sequence & configuration.`);
      setShowCreateModal(false);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setTaxNumber('');
      setCurrentStore(newStore);
      if (onStoreChanged) onStoreChanged(newStore);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create store');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="store-selection-container">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Multi-Store Management & Switcher</h4>
          <p className="text-muted small mb-0">
            Manage multiple retail branches under your merchant account with isolated inventory and sales records.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            style={{ borderRadius: '9999px', backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
          >
            + Create New Store
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

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
          <p className="small mb-0">Loading your retail stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border p-4">
          <div style={{ fontSize: '42px' }}>🏬</div>
          <h5 className="fw-bold mt-2">No Stores Configured</h5>
          <p className="text-muted small mb-3">Create your first retail outlet to begin managing POS and inventory.</p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Create Store
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {stores.map((s) => {
            const isCurrent = currentStore && currentStore.id === s.id;
            return (
              <div key={s.id} className="col-12 col-md-6 col-xl-4">
                <div
                  className={`card h-100 p-3 border shadow-sm rounded-4 transition-all ${
                    isCurrent ? 'border-primary border-2 bg-light' : 'bg-white'
                  }`}
                  style={{ position: 'relative' }}
                >
                  {isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#FF6A1A',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '9999px'
                      }}
                    >
                      ✓ ACTIVE STORE
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        backgroundColor: '#FFF0E8',
                        color: '#FF6A1A',
                        fontSize: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {s.category?.icon || '🏬'}
                    </div>

                    <div className="flex-grow-1 min-w-0 pr-4">
                      <h5 className="fw-bold mb-0 text-dark text-truncate" title={s.name}>
                        {s.name}
                      </h5>
                      <span className="small text-muted font-monospace">{s.code}</span>
                      <div className="badge bg-secondary-subtle text-secondary small d-inline-block mt-1">
                        {s.category?.name || 'Retail'}
                      </div>
                    </div>
                  </div>

                  <div className="small text-secondary mb-2">
                    {s.city ? `📍 ${s.address || s.city}` : '📍 Primary Location'}
                  </div>

                  {s.phone && (
                    <div className="small text-muted mb-1">
                      📞 {s.phone}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                    <div>
                      <span className="small text-muted" style={{ fontSize: '11px' }}>Base Currency:</span>
                      <span className="fw-bold text-dark ms-1">{s.currency_symbol || '₹'} {s.currency || 'INR'}</span>
                    </div>

                    {isCurrent ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                        Selected & Online
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                        onClick={() => handleSwitchStore(s)}
                        disabled={switchingId === s.id}
                        style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                      >
                        {switchingId === s.id ? 'Switching...' : 'Switch to Store'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-3 rounded-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="fw-bold mb-1">Create New Retail Store</h5>
                  <p className="text-muted small mb-0">Set up isolated store catalog & billing sequence</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                />
              </div>

              <form onSubmit={handleCreateStore}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Store Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Nexora Mart - Downtown"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Retail Category *</label>
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      style={{ borderRadius: '12px' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon || '🏬'} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Store Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Shop No., Commercial Complex, Main Road"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Contact Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="store@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">GSTIN / Tax ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="27AAAAA0000A1Z5"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={creating}
                    style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                  >
                    {creating ? 'Provisioning Store...' : 'Create & Launch Store'}
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

export default StoreSelectionManager;

