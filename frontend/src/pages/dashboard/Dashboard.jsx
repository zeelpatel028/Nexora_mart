import React, { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { storeService, reportService } from '../../services';
import { ProductCatalog } from '../../components/products/ProductCatalog';
import { InventoryManager } from '../../components/inventory/InventoryManager';
import { PointOfSale } from '../../components/pos/PointOfSale';
import { PurchaseManager } from '../../components/purchases/PurchaseManager';
import { PartnerManager } from '../../components/partners/PartnerManager';
import { ReportDashboard } from '../../components/reports/ReportDashboard';
import { CategoryManager } from '../../components/categories/CategoryManager';
import './Dashboard.css';

export const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [storeData, setStoreData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const userName = user?.name || user?.firstName || (user?.email ? user.email.split('@')[0] : 'Merchant');

  const loadStoreAndSummary = async () => {
    try {
      const [store, sum] = await Promise.all([
        storeService.getMyStore().catch(() => null),
        reportService.getDashboardSummary().catch(() => null)
      ]);
      setStoreData(store);
      setSummary(sum);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoreAndSummary();
  }, []);

  const storeCategoryName = storeData?.category?.name || summary?.category_name || user?.storeType || 'Retail Store';
  const storeCategoryIcon = storeData?.category?.icon || '🏬';

  return (
    <div className="dashboard-root container-fluid px-3 px-md-4 py-4" style={{ maxWidth: '1350px' }}>
      {/* Header Card */}
      <div className="dashboard-header-card d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="dashboard-title mb-0">
              {storeData?.name || `${userName}'s Store`}
            </h2>
            <span
              className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 cursor-pointer"
              style={{ cursor: 'pointer', fontSize: '13px' }}
              onClick={() => setActiveTab('categories')}
              title="Click to change store category"
            >
              {storeCategoryIcon} {storeCategoryName} ⚙
            </span>
          </div>
          <p className="dashboard-subtitle mb-0">
            Welcome back, {userName}! Nexora All-in-One Multi-Category ERP • Logged in as Merchant
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('pos')}
            style={{ height: '40px', padding: '0 16px', fontWeight: 600 }}
          >
            ⚡ Open POS
          </Button>
          <Button
            variant="outline"
            onClick={onLogout}
            style={{ height: '40px', padding: '0 16px', fontSize: '14px' }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-3 p-2 mb-4 shadow-sm border overflow-auto d-flex gap-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'products', label: '📦 Products Catalog' },
          { id: 'inventory', label: '📋 Inventory & Stock' },
          { id: 'pos', label: '💳 POS & Billing' },
          { id: 'purchases', label: '🚚 Purchases' },
          { id: 'partners', label: '👥 Customers & Suppliers' },
          { id: 'reports', label: '📈 Reports & Valuation' },
          { id: 'categories', label: '🏬 Category Setup' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn btn-sm text-nowrap rounded-2 px-3 py-2 fw-semibold ${
              activeTab === tab.id
                ? 'btn-primary shadow-sm text-white'
                : 'btn-light text-secondary border-0'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          {/* Stats Grid */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card h-100">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value text-primary">
                  ${Number(summary?.total_sales || 0).toFixed(2)}
                </span>
                <span className="small text-muted mt-1">
                  Today: ${Number(summary?.today_sales || 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card h-100">
                <span className="stat-label">Total Sales Orders</span>
                <span className="stat-value">{summary?.total_orders || 0}</span>
                <span className="small text-muted mt-1">Customer invoices</span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card h-100">
                <span className="stat-label">Active Products</span>
                <span className="stat-value">{summary?.active_products || 0}</span>
                <span className="small text-muted mt-1">
                  In {storeCategoryName}
                </span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stat-card h-100">
                <span className="stat-label">Low Stock Items</span>
                <span className={`stat-value ${(summary?.low_stock_count || 0) > 0 ? 'text-danger' : 'text-success'}`}>
                  {summary?.low_stock_count || 0}
                </span>
                <span className="small text-muted mt-1">Requires reorder</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Category Status */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-8">
              <div className="dashboard-actions-card h-100">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">
                      Store Operations & Quick Launch
                    </h5>
                    <p className="small text-muted mb-0">
                      Active tenant database isolation verified. Category-specific rules active for <strong>{storeCategoryName}</strong>.
                    </p>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 d-inline-flex align-items-center gap-2">
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                    Store Online & Isolated
                  </span>
                </div>
                <div className="d-flex gap-2 flex-wrap pt-2 border-top">
                  <Button variant="primary" size="sm" onClick={() => setActiveTab('pos')}>
                    💳 Open POS Terminal
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('products')}>
                    + Add New Product
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('inventory')}>
                    📋 Audit Inventory
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('purchases')}>
                    🚚 Supplier Inward
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')}>
                    📈 Financial Reports
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="p-4 bg-white rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small fw-bold text-secondary text-uppercase">Active Category</span>
                    <span style={{ fontSize: '24px' }}>{storeCategoryIcon}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{storeCategoryName}</h5>
                  <p className="small text-muted mb-3">
                    {storeData?.category?.description || 'Multi-category dynamic catalog with category validation rules.'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary w-100"
                  onClick={() => setActiveTab('categories')}
                >
                  Configure Store Category
                </button>
              </div>
            </div>
          </div>

          {/* Quick Catalog Preview */}
          <div className="bg-white rounded-3 p-3 border shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Store Products Preview</h5>
              <button
                type="button"
                className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold"
                onClick={() => setActiveTab('products')}
              >
                View Full Catalog ➔
              </button>
            </div>
            <ProductCatalog onSelectProductForSale={() => setActiveTab('pos')} />
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <ProductCatalog onSelectProductForSale={() => setActiveTab('pos')} />
      )}

      {activeTab === 'inventory' && (
        <InventoryManager />
      )}

      {activeTab === 'pos' && (
        <PointOfSale />
      )}

      {activeTab === 'purchases' && (
        <PurchaseManager />
      )}

      {activeTab === 'partners' && (
        <PartnerManager />
      )}

      {activeTab === 'reports' && (
        <ReportDashboard />
      )}

      {activeTab === 'categories' && (
        <CategoryManager
          currentStore={storeData}
          onCategoryChanged={(updatedStore) => {
            setStoreData(updatedStore);
            loadStoreAndSummary();
          }}
          onClose={() => setActiveTab('overview')}
        />
      )}
    </div>
  );
};

export default Dashboard;
