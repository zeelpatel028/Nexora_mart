import React, { useState, useEffect, useCallback } from 'react';
import { reportService, financeService } from '../../services';
import { Button } from '../common/Button';

export const ReportDashboard = ({ defaultTab = 'reports' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'reports' (Sales Analysis) | 'finance' (Store Expense)
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [catPerf, setCatPerf] = useState([]);
  const [valuation, setValuation] = useState(null);

  // Expense State
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Utilities');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseMethod, setExpenseMethod] = useState('CASH');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, anal, cat, val, exps, pays] = await Promise.all([
        reportService.getDashboardSummary().catch(() => null),
        reportService.getSalesAnalytics(14).catch(() => null),
        reportService.getCategoryPerformance().catch(() => ({ categories: [] })),
        reportService.getInventoryValuation().catch(() => null),
        financeService.getExpenses().catch(() => []),
        financeService.getPayments().catch(() => [])
      ]);
      setSummary(sum);
      setAnalytics(anal);
      setCatPerf(cat?.categories || []);
      setValuation(val);
      setExpenses(exps || []);
      setPayments(pays || []);
    } catch (err) {
      setErrorMsg('Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || Number(expenseAmount) <= 0) {
      setErrorMsg('Please enter a valid expense amount');
      return;
    }
    setSubmittingExpense(true);
    setErrorMsg('');
    try {
      await financeService.createExpense({
        category: expenseCategory.trim(),
        amount: Number(expenseAmount),
        payment_method: expenseMethod,
        description: expenseDesc.trim() || undefined
      });
      setSuccessMsg(`Operating expense of ₹ ${Number(expenseAmount).toLocaleString()} logged.`);
      setShowAddExpense(false);
      setExpenseAmount('');
      setExpenseDesc('');
      await loadData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const totalExpensesLogged = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="report-dashboard-container">
      {/* Top Header & Switcher */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            {activeTab === 'reports' ? 'Sales Analysis & Business Intelligence' : 'Store Expense & Cash Outflows'}
          </h4>
          <p className="text-muted small mb-0">
            {activeTab === 'reports'
              ? 'Consolidated profitability metrics, inventory valuation, and category sales breakdown.'
              : 'Record utility bills, rent, overheads, staff disbursements, and track store expenditures.'}
          </p>
        </div>

        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm px-4 fw-bold ${activeTab === 'reports' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('reports')}
              style={activeTab === 'reports' ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
            >
              📊 Sales Analysis
            </button>
            <button
              type="button"
              className={`btn btn-sm px-4 fw-bold ${activeTab === 'finance' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('finance')}
              style={activeTab === 'finance' ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
            >
              💸 Store Expenses ({expenses.length})
            </button>
          </div>

          {activeTab === 'finance' && (
            <Button
              variant="primary"
              onClick={() => setShowAddExpense(true)}
              style={{ borderRadius: '9999px', backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
            >
              + Add Expense
            </Button>
          )}
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
          <p className="small mb-0">Computing store metrics & valuation...</p>
        </div>
      ) : activeTab === 'reports' ? (
        /* SALES ANALYSIS VIEW */
        <div>
          {/* Primary KPI Grid */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-lg-3">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-warning">
                <span className="small text-secondary fw-semibold">Gross Sales</span>
                <div className="h3 fw-bold my-1" style={{ color: '#FF6A1A' }}>
                  ₹ {Number(summary?.total_sales || 0).toLocaleString()}
                </div>
                <span className="small text-muted">Today: ₹ {Number(summary?.today_sales || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-success">
                <span className="small text-secondary fw-semibold">Estimated Net Margin</span>
                <div className={`h3 fw-bold my-1 ${Number(summary?.net_profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₹ {Number(summary?.net_profit || 0).toLocaleString()}
                </div>
                <span className="small text-muted">Sales minus procurement & expenses</span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-primary">
                <span className="small text-secondary fw-semibold">Total Inventory Cost</span>
                <div className="h3 fw-bold text-dark my-1">
                  ₹ {Number(valuation?.total_cost_valuation || 0).toLocaleString()}
                </div>
                <span className="small text-muted">Retail: ₹ {Number(valuation?.total_retail_valuation || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="col-6 col-lg-3">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-danger">
                <span className="small text-secondary fw-semibold">Operating Expenses</span>
                <div className="h3 fw-bold text-danger my-1">
                  ₹ {Number(summary?.total_expenses || totalExpensesLogged || 0).toLocaleString()}
                </div>
                <span className="small text-muted">Utilities, rent, overheads</span>
              </div>
            </div>
          </div>

          {/* Inventory Valuation Highlight Card */}
          {valuation && (
            <div className="p-4 bg-white rounded-4 border shadow-sm mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">💎 Inventory Valuation Summary</h6>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1">
                  Potential Profit: ₹ {Number(valuation.potential_profit || 0).toLocaleString()}
                </span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-muted">Valuation at Cost (Procurement)</span>
                    <div className="h5 fw-bold text-dark mt-1">₹ {Number(valuation.total_cost_valuation || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-muted">Valuation at Retail (Selling Price)</span>
                    <div className="h5 fw-bold mt-1" style={{ color: '#FF6A1A' }}>₹ {Number(valuation.total_retail_valuation || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="p-3 bg-light rounded-3">
                    <span className="small text-muted">Profit Margin Potential</span>
                    <div className="h5 fw-bold text-success mt-1">
                      {valuation.total_cost_valuation > 0
                        ? `${Math.round(((valuation.potential_profit || 0) / valuation.total_cost_valuation) * 100)}% ROI`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Charts & Tables */}
          <div className="row g-3 mb-4">
            {/* Category Performance */}
            <div className="col-12 col-lg-6">
              <div className="p-3 bg-white rounded-4 border shadow-sm h-100">
                <h6 className="fw-bold text-dark mb-3">Revenue by Category Breakdown</h6>
                {catPerf.length === 0 ? (
                  <p className="small text-muted py-4 text-center">No sales recorded yet across categories.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ fontSize: '12px' }}>Category</th>
                          <th style={{ fontSize: '12px' }}>Products</th>
                          <th style={{ fontSize: '12px' }}>Units</th>
                          <th style={{ fontSize: '12px' }}>Revenue (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catPerf.map((c, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold text-dark">{c.category_name}</td>
                            <td>{c.products_count}</td>
                            <td>{c.units_sold}</td>
                            <td className="fw-bold" style={{ color: '#FF6A1A' }}>
                              ₹ {Number(c.revenue).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* 14-day daily sales trend table */}
            <div className="col-12 col-lg-6">
              <div className="p-3 bg-white rounded-4 border shadow-sm h-100">
                <h6 className="fw-bold text-dark mb-3">Daily Sales Trend (Last 14 Days)</h6>
                {analytics?.items?.length ? (
                  <div className="table-responsive" style={{ maxHeight: '250px' }}>
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ fontSize: '12px' }}>Date</th>
                          <th style={{ fontSize: '12px' }}>Orders</th>
                          <th style={{ fontSize: '12px' }}>Revenue (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.items.map((it, idx) => (
                          <tr key={idx}>
                            <td className="small text-secondary">{it.date}</td>
                            <td>{it.orders}</td>
                            <td className="fw-bold text-success">₹ {Number(it.sales).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="small text-muted py-4 text-center">No recent sales records in the past 14 days.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STORE EXPENSE & CASH OUTFLOWS VIEW */
        <div>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-danger">
                <span className="small text-secondary fw-semibold">Total Logged Expenses</span>
                <div className="h3 fw-bold text-danger my-1">
                  ₹ {totalExpensesLogged.toLocaleString()}
                </div>
                <span className="small text-muted">{expenses.length} operating disbursements</span>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-warning">
                <span className="small text-secondary fw-semibold">Active Categories</span>
                <div className="h3 fw-bold text-dark my-1">
                  {new Set(expenses.map((e) => e.category)).size || 1}
                </div>
                <span className="small text-muted">Rent, electricity, salaries, vendor</span>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-primary">
                <span className="small text-secondary fw-semibold">Total Payment Entries</span>
                <div className="h3 fw-bold text-primary my-1">
                  {payments.length}
                </div>
                <span className="small text-muted">Audited financial transactions</span>
              </div>
            </div>
          </div>

          <div className="table-responsive bg-white rounded-4 border shadow-sm p-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ fontSize: '13px' }}>Category</th>
                  <th style={{ fontSize: '13px' }}>Description</th>
                  <th style={{ fontSize: '13px' }}>Payment Mode</th>
                  <th style={{ fontSize: '13px' }}>Date</th>
                  <th style={{ fontSize: '13px' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted small">
                      No operating expenses recorded yet. Click "+ Add Expense" to log store expenditures.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <span className="badge bg-warning-subtle text-dark border border-warning-subtle">
                          {exp.category}
                        </span>
                      </td>
                      <td className="small text-dark">{exp.description || 'General operating expense'}</td>
                      <td>
                        <span className="badge bg-light text-secondary border small">
                          {exp.payment_method}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {exp.created_at ? new Date(exp.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="fw-bold text-danger">
                        ₹ {Number(exp.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-3 rounded-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="fw-bold mb-1">Record Store Expense</h5>
                  <p className="text-muted small mb-0">Track operating expenditure & cash deductions</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddExpense(false)}
                />
              </div>

              <form onSubmit={handleAddExpense}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Expense Category *</label>
                    <select
                      className="form-select"
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    >
                      <option value="Rent">🏢 Store Rent</option>
                      <option value="Electricity">⚡ Electricity & Utilities</option>
                      <option value="Salaries">👥 Staff Salaries & Wages</option>
                      <option value="Inventory">📦 Inventory Procurement</option>
                      <option value="Maintenance">🔧 Store Repairs & Maintenance</option>
                      <option value="Packaging">🛍️ Bags & Packaging</option>
                      <option value="Internet">🌐 Internet & POS Tech</option>
                      <option value="Taxes">🏛️ Licenses & Taxes</option>
                      <option value="Other">📝 Other Overhead</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Expense Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 2500"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      required
                      style={{ borderRadius: '12px', height: '44px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Payment Method</label>
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
                          className={`btn btn-sm ${expenseMethod === m.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setExpenseMethod(m.id)}
                          style={expenseMethod === m.id ? { backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' } : {}}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Description / Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Electricity bill for November, paid via UPI"
                      value={expenseDesc}
                      onChange={(e) => setExpenseDesc(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowAddExpense(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={submittingExpense}
                    style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                  >
                    {submittingExpense ? 'Saving...' : 'Record Expense'}
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

export default ReportDashboard;
