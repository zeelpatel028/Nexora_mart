import React, { useState, useEffect } from 'react';
import { productService, billingService, partnerService } from '../../services';
import { Button } from '../common/Button';

export const PointOfSale = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  const [recentSales, setRecentSales] = useState([]);
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'history'

  const [submitting, setSubmitting] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      const [prods, custs, sales] = await Promise.all([
        productService.getProducts({ limit: 100, isActive: true }),
        partnerService.getCustomers().catch(() => []),
        billingService.getSales({ limit: 20 }).catch(() => [])
      ]);
      setProducts(prods);
      setCustomers(custs);
      setRecentSales(sales);
    } catch (err) {
      setErrorMsg('Failed to load catalog or customers');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
          unit: product.unit,
          unit_price: Number(product.selling_price),
          quantity: 1,
          total: Number(product.selling_price)
        }
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
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
    e.preventDefault();
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

      const invoice = await billingService.createSale(salePayload);
      setLastInvoice(invoice);
      setSuccessMsg(`Invoice ${invoice.invoice_number} created successfully!`);
      setCart([]);
      setDiscountAmount(0);
      setTaxAmount(0);
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="point-of-sale">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Point-of-Sale (POS) & Smart Invoicing</h4>
          <p className="text-muted small mb-0">
            Instant billing, automatic inventory deduction, and customer invoice tracking.
          </p>
        </div>
        <div className="btn-group">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'terminal' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('terminal')}
          >
            Billing Terminal
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            Invoices & Sales History
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
            <div className="bg-white rounded-3 p-3 border shadow-sm mb-3">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Scan barcode or type product name/SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div
                className="row g-2 overflow-auto"
                style={{ maxHeight: '550px' }}
              >
                {products
                  .filter((p) => {
                    if (!search) return true;
                    const q = search.toLowerCase();
                    return (
                      p.name.toLowerCase().includes(q) ||
                      p.sku.toLowerCase().includes(q) ||
                      (p.barcode && p.barcode.toLowerCase().includes(q))
                    );
                  })
                  .map((p) => (
                    <div key={p.id} className="col-6 col-md-4">
                      <div
                        onClick={() => addToCart(p)}
                        className="card h-100 p-2 border hover-shadow cursor-pointer transition-all"
                        style={{ cursor: 'pointer', minHeight: '110px' }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <span className="badge bg-light text-secondary border small">
                            {p.category_name || 'Item'}
                          </span>
                          <span className="small text-muted font-monospace">{p.sku}</span>
                        </div>
                        <div className="fw-semibold text-dark small mt-1 text-truncate" title={p.name}>
                          {p.name}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                          <span className="fw-bold text-primary">
                            ${Number(p.selling_price).toFixed(2)}
                          </span>
                          <span className="small text-muted">
                            {p.current_stock ?? 0} {p.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Cart */}
          <div className="col-12 col-lg-5">
            <div className="bg-white rounded-3 p-3 border shadow-sm h-100 d-flex flex-column">
              <h5 className="fw-bold mb-3 text-dark pb-2 border-bottom d-flex justify-content-between align-items-center">
                <span>🛒 Current Order</span>
                <span className="badge bg-primary rounded-pill">{cart.length} items</span>
              </h5>

              {/* Customer Selector */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary mb-1">
                  Customer (Optional)
                </label>
                <select
                  className="form-select form-select-sm"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                  <option value="">Walk-in Customer (General)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="flex-grow-1 overflow-auto mb-3" style={{ minHeight: '200px', maxHeight: '280px' }}>
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    Cart is empty. Tap any product on the left to add it.
                  </div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {cart.map((item) => (
                      <li key={item.product_id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                        <div style={{ maxWidth: '180px' }}>
                          <div className="fw-semibold small text-dark text-truncate">{item.name}</div>
                          <div className="small text-muted">${item.unit_price.toFixed(2)} / {item.unit}</div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-0 px-2"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            -
                          </button>
                          <span className="fw-bold small px-1">{item.quantity}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary py-0 px-2"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold small text-dark">${item.total.toFixed(2)}</div>
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
                  <span className="fw-semibold text-dark">${subtotal.toFixed(2)}</span>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="small text-secondary mb-0">Discount ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control form-control-sm"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="small text-secondary mb-0">Tax / GST ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control form-control-sm"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center py-2 mb-3 border-top border-bottom">
                  <span className="fw-bold text-dark">Grand Total:</span>
                  <span className="h4 fw-bold text-primary mb-0">${finalTotal.toFixed(2)}</span>
                </div>

                {/* Tender Method */}
                <div className="mb-3">
                  <label className="small fw-semibold text-secondary mb-1">Payment Method:</label>
                  <div className="btn-group w-100" role="group">
                    {['cash', 'card', 'upi', 'bank_transfer'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`btn btn-sm ${paymentMethod === m ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPaymentMethod(m)}
                      >
                        {m.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-100 py-2 fw-bold"
                  disabled={submitting || cart.length === 0}
                  onClick={handleCheckout}
                >
                  {submitting ? 'Processing Bill...' : `Complete Sale ($${finalTotal.toFixed(2)})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sales Invoices History */
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Invoice #</th>
                <th style={{ fontSize: '13px' }}>Date</th>
                <th style={{ fontSize: '13px' }}>Customer</th>
                <th style={{ fontSize: '13px' }}>Method</th>
                <th style={{ fontSize: '13px' }}>Total Amount</th>
                <th style={{ fontSize: '13px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s) => (
                <tr key={s.id}>
                  <td className="fw-bold font-monospace text-primary">{s.invoice_number}</td>
                  <td className="small text-muted">
                    {s.sale_date ? new Date(s.sale_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>{s.customer_name || 'Walk-in Customer'}</td>
                  <td>
                    <span className="badge bg-light text-dark border small">
                      {s.payment_method}
                    </span>
                  </td>
                  <td className="fw-bold">${Number(s.total_amount).toFixed(2)}</td>
                  <td>
                    <span className="badge bg-success-subtle text-success border border-success-subtle small">
                      {s.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {lastInvoice && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-3">
              <div className="text-center py-2 border-bottom">
                <span style={{ fontSize: '36px' }}>🧾</span>
                <h5 className="fw-bold mb-0">Payment Successful</h5>
                <p className="text-muted small mb-0">Invoice #{lastInvoice.invoice_number}</p>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Customer:</span>
                  <span className="fw-semibold text-dark">
                    {lastInvoice.customer_name || 'Walk-in'}
                  </span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-1">
                  <span>Payment Method:</span>
                  <span className="fw-semibold text-dark">{lastInvoice.payment_method}</span>
                </div>
                <div className="d-flex justify-content-between small text-secondary mb-3">
                  <span>Line Items:</span>
                  <span className="fw-semibold text-dark">{lastInvoice.items_count || (lastInvoice.items?.length ?? 0)}</span>
                </div>

                <div className="bg-light p-3 rounded-2 text-center mb-3">
                  <div className="small text-muted">Paid Total</div>
                  <div className="h3 fw-bold text-success mb-0">
                    ${Number(lastInvoice.total_amount).toFixed(2)}
                  </div>
                </div>

                <p className="small text-muted text-center mb-0">
                  Inventory levels were automatically updated and stock movement logged in audit table.
                </p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => setLastInvoice(null)}
                >
                  Done / Next Order
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

