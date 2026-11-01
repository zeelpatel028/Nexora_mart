import React from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = ({ brandName = 'Nexora Mart' }) => {
  return (
    <footer
      style={{
        width: '100%',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '13px',
        color: '#94a3b8',
        boxSizing: 'border-box'
      }}
    >
      <p style={{ margin: 0 }}>
        © {CURRENT_YEAR} {brandName}. All rights reserved. Secure Cloud Retail Management.
      </p>
    </footer>
  );
};

export default Footer;
