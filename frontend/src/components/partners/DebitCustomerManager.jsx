import React, { useState, useEffect, useCallback } from 'react';
import { partnerService } from '../../services';
import { Button } from '../common/Button';

export const DebitCustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Payment Recording Modal
  const [paymentModalCustomer, setPaymentModalCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('');
  const [addingCustomer, setAddingCustomer] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both debit customers and all customers
      const [debitList, allCusts] = await Promise.all([
        partnerService.getDebitCustomers(search.trim()).catch(() => []),
        partnerService.getCustomers(search.trim()).catch(() => [])
      ]);

      // Combine customers, marking those with balance
      const map = new Map();
      (allCusts || []).forEach((c) => map.set(c.id, { ...c, balance: Number(c.balance || 0) }));
      (debitList || []).forEach((d) => {
        const custId = d.customer_id || d.id;
        const existing = map.get(custId) || {};
        map.set(custId, {
          ...existing,
          ...d,
          id: custId,
          balance: Number(d.outstanding_balance || d.balance || existing.balance || 0)
        });
      });

      setCustomers(Array.from(map.values()));
    } catch (err) {
      setErrorMsg('Failed to load debit customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalOutstanding = customers.reduce((sum, c) => sum + Math.max(0, Number(c.balance || 0)), 0);
  const customersWithDebt = customers.filter((c) => Number(c.balance || 0) > 0);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      setErrorMsg('Please enter a valid payment amount');
      return;
    }
    setRecordingPayment(true);
    setErrorMsg('');
    try {
      await partnerService.recordDebitPayment(paymentModalCustomer.id, {
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        notes: paymentNotes.trim() || undefined
      });
      setSuccessMsg(`Payment of ₹ ${Number(paymentAmount).toLocaleString()} recorded for ${paymentModalCustomer.name}`);
      setPaymentModalCustomer(null);
      setPaymentAmount('');
      setPaymentNotes('');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Customer name is required');
      return;
    }
    setAddingCustomer(true);
    setErrorMsg('');
    try {
      await partnerService.createCustomer({
        name: newName.trim(),
        phone: newPhone.trim() || undefined,
        email: newEmail.trim() || undefined,
        address: newAddress.trim() || undefined,
        credit_limit: newCreditLimit ? Number(newCreditLimit) : 0
      });
      setSuccessMsg(`Customer "${newName}" added successfully`);
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewAddress('');
      setNewCreditLimit('');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add customer');
    } finally {
      setAddingCustomer(false);
    }
  };

  return (
    <div className="debit-customers-container">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Debit Customer Ledger (Khata)</h4>
          <p className="text-muted small mb-0">
            Track customer store credit, outstanding dues, credit limits, and record repayments.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '9999px', backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
          >
            + Add New Customer
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

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-danger">
            <span className="small text-secondary fw-semibold">Total Outstanding Debt</span>
            <div className="h3 fw-bold text-danger my-1">
              ₹ {totalOutstanding.toLocaleString()}
            </div>
            <span className="small text-muted">{customersWithDebt.length} customer(s) with pending dues</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-warning">
            <span className="small text-secondary fw-semibold">Total Credit Customers</span>
            <div className="h3 fw-bold text-dark my-1">
              {customers.length}
            </div>
            <span className="small text-muted">Registered in merchant directory</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-success">
            <span className="small text-secondary fw-semibold">Collection Status</span>
            <div className="h3 fw-bold text-success my-1">
              {customers.length > 0 ? `${Math.round(((customers.length - customersWithDebt.length) / customers.length) * 100)}%` : '100%'}
            </div>
            <span className="small text-muted">Account clearance rate</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3 p-3 border shadow-sm mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search customer by name, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: '12px', height: '42px' }}
            />
          </div>
          <div className="col-12 col-md-4 text-end d-flex align-items-center justify-content-end">
            <span className="text-muted small">
              Showing <strong>{customers.length}</strong> customers
            </span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
          <p className="small mb-0">Loading customer credit records...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border p-4">
          <div style={{ fontSize: '42px' }}>👥</div>
          <h5 className="fw-bold mt-2">No Customers Found</h5>
          <p className="text-muted small mb-3">Add customers with credit limits to maintain their khata records.</p>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add First Customer
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {customers.map((c) => {
            const hasDebt = Number(c.balance || 0) > 0;
            return (
              <div key={c.id} className="col-12 col-md-6 col-xl-4">
                <div className="card h-100 p-3 border shadow-sm rounded-3">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: '#FFF0E8',
                        color: '#FF6A1A',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                    </div>

                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-0 text-dark text-truncate" title={c.name}>
                          {c.name}
                        </h6>
                        <span className={`badge ${hasDebt ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'}`}>
                          {hasDebt ? 'Pending Dues' : 'Cleared'}
                        </span>
                      </div>

                      {c.phone && <div className="small text-secondary mt-1">📞 {c.phone}</div>}
                      {c.email && <div className="small text-muted text-truncate">✉️ {c.email}</div>}
                      {c.address && <div className="small text-muted text-truncate">📍 {c.address}</div>}
                    </div>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted" style={{ fontSize: '11px' }}>Current Outstanding</div>
                      <div className={`h5 fw-bold mb-0 ${hasDebt ? 'text-danger' : 'text-success'}`}>
                        ₹ {Number(c.balance || 0).toLocaleString()}
                      </div>
                    </div>

                    {Number(c.credit_limit || 0) > 0 && (
                      <div className="text-end">
                        <div className="small text-muted" style={{ fontSize: '11px' }}>Credit Limit</div>
                        <div className="small fw-semibold text-dark">
                          ₹ {Number(c.credit_limit).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-sm w-100 fw-bold"
                      onClick={() => setPaymentModalCustomer(c)}
                      style={{
                        backgroundColor: hasDebt ? '#FF6A1A' : '#F3F4F6',
                        color: hasDebt ? '#FFFFFF' : '#374151',
                        borderRadius: '9999px',
                        border: 'none',
                        padding: '8px 16px'
                      }}
                    >
                      💳 {hasDebt ? 'Record Repayment' : 'Add Advance / Payment'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalCustomer && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-3 rounded-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="fw-bold mb-1">Record Repayment</h5>
                  <p className="text-muted small mb-0">Customer: <strong>{paymentModalCustomer.name}</strong></p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPaymentModalCustomer(null)}
                />
              </div>

              <form onSubmit={handleRecordPayment}>
                <div className="modal-body py-3">
                  <div className="bg-light p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small text-muted">Outstanding Balance</div>
                      <div className="h4 fw-bold text-danger mb-0">
                        ₹ {Number(paymentModalCustomer.balance || 0).toLocaleString()}
                      </div>
                    </div>
                    {Number(paymentModalCustomer.balance || 0) > 0 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        onClick={() => setPaymentAmount(String(paymentModalCustomer.balance))}
                      >
                        Pay Full
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Payment Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 500"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                      style={{ borderRadius: '12px', height: '44px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Payment Method
                    </label>
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
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Notes / Reference (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Receipt number, UPI txn id, etc."
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setPaymentModalCustomer(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={recordingPayment}
                    style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                  >
                    {recordingPayment ? 'Saving...' : 'Confirm Repayment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-3 rounded-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="fw-bold mb-1">Add New Customer</h5>
                  <p className="text-muted small mb-0">Create customer profile with optional credit limit</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                />
              </div>

              <form onSubmit={handleAddCustomer}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh Patel"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="customer@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Store Credit Limit (₹)</label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      className="form-control"
                      placeholder="e.g. 5000"
                      value={newCreditLimit}
                      onChange={(e) => setNewCreditLimit(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Address / Location</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Building, street, landmark"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={addingCustomer}
                    style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                  >
                    {addingCustomer ? 'Adding...' : 'Create Customer'}
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

export default DebitCustomerManager;

