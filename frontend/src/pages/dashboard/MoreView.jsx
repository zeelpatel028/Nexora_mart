import React from 'react';
import './Dashboard.css';

export const MoreView = ({ user, storeData, onNavigateTab, onLogout }) => {
  const userName =
    user?.first_name ||
    user?.firstName ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Store Owner');

  const storeName = storeData?.name || 'Nexora Retail Outlet';
  const categoryName = storeData?.category?.name || user?.storeType || 'Retail Store';
  const categoryIcon = storeData?.category?.icon || '🏬';

  const menuSections = [
    {
      title: 'Main Store Navigation',
      description: 'Primary workspaces and daily retail billing',
      items: [
        {
          id: 'overview',
          title: 'Home Dashboard',
          subtitle: 'Store summary, daily sales charts, KPIs & recent alerts',
          color: '#FF6A1A',
          bgColor: 'rgba(255, 106, 26, 0.1)',
          badge: 'Home',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          )
        },
        {
          id: 'pos',
          title: 'Make Bill (POS Terminal)',
          subtitle: 'Create customer bills, scan barcodes & process payments',
          color: '#FF6A1A',
          bgColor: 'rgba(255, 106, 26, 0.1)',
          badge: 'Fast POS',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          )
        },
        {
          id: 'sales',
          title: 'View Bills & Invoices',
          subtitle: 'Audit completed transactions, reprints & sale histories',
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          badge: 'Invoices',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Customer & Khata Accounts',
      description: 'Credit ledgers, customer balances & contacts',
      items: [
        {
          id: 'debit-customers',
          title: 'Debit Customers (Khata)',
          subtitle: 'Credit accounts, pending dues, settlements & limits',
          color: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          badge: 'Credit',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          )
        },
        {
          id: 'customers',
          title: 'All Customers Directory',
          subtitle: 'Customer contact details, total orders & buying frequency',
          color: '#0EA5E9',
          bgColor: 'rgba(14, 165, 233, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Products & Inventory',
      description: 'Stock management, catalog & category mapping',
      items: [
        {
          id: 'products',
          title: 'Product Catalog',
          subtitle: 'Browse, search, edit pricing & manage all items',
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          badge: 'Products',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          )
        },
        {
          id: 'add-product',
          title: 'Add New Product',
          subtitle: 'Register barcode, selling rate, purchase cost & specs',
          color: '#059669',
          bgColor: 'rgba(5, 150, 105, 0.1)',
          badge: 'New',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          )
        },
        {
          id: 'inventory',
          title: 'Inventory & Stock Manager',
          subtitle: 'Live stock quantities, reorder thresholds & low stock alerts',
          color: '#0D9488',
          bgColor: 'rgba(13, 148, 136, 0.1)',
          badge: 'Stock',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          )
        },
        {
          id: 'categories',
          title: 'Categories & Store Type',
          subtitle: 'Organize categories, dynamic fields & store taxonomy',
          color: '#6366F1',
          bgColor: 'rgba(99, 102, 241, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Suppliers & Purchases',
      description: 'Vendor procurement, purchase bills & payables',
      items: [
        {
          id: 'suppliers',
          title: 'Supplier Directory',
          subtitle: 'Vendor contact information, balance payables & ledger',
          color: '#8B5CF6',
          bgColor: 'rgba(139, 92, 246, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          )
        },
        {
          id: 'purchases',
          title: 'Purchase Orders & Stock Inward',
          subtitle: 'Manage supplier bills, purchase entries & vendor receipts',
          color: '#EC4899',
          bgColor: 'rgba(236, 72, 153, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Finance & Analytics',
      description: 'Financial accounting, expense tracking & sales trends',
      items: [
        {
          id: 'expenses',
          title: 'Store Expenses & Cashbook',
          subtitle: 'Record daily expenses, petty cash, rent & operational costs',
          color: '#06B6D4',
          bgColor: 'rgba(6, 182, 212, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <line x1="7" y1="15" x2="11" y2="15" />
            </svg>
          )
        },
        {
          id: 'reports',
          title: 'Sales Analysis & Financial Reports',
          subtitle: 'Comprehensive turnover charts, profit metrics & tax audit',
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          badge: 'Analytics',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          )
        },
        {
          id: 'employees',
          title: 'Staff & Cashier Management',
          subtitle: 'Staff profiles, role-based access & cashier tracking',
          color: '#4F46E5',
          bgColor: 'rgba(79, 70, 229, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          )
        }
      ]
    },
    {
      title: 'Store Settings & Account',
      description: 'Profile details, multi-store switcher & preferences',
      items: [
        {
          id: 'profile',
          title: 'Account & Business Details',
          subtitle: 'Store profile, GSTIN, billing address & owner details',
          color: '#FF6A1A',
          bgColor: 'rgba(255, 106, 26, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )
        },
        {
          id: 'stores',
          title: 'Store Outlets Selection',
          subtitle: 'Switch between multiple branches, warehouses & counters',
          color: '#D97706',
          bgColor: 'rgba(217, 119, 6, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          )
        },
        {
          id: 'settings',
          title: 'System Preferences & Settings',
          subtitle: 'Print formats, receipt templates, barcodes & system defaults',
          color: '#475569',
          bgColor: 'rgba(71, 85, 105, 0.1)',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <div className="more-page-container">
      {/* 1. TOP HEADER SUMMARY BANNER */}
      <div className="more-header-banner">
        <div className="more-header-content">
          <div className="d-flex align-items-center gap-3">
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center text-secondary shadow-sm"
              onClick={() => onNavigateTab('overview')}
              title="Back to Dashboard"
              style={{ width: '38px', height: '38px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h3 className="fw-bold text-dark mb-0">More Options & Modules</h3>
                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1 small">
                  ERP Hub
                </span>
              </div>
              <p className="text-muted small mb-0 mt-1">
                Access all store modules, inventory tools, accounting ledgers & administrative controls.
              </p>
            </div>
          </div>

          <div className="more-store-badge-card">
            <div className="more-store-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="more-store-info">
              <span className="fw-bold text-dark text-truncate d-block" style={{ maxWidth: '170px' }}>
                {userName}
              </span>
              <span className="text-muted small text-truncate d-block" style={{ fontSize: '11.5px' }}>
                {categoryIcon} {storeName} ({categoryName})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORIZED MENU SECTIONS */}
      <div className="more-sections-wrapper">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="more-section-group">
            <div className="more-section-header">
              <h5 className="more-section-title">{section.title}</h5>
              <p className="more-section-desc">{section.description}</p>
            </div>

            <div className="row g-3">
              {section.items.map((item) => (
                <div key={item.id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="more-card cursor-pointer"
                    onClick={() => onNavigateTab(item.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onNavigateTab(item.id);
                      }
                    }}
                  >
                    <div
                      className="more-card-icon-box"
                      style={{
                        backgroundColor: item.bgColor,
                        color: item.color
                      }}
                    >
                      {item.icon}
                    </div>

                    <div className="more-card-body">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="more-card-title">{item.title}</span>
                        {item.badge && (
                          <span
                            className="badge rounded-pill px-2 py-0.5"
                            style={{
                              backgroundColor: item.bgColor,
                              color: item.color,
                              fontSize: '10px',
                              fontWeight: 700
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="more-card-subtitle">{item.subtitle}</p>
                    </div>

                    <div className="more-card-arrow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 3. SIGN OUT & LOGOUT FOOTER ACTION */}
        <div className="more-logout-section mt-4 pt-3 border-top">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 bg-white p-4 rounded-4 border shadow-sm">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-danger"
                style={{ width: '44px', height: '44px', backgroundColor: '#FEF2F2' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div>
                <h6 className="fw-bold mb-0 text-dark">Sign Out of Nexora Mart</h6>
                <p className="text-muted small mb-0">
                  Currently active as <span className="fw-semibold text-dark">{user?.email || 'Merchant'}</span>.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-danger px-4 py-2 rounded-pill fw-bold d-flex align-items-center gap-2 shadow-sm"
              onClick={onLogout}
            >
              <span>Sign Out</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreView;

