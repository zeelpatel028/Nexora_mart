import React, { useState, useEffect } from 'react';
import { storeService, reportService } from '../../services';
import { AnalyticsDashboardView } from './AnalyticsDashboardView';
import { ProductCatalog } from '../../components/products/ProductCatalog';
import { ProductForm } from '../../components/products/ProductForm';
import { InventoryManager } from '../../components/inventory/InventoryManager';
import { PointOfSale } from '../../components/pos/PointOfSale';
import { PurchaseManager } from '../../components/purchases/PurchaseManager';
import { PartnerManager } from '../../components/partners/PartnerManager';
import { DebitCustomerManager } from '../../components/partners/DebitCustomerManager';
import { EmployeeManager } from '../../components/employees/EmployeeManager';
import { StoreSelectionManager } from '../../components/stores/StoreSelectionManager';
import { ReportDashboard } from '../../components/reports/ReportDashboard';
import { CategoryManager } from '../../components/categories/CategoryManager';
import { ProfileView } from './ProfileView';
import { SettingsView } from './SettingsView';
import { DashboardSkeleton } from '../../components/common';
import './Dashboard.css';

export const Dashboard = ({ user, onLogout, initialTab = 'overview' }) => {
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [storeData, setStoreData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userName =
    currentUser?.first_name || currentUser?.firstName || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Owner');

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

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const storeCategoryName =
    storeData?.category?.name || summary?.category_name || currentUser?.storeType || 'Supermarket';
  const storeCategoryIcon = storeData?.category?.icon || '🏬';

  // Navigation Items matching React Native UI
  const navigationItems = [
    {
      id: 'overview',
      label: 'Home Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      id: 'pos',
      label: 'Make Bill',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      id: 'sales',
      label: 'View Bill',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'add-product',
      label: 'Add Product',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      )
    },
    {
      id: 'debit-customers',
      label: 'Debit Customer',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      )
    },
    {
      id: 'suppliers',
      label: 'Supplier',
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
      label: 'Order',
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
      label: 'Store Expense',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
          <line x1="7" y1="15" x2="11" y2="15"></line>
        </svg>
      )
    },
    {
      id: 'employees',
      label: 'Employee',
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
      id: 'reports',
      label: 'Sales Analysis',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Account Details',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      id: 'stores',
      label: 'Store Selection',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3z"></path>
          <path d="M3 9h18"></path>
          <path d="M9 21V9"></path>
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
      id: 'settings',
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
    setSidebarOpen(false);
    setShowMoreModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-dashboard-container">
      {/* 1. TOP NAVBAR */}
      <header className="admin-topbar">
        {/* Left: Brand & Mobile Hamburger */}
        <div className="topbar-brand-section">
          <button
            type="button"
            className="topbar-hamburger-btn d-lg-none"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div
            className="brand-identity-cluster cursor-pointer"
            onClick={() => handleSelectTab('overview')}
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-cart-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <div className="brand-text-group">
              <span className="brand-title-main">NEXORA MART</span>
              <span className="brand-store-tag">
                {storeCategoryIcon} {storeData?.name || 'Retail Outlet'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="topbar-search-wrapper d-none d-md-block">
          <div className="topbar-search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#768499" strokeWidth="2">
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
                    Rice (5kg) has only 8 units left in inventory.
                  </div>
                  <div className="small p-2 rounded bg-light">
                    <span className="fw-bold text-success d-block">New Order Completed</span>
                    Invoice #INV-1001 • ₹ 850 paid via Cash.
                  </div>
                  <div className="small p-2 rounded bg-light">
                    <span className="fw-bold text-primary d-block">Staff Active</span>
                    Alex Morgan signed in to cashier terminal.
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
                className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border p-2"
                style={{ width: '220px', zIndex: 1100 }}
              >
                <div className="p-2 border-bottom mb-1">
                  <div className="fw-bold text-dark small text-truncate">{userName}</div>
                  <div className="text-muted small text-truncate" style={{ fontSize: '11px' }}>
                    {currentUser?.email || 'merchant@nmart.com'}
                  </div>
                </div>
                <button
                  type="button"
                  className="dropdown-item py-2 px-3 rounded small d-flex align-items-center gap-2"
                  onClick={() => {
                    handleSelectTab('profile');
                    setShowUserMenu(false);
                  }}
                >
                  👤 Account Details
                </button>
                <button
                  type="button"
                  className="dropdown-item py-2 px-3 rounded small d-flex align-items-center gap-2"
                  onClick={() => {
                    handleSelectTab('stores');
                    setShowUserMenu(false);
                  }}
                >
                  🏬 Store Selection
                </button>
                <button
                  type="button"
                  className="dropdown-item py-2 px-3 rounded small d-flex align-items-center gap-2"
                  onClick={() => {
                    handleSelectTab('settings');
                    setShowUserMenu(false);
                  }}
                >
                  ⚙️ System Settings
                </button>
                <div className="border-top my-1"></div>
                <button
                  type="button"
                  className="dropdown-item py-2 px-3 rounded small text-danger d-flex align-items-center gap-2"
                  onClick={onLogout}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT) */}
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
          <div className="sidebar-footer text-center">
            <div className="sidebar-footer-card">
              <div className="sidebar-footer-icon-box">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div className="sidebar-footer-title">NEXORA MART</div>
              <div className="sidebar-footer-version">v1.0.0 • Multi-Store</div>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="admin-main-viewport">
          {/* Back button if not overview */}
          {activeTab !== 'overview' && (
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-pill px-3"
                  onClick={() => handleSelectTab('overview')}
                >
                  <span>←</span> Back to Dashboard
                </button>
                <h4 className="fw-bold mb-0 text-capitalize">
                  {navigationItems.find((n) => n.id === activeTab)?.label || activeTab}
                </h4>
              </div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill">
                {storeCategoryIcon} {storeCategoryName}
              </span>
            </div>
          )}

          {/* 1. Home Dashboard */}
          {activeTab === 'overview' && (
            loading ? (
              <DashboardSkeleton />
            ) : (
              <AnalyticsDashboardView
                analyticsData={analyticsOverview}
                userName={userName}
                onNavigateTab={handleSelectTab}
              />
            )
          )}

          {/* 2. Make Bill */}
          {activeTab === 'pos' && <PointOfSale initialView="terminal" />}

          {/* 3. View Bill */}
          {activeTab === 'sales' && <PointOfSale initialView="history" />}

          {/* 4. Product Management */}
          {activeTab === 'products' && (
            <ProductCatalog
              onSelectProductForSale={() => handleSelectTab('pos')}
            />
          )}

          {/* 5. Add Product */}
          {activeTab === 'add-product' && (
            <div className="bg-white rounded-4 p-4 border shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <div>
                  <h4 className="fw-bold mb-1 text-dark">Add New Product</h4>
                  <p className="text-muted small mb-0">Configure product specifications and dynamic category attributes.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                  onClick={() => handleSelectTab('products')}
                >
                  ← Back to Catalog
                </button>
              </div>
              <ProductForm
                onSuccess={() => handleSelectTab('products')}
                onCancel={() => handleSelectTab('products')}
              />
            </div>
          )}

          {/* 6. Inventory & Stock */}
          {activeTab === 'inventory' && <InventoryManager />}

          {/* 7. Debit Customer */}
          {activeTab === 'debit-customers' && <DebitCustomerManager />}

          {/* 8. Supplier */}
          {activeTab === 'suppliers' && <PartnerManager defaultSubTab="suppliers" />}

          {/* Customers general */}
          {activeTab === 'customers' && <PartnerManager defaultSubTab="customers" />}

          {/* 9. Order (Purchases) */}
          {activeTab === 'purchases' && <PurchaseManager />}

          {/* 10. Store Expense */}
          {activeTab === 'expenses' && <ReportDashboard defaultTab="finance" />}

          {/* 11. Employee */}
          {activeTab === 'employees' && <EmployeeManager />}

          {/* 12. Sales Analysis */}
          {activeTab === 'reports' && <ReportDashboard defaultTab="reports" />}

          {/* 13. Account Details */}
          {activeTab === 'profile' && (
            <ProfileView
              user={currentUser}
              onUserUpdated={(u) => setCurrentUser(u)}
              onLogout={onLogout}
            />
          )}

          {/* 14. Store Selection */}
          {activeTab === 'stores' && (
            <StoreSelectionManager
              onStoreChanged={(updatedStore) => {
                setStoreData(updatedStore);
                loadData();
              }}
            />
          )}

          {/* Category Configuration */}
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

          {/* System Settings */}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* 3. MOBILE BOTTOM TAB NAVIGATION (MATCHES REACT NATIVE TAB NAVIGATOR) */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleSelectTab('overview')}
        >
          <span className="mobile-nav-icon">🏠</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => handleSelectTab('pos')}
        >
          <span className="mobile-nav-icon">🛒</span>
          <span>Sales</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleSelectTab('products')}
        >
          <span className="mobile-nav-icon">📦</span>
          <span>Products</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => handleSelectTab('inventory')}
        >
          <span className="mobile-nav-icon">▦</span>
          <span>Inventory</span>
        </button>

        <button
          type="button"
          className={`mobile-nav-btn ${showMoreModal ? 'active' : ''}`}
          onClick={() => setShowMoreModal(!showMoreModal)}
        >
          <span className="mobile-nav-icon">⋯</span>
          <span>More</span>
        </button>
      </nav>

      {/* 4. MOBILE "MORE" DRAWER / MODAL (MATCHES REACT NATIVE MoreMenuScreen) */}
      {showMoreModal && (
        <div
          className="position-fixed inset-0 bg-dark bg-opacity-50 d-flex flex-column justify-content-end"
          style={{ zIndex: 1060 }}
          onClick={() => setShowMoreModal(false)}
        >
          <div
            className="bg-white rounded-top-4 p-4 shadow-lg"
            style={{ maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark">More Management Options</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowMoreModal(false)}
              ></button>
            </div>

            <div className="row g-2 mb-3">
              {[
                { id: 'sales', label: 'View Bills', icon: '📋' },
                { id: 'add-product', label: 'Add Product', icon: '➕' },
                { id: 'debit-customers', label: 'Debit Customers', icon: '💳' },
                { id: 'suppliers', label: 'Suppliers', icon: '🚚' },
                { id: 'employees', label: 'Employees', icon: '👥' },
                { id: 'purchases', label: 'Orders', icon: '🛍️' },
                { id: 'expenses', label: 'Expenses', icon: '💸' },
                { id: 'reports', label: 'Reports', icon: '📊' },
                { id: 'stores', label: 'Stores', icon: '🏬' },
                { id: 'categories', label: 'Categories', icon: '📑' },
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((m) => (
                <div key={m.id} className="col-4 text-center">
                  <button
                    type="button"
                    className="btn btn-light w-100 p-3 rounded-3 d-flex flex-column align-items-center justify-content-center"
                    onClick={() => handleSelectTab(m.id)}
                  >
                    <span className="fs-3 mb-1">{m.icon}</span>
                    <span className="small fw-semibold text-dark">{m.label}</span>
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-outline-danger w-100 py-2 fw-semibold rounded-pill"
              onClick={onLogout}
            >
              Sign Out from Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
