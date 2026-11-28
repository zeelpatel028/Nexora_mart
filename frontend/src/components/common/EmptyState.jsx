import React from 'react';
import './EmptyState.css';

export const EmptyState = ({
  type = 'no-products',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon
}) => {
  const stateConfigs = {
    'no-products': {
      defaultTitle: 'No Products Found',
      defaultDesc: 'Your product catalog is empty. Start adding your retail items to begin tracking stock and making sales.',
      defaultAction: 'Add First Product',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    'no-customers': {
      defaultTitle: 'No Customers Found',
      defaultDesc: 'You haven’t registered any customer khata or counter profiles yet. Add customer contacts to track debit ledgers and purchase history.',
      defaultAction: 'Add Customer',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    'no-sales': {
      defaultTitle: 'No Sales Found',
      defaultDesc: 'No point-of-sale bills or sales orders have been recorded for this period. Create a new bill to ring up customers.',
      defaultAction: 'Make New Bill',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    'no-inventory': {
      defaultTitle: 'No Inventory Found',
      defaultDesc: 'All stock levels are clear or not yet recorded. Inward goods or execute stock adjustments to update inventory.',
      defaultAction: 'Add Stock Entry',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    'no-categories': {
      defaultTitle: 'No Categories Found',
      defaultDesc: 'Organize your store catalog by grouping products into departments and classifications.',
      defaultAction: 'Create Category',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    'no-search-results': {
      defaultTitle: 'No Search Results',
      defaultDesc: 'We couldn’t find any items matching your search query. Try checking for spelling errors or searching with a different keyword.',
      defaultAction: 'Clear Search',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      )
    },
    'no-notifications': {
      defaultTitle: 'No Notifications',
      defaultDesc: 'You’re all caught up! There are no pending low stock alerts, expiring batches, or notifications right now.',
      defaultAction: null,
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    'no-internet': {
      defaultTitle: 'No Internet Connection',
      defaultDesc: 'Network connection lost. Please check your WiFi or mobile data to reconnect to the Nexora Mart cloud database.',
      defaultAction: 'Retry Connection',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      )
    }
  };

  const current = stateConfigs[type] || stateConfigs['no-products'];
  const finalTitle = title || current.defaultTitle;
  const finalDesc = description || current.defaultDesc;
  const finalAction = actionLabel !== undefined ? actionLabel : current.defaultAction;
  const finalIcon = icon || current.icon;

  return (
    <div className="nexora-empty-state">
      <div className="nexora-empty-icon-halo">
        {finalIcon}
      </div>
      <h3 className="nexora-empty-title">{finalTitle}</h3>
      <p className="nexora-empty-desc">{finalDesc}</p>
      <div className="nexora-empty-actions">
        {finalAction && onAction && (
          <button
            type="button"
            className="nexora-btn-primary"
            onClick={onAction}
          >
            {finalAction}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            className="nexora-btn-secondary"
            onClick={onSecondaryAction}
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;

