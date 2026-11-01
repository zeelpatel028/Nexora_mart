import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services';
import { Button } from '../common/Button';

export const InventoryManager = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringAlerts, setExpiringAlerts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'movements'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick Action Modal State
  const [modalType, setModalType] = useState(null); // 'in' | 'out' | 'adjust'
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionQty, setActionQty] = useState('');
  const [actionBatch, setActionBatch] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, low, expiring, movs] = await Promise.all([
        inventoryService.getInventory(search),
        inventoryService.getLowStockAlerts().catch(() => []),
        inventoryService.getExpiringSoon(30).catch(() => []),
        inventoryService.getMovements(null, 50).catch(() => [])
      ]);
      setInventory(inv);
      setLowStockAlerts(low);
      setExpiringAlerts(expiring);
      setMovements(movs);
    } catch (err) {
      setErrorMsg('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setActionQty('');
    setActionBatch(item.batch_number || '');
    setActionNotes('');
    setErrorMsg('');
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionQty || Number(actionQty) <= 0) {
      setErrorMsg('Please specify a positive quantity');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const qty = Number(actionQty);
      if (modalType === 'in') {
        await inventoryService.stockIn({
          product_id: selectedItem.product_id,
          quantity: qty,
          batch_number: actionBatch || null,
          notes: actionNotes || 'Manual Stock Inward'
        });
        setStatusMsg(`Stock Inward completed for ${selectedItem.product_name}!`);
      } else if (modalType === 'out') {
        await inventoryService.stockOut({
          product_id: selectedItem.product_id,
          quantity: qty,
          reason: actionNotes || 'Stock Out / Damage / Discard'
        });
        setStatusMsg(`Stock Deduction completed for ${selectedItem.product_name}!`);
      } else if (modalType === 'adjust') {
        await inventoryService.adjustStock({
          product_id: selectedItem.product_id,
          counted_quantity: qty,
          reason: actionNotes || 'Periodic Inventory Count Adjustment'
        });
        setStatusMsg(`Stock reconciled for ${selectedItem.product_name}!`);
      }
      setModalType(null);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inventory-manager">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Real-Time Inventory & Stock Audit</h4>
          <p className="text-muted small mb-0">
            Multi-store warehouse tracking with batch controls, expiry notifications, and audit movements.
          </p>
        </div>
        <div className="btn-group">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('stock')}
          >
            Inventory Levels
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'movements' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('movements')}
          >
            Audit Log / Movements
          </button>
        </div>
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

      {/* Alert Banners */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="p-3 rounded-3 border bg-warning-subtle d-flex align-items-center gap-3">
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <div className="fw-bold text-dark">
                {lowStockAlerts.length} Low Stock Alert{lowStockAlerts.length !== 1 ? 's' : ''}
              </div>
              <div className="small text-muted">
                {lowStockAlerts.length > 0
                  ? 'Items reached or dropped below reorder threshold.'
                  : 'All stock levels currently within healthy operating buffers.'}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="p-3 rounded-3 border bg-danger-subtle d-flex align-items-center gap-3">
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <div className="fw-bold text-dark">
                {expiringAlerts.length} Expiring / Perishable Item{expiringAlerts.length !== 1 ? 's' : ''}
              </div>
              <div className="small text-muted">
                {expiringAlerts.length > 0
                  ? 'Batches expiring within 30 days or already past date.'
                  : 'No near-term expiration risks detected in inventory.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Search bar */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by product name, SKU, or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
              <p className="small mb-0">Loading stock entries...</p>
            </div>
          ) : (
            <div className="table-responsive bg-white rounded-3 border shadow-sm">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ fontSize: '13px' }}>Product</th>
                    <th style={{ fontSize: '13px' }}>SKU</th>
                    <th style={{ fontSize: '13px' }}>Quantity</th>
                    <th style={{ fontSize: '13px' }}>Reorder Threshold</th>
                    <th style={{ fontSize: '13px' }}>Batch / Expiry</th>
                    <th style={{ fontSize: '13px' }} className="text-end">Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory
                    .filter((item) => {
                      if (!search) return true;
                      const q = search.toLowerCase();
                      return (
                        (item.product_name || '').toLowerCase().includes(q) ||
                        (item.sku || '').toLowerCase().includes(q) ||
                        (item.batch_number || '').toLowerCase().includes(q)
                      );
                    })
                    .map((item) => {
                      const isLow = item.quantity <= item.reorder_level;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-bold text-dark">{item.product_name}</div>
                          </td>
                          <td>
                            <span className="font-monospace text-secondary small">{item.sku}</span>
                          </td>
                          <td>
                            <span className={`fw-bold ${isLow ? 'text-danger' : 'text-success'}`}>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td>
                            <span className="small text-muted">
                              {item.reorder_level} {item.unit}
                            </span>
                          </td>
                          <td>
                            <div className="small">
                              {item.batch_number ? (
                                <div>Batch: <strong>{item.batch_number}</strong></div>
                              ) : (
                                <span className="text-muted">No Batch</span>
                              )}
                              {item.expiry_date && (
                                <div className="text-danger">
                                  Exp: {item.expiry_date.substring(0, 10)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => openActionModal('in', item)}
                                title="Stock In"
                              >
                                + In
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => openActionModal('out', item)}
                                title="Stock Out"
                              >
                                - Out
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => openActionModal('adjust', item)}
                                title="Reconcile Count"
                              >
                                ⚙ Adjust
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
        </>
      ) : (
        /* Movements Audit Table */
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Date</th>
                <th style={{ fontSize: '13px' }}>Product</th>
                <th style={{ fontSize: '13px' }}>Type</th>
                <th style={{ fontSize: '13px' }}>Change</th>
                <th style={{ fontSize: '13px' }}>Before / After</th>
                <th style={{ fontSize: '13px' }}>Reference / Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className="small text-muted">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : 'N/A'}
                  </td>
                  <td className="fw-semibold text-dark">{m.product_name}</td>
                  <td>
                    <span
                      className={`badge ${
                        m.movement_type === 'IN' || m.movement_type === 'PURCHASE'
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : m.movement_type === 'SALE'
                          ? 'bg-primary-subtle text-primary border border-primary-subtle'
                          : 'bg-warning-subtle text-warning border border-warning-subtle'
                      } px-2 py-1 small`}
                    >
                      {m.movement_type}
                    </span>
                  </td>
                  <td className="fw-bold">
                    {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                  </td>
                  <td className="small text-secondary">
                    {m.previous_stock} ➔ {m.new_stock}
                  </td>
                  <td className="small text-muted">
                    {m.notes || m.reference_id || 'System movement'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Action Modal */}
      {modalType && selectedItem && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {modalType === 'in'
                    ? `Stock In: ${selectedItem.product_name}`
                    : modalType === 'out'
                    ? `Stock Out: ${selectedItem.product_name}`
                    : `Adjust Inventory Count: ${selectedItem.product_name}`}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalType(null)}
                ></button>
              </div>
              <form onSubmit={handleActionSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Current Stock:{' '}
                      <strong className="text-dark">
                        {selectedItem.quantity} {selectedItem.unit}
                      </strong>
                    </label>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      {modalType === 'adjust' ? 'Physical Counted Quantity *' : 'Quantity *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-control"
                      placeholder="0.00"
                      value={actionQty}
                      onChange={(e) => setActionQty(e.target.value)}
                      required
                    />
                  </div>
                  {modalType === 'in' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. BATCH-2026-X"
                        value={actionBatch}
                        onChange={(e) => setActionBatch(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Notes / Reason
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        modalType === 'out'
                          ? 'e.g. Expired product discard / Damaged packaging'
                          : 'Notes...'
                      }
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalType(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Confirm Update'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;

