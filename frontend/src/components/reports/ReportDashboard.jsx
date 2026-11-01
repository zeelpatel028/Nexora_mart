import React, { useState, useEffect } from 'react';
import { reportService } from '../../services';

export const ReportDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [catPerf, setCatPerf] = useState([]);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadReports() {
      setLoading(true);
      try {
        const [sum, anal, cat, val] = await Promise.all([
          reportService.getDashboardSummary().catch(() => null),
          reportService.getSalesAnalytics(14).catch(() => null),
          reportService.getCategoryPerformance().catch(() => ({ categories: [] })),
          reportService.getInventoryValuation().catch(() => null)
        ]);
        if (isMounted) {
          setSummary(sum);
          setAnalytics(anal);
          setCatPerf(cat?.categories || []);
          setValuation(val);
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load financial reports');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadReports();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
        <p className="small mb-0">Computing financial metrics & inventory valuation...</p>
      </div>
    );
  }

  return (
    <div className="report-dashboard">
      <div className="mb-4">
        <h4 className="fw-bold mb-1 text-dark">Business Intelligence & Profitability Reports</h4>
        <p className="text-muted small mb-0">
          Consolidated performance metrics, inventory valuation, and category breakdown.
        </p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100">
            <span className="small text-secondary fw-semibold">Gross Sales</span>
            <div className="h3 fw-bold text-primary my-1">
              ${Number(summary?.total_sales || 0).toFixed(2)}
            </div>
            <span className="small text-muted">Today: ${Number(summary?.today_sales || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100">
            <span className="small text-secondary fw-semibold">Estimated Net Margin</span>
            <div className={`h3 fw-bold my-1 ${Number(summary?.net_profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              ${Number(summary?.net_profit || 0).toFixed(2)}
            </div>
            <span className="small text-muted">Sales minus procurement & expenses</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100">
            <span className="small text-secondary fw-semibold">Total Inventory Cost</span>
            <div className="h3 fw-bold text-dark my-1">
              ${Number(valuation?.total_cost_valuation || 0).toFixed(2)}
            </div>
            <span className="small text-muted">Retail value: ${Number(valuation?.total_retail_valuation || 0).toFixed(2)}</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100">
            <span className="small text-secondary fw-semibold">Operating Expenses</span>
            <div className="h3 fw-bold text-warning my-1">
              ${Number(summary?.total_expenses || 0).toFixed(2)}
            </div>
            <span className="small text-muted">Utilities, rent, overheads</span>
          </div>
        </div>
      </div>

      {/* Inventory & Category Breakdown */}
      <div className="row g-3 mb-4">
        {/* Category Performance */}
        <div className="col-12 col-lg-6">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100">
            <h6 className="fw-bold text-dark mb-3">Revenue by Category Breakdown</h6>
            {catPerf.length === 0 ? (
              <p className="small text-muted">No sales recorded yet across categories.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ fontSize: '12px' }}>Category</th>
                      <th style={{ fontSize: '12px' }}>Products</th>
                      <th style={{ fontSize: '12px' }}>Units Sold</th>
                      <th style={{ fontSize: '12px' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catPerf.map((c, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold text-dark">{c.category_name}</td>
                        <td>{c.products_count}</td>
                        <td>{c.units_sold}</td>
                        <td className="fw-bold text-primary">${Number(c.revenue).toFixed(2)}</td>
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
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100">
            <h6 className="fw-bold text-dark mb-3">Recent Sales Trend (Last 14 Days)</h6>
            {analytics?.items?.length ? (
              <div className="table-responsive" style={{ maxHeight: '250px' }}>
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ fontSize: '12px' }}>Date</th>
                      <th style={{ fontSize: '12px' }}>Orders</th>
                      <th style={{ fontSize: '12px' }}>Revenue ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="small text-secondary">{it.date}</td>
                        <td>{it.orders}</td>
                        <td className="fw-bold text-success">${Number(it.sales).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="small text-muted">No recent sales records in the past 14 days.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;

