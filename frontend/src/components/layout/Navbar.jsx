import React from 'react';
import { BrandLogo } from '../branding/BrandLogo';

export const Navbar = ({ brandName = 'Nexora Mart', user, onLogout }) => {
  return (
    <header
      style={{
        width: '100%',
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BrandLogo brandName={brandName} size={36} showTitle={false} />
        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.04em', display: 'flex', gap: '6px' }}>
          <span style={{ color: '#0B0B2B' }}>NEXORA</span>
          <span style={{ color: '#FF6A1A' }}>MART</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <span style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>
              {user.name || user.email}
            </span>
            <button
              type="button"
              onClick={onLogout}
              style={{
                fontSize: '13.5px',
                color: '#b91c1c',
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2'
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Secure Authentication
          </span>
        )}
      </div>
    </header>
  );
};

export default Navbar;
