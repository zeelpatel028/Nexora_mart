import React, { useState, useEffect } from 'react';
import { storeService, reportService } from '../../services';
import { AnalyticsDashboardView } from './AnalyticsDashboardView';
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
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName =
    user?.first_name || user?.name || (user?.email ? user.email.split('@')[0] : 'Owner');

  const loadData = async () => {
    try {
      const [store, sum, overview] = await Promise.all([
        storeService.getMyStore().catch(() => null),
        reportService.getDashboardSummary().catch(() => null),
        reportService.getAnalyticsOverview().catch(() => null)
      ]);
      setStoreData(store);
      setSummary(sum);
      setAnalyticsOverview(overview);
    } catch (err) {
      console.warn('Dashboard fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const storeCategoryName =
    storeData?.category?.name || summary?.category_name || user?.storeType || 'Supermarket';
  const storeCategoryIcon = storeData?.category?.icon || '🏬';

  // Navigation Items matching design sidebar
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      )
    },
    {
      id: 'pos',
      label: 'Sales',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      id: 'products',
      label: 'Products',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
          <polyline points="2 17 12 22 22 17"></polyline>
          <polyline points="2 12 12 17 22 12"></polyline>
        </svg>
      )
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
      )
    },
    {
      id: 'purchases',
      label: 'Purchase',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      )
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
          <line x1="7" y1="15" x2="11" y2="15"></line>
        </svg>
      )
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'categories',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false); // Auto-close drawer on mobile
  };

  return (
    <div className="admin-shell">
      {/* 1. TOP NAVBAR */}
      <header className="admin-topbar">
        {/* Left: Mobile Toggle & Brand Logo */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="topbar-icon-btn d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="topbar-brand" onClick={() => handleSelectTab('overview')}>
            <div className="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <div className="brand-title-wrap">
              <span className="brand-main-title">NEXORA MART</span>
              <span className="brand-subtitle-text">Smart Store Management</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Input */}
        <div className="topbar-search-wrapper d-none d-sm-block">
          <div className="topbar-search-input-group">
            <svg className="topbar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="topbar-search-input"
              placeholder="Search products, orders, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="topbar-actions position-relative">
          {/* Notification Bell */}
          <div className="position-relative">
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="notification-badge">3</span>
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-3"
                style={{ width: '280px', zIndex: 1100 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="fw-bold text-dark small">Notifications</span>
                  <span className="badge bg-primary text-white rounded-pill">3 New</span>
                </div>
                <div className="d-flex flex-column gap-2">
                  <div className="small p-2 rounded bg-light">
                    <span className="fw-bold text-danger d-block">Low Stock Alert</span>
                    Rice (5kg) has only 8 units left.
                  </div>
                  <div className="small p-2 rounded bg-light">
                    <span className="fw-bold text-success d-block">New Order Completed</span>
                    Order #1025 • ₹850 paid via Cash.
                  </div>
                  <div className="small p-2 rounded bg-light">
                    <span className="fw-bold text-primary d-block">Staff Login</span>
                    Rahul logged in 30 minutes ago.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="position-relative">
            <div
              className="topbar-user-pill"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
            >
              <div className="user-avatar-circle">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="user-pill-name">{userName}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-3"
                style={{ width: '220px', zIndex: 1100 }}
              >
                <div className="mb-2 pb-2 border-bottom">
                  <div className="fw-bold text-dark">{storeData?.name || `${userName}'s Store`}</div>
                  <div className="small text-muted">{user?.email || 'demo@nmart.com'}</div>
                  <span className="badge bg-light text-secondary border mt-1" style={{ fontSize: '11px' }}>
                    {storeCategoryIcon} {storeCategoryName}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary w-100 mb-2"
                  onClick={() => {
                    handleSelectTab('pos');
                    setShowUserMenu(false);
                  }}
                >
                  ⚡ Open POS Terminal
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger w-100"
                  onClick={onLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT VIEWPORT) */}
      <div className="admin-body-layout">
        {/* Mobile backdrop */}
        <div
          className={`mobile-sidebar-backdrop ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SIDEBAR NAVIGATION */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-nav-list">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(item.id)}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-text">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Brand Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-brand-badge">
              <div className="sidebar-badge-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div>
                <div className="sidebar-badge-title">NEXORA MART</div>
                <div className="sidebar-badge-version">v1.0.0</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="admin-main-viewport">
          {/* If NOT overview, provide back button to Overview */}
          {activeTab !== 'overview' && (
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-2"
                  onClick={() => handleSelectTab('overview')}
                >
                  <span>←</span> Back to Dashboard
                </button>
                <h4 className="fw-bold mb-0 text-capitalize">
                  {navigationItems.find((n) => n.id === activeTab)?.label || activeTab}
                </h4>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">
                {storeCategoryIcon} {storeCategoryName}
              </span>
            </div>
          )}

          {/* Tab 1: Home Page Analytics Dashboard */}
          {activeTab === 'overview' && (
            <AnalyticsDashboardView
              analyticsData={analyticsOverview}
              userName={userName}
              onNavigateTab={handleSelectTab}
            />
          )}

          {/* Tab 2: Point of Sale */}
          {activeTab === 'pos' && <PointOfSale />}

          {/* Tab 3: Products Catalog */}
          {activeTab === 'products' && (
            <ProductCatalog onSelectProductForSale={() => handleSelectTab('pos')} />
          )}

          {/* Tab 4: Inventory & Stock */}
          {activeTab === 'inventory' && <InventoryManager />}

          {/* Tab 5: Purchases */}
          {activeTab === 'purchases' && <PurchaseManager />}

          {/* Tab 6: Employees, Customers, Suppliers (Partners) */}
          {(activeTab === 'partners' || activeTab === 'employees' || activeTab === 'customers' || activeTab === 'suppliers') && (
            <PartnerManager defaultSubTab={activeTab === 'suppliers' ? 'suppliers' : 'customers'} />
          )}

          {/* Tab 7: Expenses & Finance */}
          {activeTab === 'expenses' && <ReportDashboard defaultTab="finance" />}

          {/* Tab 8: Reports & Valuation */}
          {activeTab === 'reports' && <ReportDashboard />}

          {/* Tab 9: Categories & Store Settings */}
          {activeTab === 'categories' && (
            <CategoryManager
              currentStore={storeData}
              onCategoryChanged={(updatedStore) => {
                setStoreData(updatedStore);
                loadData();
              }}
              onClose={() => handleSelectTab('overview')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
