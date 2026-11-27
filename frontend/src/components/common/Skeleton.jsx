import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  variant = 'text', // 'text', 'circular', 'rectangular', 'card'
  width,
  height,
  borderRadius,
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`nexora-skeleton nexora-skeleton-${variant} ${className}`}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '16px' : undefined),
        borderRadius: borderRadius || undefined,
        ...style
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="nexora-skeleton-table-wrapper">
      <div className="nexora-skeleton-table-header">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} variant="text" height="20px" width="70%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="nexora-skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} variant="text" height="16px" width={colIdx === 0 ? '85%' : '60%'} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="nexora-skeleton-dashboard">
      {/* 4 Stat Cards */}
      <div className="nexora-skeleton-stats-grid">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="nexora-skeleton-stat-card">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="50%" height="14px" style={{ marginBottom: '8px' }} />
              <Skeleton variant="text" width="75%" height="24px" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="nexora-skeleton-content-grid">
        <div className="nexora-skeleton-card" style={{ flex: 2, minHeight: '320px' }}>
          <Skeleton variant="text" width="30%" height="20px" style={{ marginBottom: '20px' }} />
          <Skeleton variant="rectangular" height="240px" borderRadius="12px" />
        </div>
        <div className="nexora-skeleton-card" style={{ flex: 1, minHeight: '320px' }}>
          <Skeleton variant="text" width="50%" height="20px" style={{ marginBottom: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Skeleton variant="circular" width="32px" height="32px" />
                <div style={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height="14px" style={{ marginBottom: '4px' }} />
                  <Skeleton variant="text" width="40%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductListSkeleton = ({ count = 6 }) => {
  return (
    <div className="nexora-skeleton-product-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="nexora-skeleton-product-card">
          <Skeleton variant="rectangular" height="120px" borderRadius="12px" style={{ marginBottom: '12px' }} />
          <Skeleton variant="text" width="75%" height="18px" style={{ marginBottom: '6px' }} />
          <Skeleton variant="text" width="40%" height="14px" style={{ marginBottom: '12px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width="35%" height="20px" />
            <Skeleton variant="rectangular" width="60px" height="24px" borderRadius="6px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CustomerListSkeleton = ({ count = 5 }) => {
  return (
    <div className="nexora-skeleton-list">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="nexora-skeleton-list-item">
          <Skeleton variant="circular" width="44px" height="44px" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height="16px" style={{ marginBottom: '6px' }} />
            <Skeleton variant="text" width="25%" height="14px" />
          </div>
          <div style={{ textAlign: 'right', minWidth: '100px' }}>
            <Skeleton variant="text" width="80%" height="18px" style={{ marginBottom: '6px' }} />
            <Skeleton variant="rectangular" width="70px" height="20px" borderRadius="4px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const BillingSkeleton = () => {
  return (
    <div className="nexora-skeleton-pos-layout">
      <div className="nexora-skeleton-pos-left" style={{ flex: 2 }}>
        <Skeleton variant="rectangular" height="48px" borderRadius="12px" style={{ marginBottom: '16px' }} />
        <TableSkeleton rows={4} columns={5} />
      </div>
      <div className="nexora-skeleton-pos-right" style={{ flex: 1 }}>
        <div className="nexora-skeleton-card">
          <Skeleton variant="text" width="50%" height="20px" style={{ marginBottom: '16px' }} />
          <Skeleton variant="text" width="100%" height="14px" style={{ marginBottom: '10px' }} />
          <Skeleton variant="text" width="100%" height="14px" style={{ marginBottom: '10px' }} />
          <Skeleton variant="text" width="100%" height="14px" style={{ marginBottom: '20px' }} />
          <Skeleton variant="rectangular" height="46px" borderRadius="12px" />
        </div>
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="nexora-skeleton-card" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '28px' }}>
        <Skeleton variant="circular" width="72px" height="72px" />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height="22px" style={{ marginBottom: '8px' }} />
          <Skeleton variant="text" width="25%" height="14px" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton variant="text" width="35%" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton variant="rectangular" height="42px" borderRadius="10px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;

