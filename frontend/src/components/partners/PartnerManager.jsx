import React, { useState, useEffect } from 'react';
import { partnerService } from '../../services';
import { Button } from '../common/Button';

export const PartnerManager = () => {
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'suppliers'
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [custs, sups] = await Promise.all([
        partnerService.getCustomers().catch(() => []),
        partnerService.getSuppliers().catch(() => [])
      ]);
      setCustomers(custs);
      setSuppliers(sups);
    } catch (err) {
      setErrorMsg('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      if (activeTab === 'customers') {
        await partnerService.createCustomer({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null
        });
        setStatusMsg(`Customer "${name}" added!`);
      } else {
        await partnerService.createSupplier({
          name: name.trim(),
          company_name: companyName.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null
        });
        setStatusMsg(`Supplier "${name}" added!`);
      }
      setShowAddModal(false);
      setName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setAddress('');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="partner-manager">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Customer & Supplier Directory (CRM)</h4>
          <p className="text-muted small mb-0">
            Maintain contact lists, purchase histories, and credit records for clients & vendors.
          </p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group">
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('customers')}
            >
              Customers ({customers.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('suppliers')}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            + Add {activeTab === 'customers' ? 'Customer' : 'Supplier'}
          </Button>
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

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
          <p className="small mb-0">Loading directory...</p>
        </div>
      ) : activeTab === 'customers' ? (
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Customer Name</th>
                <th style={{ fontSize: '13px' }}>Phone</th>
                <th style={{ fontSize: '13px' }}>Email</th>
                <th style={{ fontSize: '13px' }}>Total Purchases</th>
                <th style={{ fontSize: '13px' }}>Outstanding Balance</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">
                    No customers registered yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold text-dark">{c.name}</td>
                    <td>{c.phone || '—'}</td>
                    <td className="small text-muted">{c.email || '—'}</td>
                    <td className="fw-semibold text-primary">
                      ${Number(c.total_purchases || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`small ${c.outstanding_balance > 0 ? 'text-danger fw-bold' : 'text-muted'}`}>
                        ${Number(c.outstanding_balance || 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded-3 border shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ fontSize: '13px' }}>Contact Person</th>
                <th style={{ fontSize: '13px' }}>Company Name</th>
                <th style={{ fontSize: '13px' }}>Phone</th>
                <th style={{ fontSize: '13px' }}>Email</th>
                <th style={{ fontSize: '13px' }}>Balance Payable</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">
                    No suppliers registered yet.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-bold text-dark">{s.name}</td>
                    <td>{s.company_name || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td className="small text-muted">{s.email || '—'}</td>
                    <td>
                      <span className={`small ${s.balance_payable > 0 ? 'text-danger fw-bold' : 'text-muted'}`}>
                        ${Number(s.balance_payable || 0).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Add New {activeTab === 'customers' ? 'Customer' : 'Supplier'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      {activeTab === 'customers' ? 'Customer Full Name *' : 'Contact Person Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  {activeTab === 'suppliers' && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Company / Entity Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary mb-1">
                      Billing / Physical Address
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
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
                    {submitting ? 'Saving...' : 'Save Partner'}
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

export default PartnerManager;

