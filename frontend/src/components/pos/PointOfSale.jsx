import React, { useState, useEffect, useCallback } from 'react';
import { productService, billingService, partnerService, categoryService } from '../../services';
import { Button } from '../common/Button';

export const PointOfSale = ({ initialView = 'terminal' }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [discountAmount, setDiscountAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');

  const [recentSales, setRecentSales] = useState([]);
  const [activeTab, setActiveTab] = useState(initialView); // 'terminal' (Make Bill) | 'history' (View Bill)

  const [submitting, setSubmitting] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [prods, custs, sales, cats] = await Promise.all([
        productService.getProducts({ limit: 100, isActive: true }),
        partnerService.getCustomers().catch(() => []),
        billingService.getSales({ limit: 50 }).catch(() => []),
        categoryService.getCategories(true).catch(() => [])
      ]);
      setProducts(prods || []);
      setCustomers(custs || []);
      setRecentSales(sales || []);
      setCategories(cats || []);
    } catch (err) {
      setErrorMsg('Failed to load catalog or sales history');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit || 'pcs',
          unit_price: Number(product.selling_price || 0),
          quantity: 1,
          total: Number(product.selling_price || 0)
        }
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty, total: newQty * item.unit_price };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const finalTotal = Math.max(0, subtotal - Number(discountAmount || 0) + Number(taxAmount || 0));

  const handleCheckout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (cart.length === 0) {
      setErrorMsg('Cart is empty. Add products to check out.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const salePayload = {
        customer_id: selectedCustomer ? Number(selectedCustomer) : null,
        payment_method: paymentMethod,
        discount_amount: Number(discountAmount || 0),
        tax_amount: Number(taxAmount || 0),
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      };

      const result = await billingService.createSale(salePayload);
      setViewInvoice(result);
      setSuccessMsg(`Invoice #${result.invoice_number} created successfully!`);
      setCart([]);
      setDiscountAmount('');
      setTaxAmount('');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed. Please check product stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const openInvoiceDetail = async (sale) => {
    try {
      const detail = await billingService.getSaleDetail(sale.id);
      setViewInvoice(detail);
    } catch {
      setViewInvoice(sale);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === null || p.category_id === selectedCategory || (p.category && p.category.id === selectedCategory);
    if (!matchesCat) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="point-of-sale-container">
      {/* Top Header & Mode Switcher */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            {activeTab === 'terminal' ? 'Make Bill (POS Terminal)' : 'View Bills (Invoices & Receipts)'}
          </h4>
          <p className="text-muted small mb-0">
            {activeTab === 'terminal'
              ? 'Instant barcode scanning, multi-tender billing, and automatic stock deduction.'
              : 'Search, review, and reprint customer sales invoices and tax receipts.'}
          </p>
        </div>

        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm px-4 fw-bold ${activeTab === 'terminal' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('terminal')}
            style={activeTab === 'terminal' ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
          >
            🛒 Make Bill
          </button>
          <button
            type="button"
            className={`btn btn-sm px-4 fw-bold ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('history')}
            style={activeTab === 'history' ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
          >
            📋 View Bills ({recentSales.length})
          </button>
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

      {activeTab === 'terminal' ? (
        <div className="row g-3">
          {/* Left Column: Product Selection Grid */}
          <div className="col-12 col-lg-7">
            <div className="bg-white rounded-4 p-3 border shadow-sm mb-3">
              {/* Barcode / Search Input */}
              <div className="input-group mb-3">
                <span className="input-group-text bg-light border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Scan barcode or search product by name, SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: '44px' }}
                />
                {search && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="d-flex gap-2 overflow-auto pb-2 mb-3">
                <button
                  type="button"
                  className={`btn btn-sm text-nowrap rounded-pill ${
                    selectedCategory === null ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setSelectedCategory(null)}
                  style={selectedCategory === null ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
                >
                  All Items
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`btn btn-sm text-nowrap rounded-pill ${
                      selectedCategory === c.id ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedCategory(c.id)}
                    style={selectedCategory === c.id ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
                  >
                    {c.icon || '📦'} {c.name}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div
                className="row g-2 overflow-auto"
                style={{ maxHeight: '520px', minHeight: '320px' }}
              >
                {filteredProducts.length === 0 ? (
                  <div className="col-12 text-center py-5 text-muted small">
                    No products matched your search.
                  </div>
                ) : (
                  filteredProducts.map((p) => (
                    <div key={p.id} className="col-6 col-md-4">
                      <div
                        onClick={() => addToCart(p)}
                        className="card h-100 p-2 border hover-shadow cursor-pointer rounded-3 transition-all"
                        style={{ cursor: 'pointer', minHeight: '110px' }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <span className="badge bg-light text-secondary border small">
                            {p.category_name || p.category?.name || 'Retail'}
                          </span>
                          <span className="small text-muted font-monospace">{p.sku}</span>
                        </div>
                        <div className="fw-bold text-dark small mt-2 text-truncate" title={p.name}>
                          {p.name}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                          <span className="fw-bold" style={{ color: '#FF6A1A' }}>
                            ₹ {Number(p.selling_price || 0).toLocaleString()}
                          </span>
                          <span className="badge bg-light text-muted border small">
                            {p.current_stock ?? p.stock ?? 0} {p.unit || 'pcs'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Cart */}
          <div className="col-12 col-lg-5">
            <div className="bg-white rounded-4 p-3 border shadow-sm h-100 d-flex flex-column">
              <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom d-flex justify-content-between align-items-center">
                <span>🛒 Current Order</span>
                <span className="badge rounded-pill" style={{ backgroundColor: '#FF6A1A' }}>
                  {cart.length} items
                </span>
              </h5>

              {/* Customer Selector */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Customer
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  style={{ borderRadius: '10px' }}
                >
                  <option value="">Walk-in Customer (General)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''} {c.balance > 0 ? `• Dues: ₹${c.balance}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div
                className="flex-grow-1 overflow-auto mb-3"
                style={{ minHeight: '180px', maxHeight: '260px' }}
              >
                {cart.length === 0 ? (
                  <div className="text-center py-5 text-muted small">
                    Cart is empty. Tap any product on the left to add items to this bill.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {cart.map((item) => (
                      <li
                        key={item.product_id}
                        className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center"
                      >
                        <div style={{ maxWidth: '180px' }}>
                          <div className="fw-semibold small text-dark text-truncate">{item.name}</div>
                          <div className="small text-muted">₹ {item.unit_price.toLocaleString()} / {item.unit}</div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-circle"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            -
                          </button>
                          <span className="fw-bold small px-2">{item.quantity}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-circle"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold small text-dark">₹ {item.total.toLocaleString()}</div>
                          <button
                            type="button"
                            className="btn btn-sm text-danger p-0 small"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Pricing Breakdown & Payment */}
              <div className="border-top pt-3 mt-auto">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Subtotal:</span>
                  <span className="fw-semibold text-dark">₹ {subtotal.toLocaleString()}</span>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="small text-secondary mb-0">Discount (₹):</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="0"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="small text-secondary mb-0">Tax / GST (₹):</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="form-control form-control-sm"
                      placeholder="0"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2 mb-3 border-top border-bottom">
                  <span className="fw-bold text-dark">Grand Total:</span>
                  <span className="h4 fw-bold mb-0" style={{ color: '#FF6A1A' }}>
                    ₹ {finalTotal.toLocaleString()}
                  </span>
                </div>

                {/* Tender Method Pills */}
                <div className="mb-3">
                  <label className="small fw-semibold text-secondary mb-1">Payment Method:</label>
                  <div className="btn-group w-100" role="group">
                    {[
                      { id: 'CASH', label: '💵 Cash' },
                      { id: 'UPI', label: '📱 UPI' },
                      { id: 'CARD', label: '💳 Card' },
                      { id: 'BANK_TRANSFER', label: '🏦 Bank' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`btn btn-sm ${paymentMethod === m.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPaymentMethod(m.id)}
                        style={paymentMethod === m.id ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-100 py-2 fw-bold"
                  disabled={submitting || cart.length === 0}
                  onClick={handleCheckout}
                  style={{
                    backgroundColor: '#FF6A1A',
                    borderColor: '#FF6A1A',
                    borderRadius: '9999px',
                    height: '46px',
                    boxShadow: '0 8px 24px rgba(255, 106, 26, 0.35)'
                  }}
                >
                  {submitting ? 'Processing Bill...' : `Complete Sale (₹ ${finalTotal.toLocaleString()}) →`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* View Bills (Sales Invoices History) */
        <div className="table-responsive bg-white rounded-4 border shadow-sm p-3">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Invoice #</th>
                <th style={{ fontSize: '13px' }}>Date & Time</th>
                <th style={{ fontSize: '13px' }}>Customer</th>
                <th style={{ fontSize: '13px' }}>Payment Mode</th>
                <th style={{ fontSize: '13px' }}>Total Amount</th>
                <th style={{ fontSize: '13px' }}>Status</th>
                <th style={{ fontSize: '13px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted small">
                    No sales invoices generated yet.
                  </td>
                </tr>
              ) : (
                recentSales.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-bold font-monospace" style={{ color: '#FF6A1A' }}>
                      #{s.invoice_number}
                    </td>
                    <td className="small text-muted">
                      {s.created_at || s.sale_date
                        ? new Date(s.created_at || s.sale_date).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{s.customer_name || 'Walk-in Customer'}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border small">
                        {s.payment_method}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">
                      ₹ {Number(s.total_amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle small">
                        {s.payment_status || 'PAID'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        onClick={() => openInvoiceDetail(s)}
                        style={{ color: '#FF6A1A', borderColor: '#FF6A1A' }}
                      >
                        🧾 View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {viewInvoice && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-4 rounded-4" id="printable-receipt">
              <div className="text-center py-2 border-bottom">
                <div style={{ fontSize: '36px' }}>🧾</div>
                <h4 className="fw-bold mb-0 text-dark">NEXORA MART</h4>
                <p className="text-muted small mb-0">Invoice #{viewInvoice.invoice_number}</p>
                <div className="small text-muted font-monospace">
                  {viewInvoice.created_at || viewInvoice.sale_date
                    ? new Date(viewInvoice.created_at || viewInvoice.sale_date).toLocaleString()
                    : new Date().toLocaleString()}
                </div>
              </div>

              <div className="modal-body py-3">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Customer:</span>
                  <span className="fw-semibold text-dark">
                    {viewInvoice.customer_name || 'Walk-in Customer'}
                  </span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Payment Mode:</span>
                  <span className="fw-semibold text-dark">{viewInvoice.payment_method}</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-3">
                  <span>Payment Status:</span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    {viewInvoice.payment_status || 'PAID'}
                  </span>
                </div>

                {/* Items Table */}
                {viewInvoice.items && viewInvoice.items.length > 0 && (
                  <div className="border rounded-3 p-2 mb-3 bg-light">
                    <div className="d-flex justify-content-between small fw-bold text-muted pb-1 border-bottom">
                      <span>Item</span>
                      <span>Qty x Rate</span>
                      <span>Total</span>
                    </div>
                    {viewInvoice.items.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between small py-1 border-bottom-dashed">
                        <span className="text-truncate" style={{ maxWidth: '140px' }}>
                          {item.product_name || `Item #${item.product_id}`}
                        </span>
                        <span>{item.quantity} × ₹{Number(item.unit_price).toLocaleString()}</span>
                        <span className="fw-semibold">₹{Number(item.total_price || (item.quantity * item.unit_price)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-light p-3 rounded-3 text-center mb-3">
                  <div className="small text-muted">Grand Total Paid</div>
                  <div className="h3 fw-bold text-success mb-0">
                    ₹ {Number(viewInvoice.total_amount || 0).toLocaleString()}
                  </div>
                </div>

                <p className="small text-muted text-center mb-0">
                  Thank you for shopping at Nexora Mart!
                </p>
              </div>

              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill flex-grow-1"
                  onClick={handlePrint}
                >
                  🖨️ Print Receipt
                </button>
                <Button
                  variant="primary"
                  className="rounded-pill flex-grow-1 fw-bold"
                  onClick={() => setViewInvoice(null)}
                  style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSale;
