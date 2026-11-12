import React, { useState, useEffect } from 'react';
import { billingService, partnerService, productService } from '../../services';
import { Button } from '../common/Button';

export const PurchaseManager = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New purchase order state
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paidAmount, setPaidAmount] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([
    { product_id: '', quantity: 10, unit_cost: 0, batch_number: '', expiry_date: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pur, sups, prods] = await Promise.all([
        billingService.getPurchases({ limit: 50 }),
        partnerService.getSuppliers().catch(() => []),
        productService.getProducts({ limit: 100, isActive: true }).catch(() => [])
      ]);
      setPurchases(pur);
      setSuppliers(sups);
      setProducts(prods);
    } catch (err) {
      setErrorMsg('Failed to load purchase records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItemLine = () => {
    setPurchaseItems((prev) => [
      ...prev,
      { product_id: '', quantity: 1, unit_cost: 0, batch_number: '', expiry_date: '' }
    ]);
  };

  const handleRemoveItemLine = (idx) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setPurchaseItems((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      // If product_id changed, auto-populate unit_cost with product purchase_price
      if (field === 'product_id') {
        const prod = products.find((p) => p.id === Number(value));
        if (prod && prod.purchase_price) {
          updated[idx].unit_cost = Number(prod.purchase_price);
        }
      }
      return updated;
    });
  };

  const totalCost = purchaseItems.reduce(
    (sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_cost || 0)),
    0
  );

  const handleSubmitPurchase = async (e) => {
    e.preventDefault();
    if (purchaseItems.some((it) => !it.product_id)) {
      setErrorMsg('Please select a product for all line items');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        supplier_id: selectedSupplier ? Number(selectedSupplier) : null,
        invoice_number: invoiceNumber.trim() || `PUR-${Date.now()}`,
        payment_method: paymentMethod,
        paid_amount: paidAmount !== '' ? Number(paidAmount) : totalCost,
        items: purchaseItems.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
          unit_cost: Number(it.unit_cost),
          batch_number: it.batch_number.trim() || null,
          expiry_date: it.expiry_date || null
        }))
      };

      const res = await billingService.createPurchase(payload);
      setStatusMsg(`Purchase Order #${res.invoice_number} received! Warehouse stock updated.`);
      setShowAddModal(false);
      setInvoiceNumber('');
      setPurchaseItems([{ product_id: '', quantity: 10, unit_cost: 0, batch_number: '', expiry_date: '' }]);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="purchase-manager">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Supplier Purchases & Orders</h4>
          <p className="text-muted small mb-0">
            Log procurement orders, record batch details, and automatically update warehouse stock.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          + New Purchase Order
        </Button>
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
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
          <p className="small mb-0">Loading purchases...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border">
          <p className="text-muted mb-3">No purchase orders recorded yet.</p>
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            Record First Purchase Order
          </Button>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Invoice #</th>
                <th style={{ fontSize: '13px' }}>Date</th>
                <th style={{ fontSize: '13px' }}>Supplier</th>
                <th style={{ fontSize: '13px' }}>Items</th>
                <th style={{ fontSize: '13px' }}>Total Amount</th>
                <th style={{ fontSize: '13px' }}>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="fw-bold font-monospace text-primary">{p.invoice_number}</td>
                  <td className="small text-muted">
                    {p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="fw-semibold text-dark">{p.supplier_name}</td>
                  <td>{p.items_count} products</td>
                  <td className="fw-bold">₹ {Number(p.total_amount).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.payment_status === 'PAID'
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-warning-subtle text-warning border border-warning-subtle'
                      } px-2 py-1 small`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Purchase Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Record Incoming Purchase / Inward Shipment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmitPurchase}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Supplier / Vendor
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                      >
                        <option value="">Direct Procurement / Self Stock</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.company_name || s.phone || 'Supplier'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Supplier Invoice Reference #
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. INV-VENDOR-8932"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="small fw-bold text-dark mb-0">Purchased Products</label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleAddItemLine}
                      >
                        + Add Item Line
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ fontSize: '12px' }}>Product *</th>
                            <th style={{ fontSize: '12px', width: '90px' }}>Quantity *</th>
                            <th style={{ fontSize: '12px', width: '100px' }}>Cost (₹) *</th>
                            <th style={{ fontSize: '12px' }}>Batch #</th>
                            <th style={{ fontSize: '12px' }}>Expiry Date</th>
                            <th style={{ width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseItems.map((it, idx) => (
                            <tr key={idx}>
                              <td>
                                <select
                                  className="form-select form-select-sm"
                                  value={it.product_id}
                                  onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                  required
                                >
                                  <option value="">-- Choose Product --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.sku})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="any"
                                  min="0.01"
                                  className="form-control form-control-sm"
                                  value={it.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="form-control form-control-sm"
                                  value={it.unit_cost}
                                  onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                                  required
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Batch"
                                  value={it.batch_number}
                                  onChange={(e) => handleItemChange(idx, 'batch_number', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="date"
                                  className="form-control form-control-sm"
                                  value={it.expiry_date}
                                  onChange={(e) => handleItemChange(idx, 'expiry_date', e.target.value)}
                                />
                              </td>
                              <td className="text-end">
                                {purchaseItems.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger py-0 px-2"
                                    onClick={() => handleRemoveItemLine(idx)}
                                  >
                                    ✕
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                    <span className="fw-semibold text-secondary">Total Inward Valuation:</span>
                    <span className="h4 fw-bold mb-0" style={{ color: '#FF6A1A' }}>₹ {totalCost.toLocaleString()}</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Recording Inward...' : 'Receive Stock & Save'}
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

export default PurchaseManager;

