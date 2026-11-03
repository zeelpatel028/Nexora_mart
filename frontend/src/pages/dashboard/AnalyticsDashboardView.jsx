import React, { useState } from 'react';
import './Dashboard.css';

export const AnalyticsDashboardView = ({
  analyticsData,
  userName = 'Owner',
  onNavigateTab
}) => {
  const [selectedRange, setSelectedRange] = useState('Today');
  const [salesTimeframe, setSalesTimeframe] = useState('This Week');
  const [categoryTimeframe, setCategoryTimeframe] = useState('This Month');
  const [hoveredDay, setHoveredDay] = useState(null);

  // Fallback defaults if backend is loading
  const stats = analyticsData?.stats || [
    {
      id: 'sales',
      title: "Today's Sales",
      value: '₹ 45,850',
      trend: '↑ +12.5%',
      is_positive: true,
      color_scheme: 'orange'
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: '248',
      trend: '↑ +8.2%',
      is_positive: true,
      color_scheme: 'red'
    },
    {
      id: 'products',
      title: 'Total Products',
      value: '1,250',
      subtitle: 'Active stock',
      color_scheme: 'blue'
    },
    {
      id: 'employees',
      title: 'Employees',
      value: '12',
      subtitle: 'Active staff',
      color_scheme: 'green'
    }
  ];

  const salesData = analyticsData?.sales_overview || [
    { day: 'Mon', sales: 18500, orders: 85 },
    { day: 'Tue', sales: 22400, orders: 110 },
    { day: 'Wed', sales: 19800, orders: 78 },
    { day: 'Thu', sales: 27900, orders: 135 },
    { day: 'Fri', sales: 34100, orders: 162 },
    { day: 'Sat', sales: 38900, orders: 178 },
    { day: 'Sun', sales: 36200, orders: 164 }
  ];

  const categorySegments = analyticsData?.category_sales || [
    { name: 'Grocery', percentage: 28, color: '#FF6A1A' },
    { name: 'Beverages', percentage: 18, color: '#FFB82E' },
    { name: 'Snacks', percentage: 15, color: '#0EA5E9' },
    { name: 'Personal Care', percentage: 12, color: '#10B981' },
    { name: 'Household', percentage: 10, color: '#F43F5E' },
    { name: 'Others', percentage: 17, color: '#6366F1' }
  ];

  const activities = analyticsData?.recent_activities || [
    {
      id: 'act-1',
      title: 'New sale completed',
      description: 'Order #1025 • ₹ 850',
      timestamp: '5 minutes ago',
      icon: 'cart'
    },
    {
      id: 'act-2',
      title: 'Product added',
      description: 'Rice 1kg added to inventory',
      timestamp: '20 minutes ago',
      icon: 'box'
    },
    {
      id: 'act-3',
      title: 'Employee login',
      description: 'Rahul logged in',
      timestamp: '30 minutes ago',
      icon: 'user'
    },
    {
      id: 'act-4',
      title: 'Stock updated',
      description: 'Wheat Flour stock updated (50 units)',
      timestamp: '1 hour ago',
      icon: 'refresh'
    }
  ];

  const lowStockProducts = analyticsData?.low_stock_products || [
    { id: 1, name: 'Rice (5kg)', stock: '8 units', status: 'Low Stock', status_color: 'danger', icon: '🍚' },
    { id: 2, name: 'Cooking Oil (1L)', stock: '12 units', status: 'Low Stock', status_color: 'danger', icon: '🍾' },
    { id: 3, name: 'Sugar (1kg)', stock: '15 units', status: 'Running Low', status_color: 'warning', icon: '📦' },
    { id: 4, name: 'Toor Dal (1kg)', stock: '20 units', status: 'Running Low', status_color: 'warning', icon: '🥣' },
    { id: 5, name: 'Tea (250g)', stock: '28 units', status: 'Running Low', status_color: 'warning', icon: '☕' }
  ];

  // SVG Chart Dimensions
  const chartWidth = 520;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotW = chartWidth - paddingLeft - paddingRight;
  const plotH = chartHeight - paddingTop - paddingBottom;
  const maxSales = 40000;
  const maxOrders = 200;

  // Donut chart path calculation
  const donutSize = 180;
  const center = donutSize / 2;
  const radius = 68;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const donutArcs = categorySegments.map((seg) => {
    const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (seg.percentage / 100) * circumference;
    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="analytics-page-content">
      {/* 1. Header Greeting & Date Selector */}
      <div className="analytics-header-row mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="analytics-greeting-title mb-1">
            Good Morning, {userName}!
          </h1>
          <p className="analytics-greeting-sub mb-0 text-secondary">
            Here's your store overview for today.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="analytics-date-badge d-flex align-items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{analyticsData?.date_display || 'Tue, 3 Nov 2026'}</span>
          </div>

          <div className="dropdown">
            <select
              className="form-select form-select-sm analytics-timeframe-select"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Today's Sales */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-stat-card card-orange">
            <div className="d-flex align-items-start justify-content-between">
              <div className="stat-icon-box bg-orange-icon text-white">
                <span className="rupee-symbol">₹</span>
              </div>
              <div className="mini-bars-indicator bars-orange">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
              </div>
            </div>
            <div className="stat-content mt-3">
              <span className="stat-card-label">{stats[0]?.title || "Today's Sales"}</span>
              <h2 className="stat-card-value text-dark my-1">{stats[0]?.value || '₹ 45,850'}</h2>
              <div className="d-flex align-items-center gap-1 stat-trend-badge text-success">
                <span className="trend-arrow">↑</span>
                <span className="trend-text">{stats[0]?.trend || '+12.5%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-stat-card card-red">
            <div className="d-flex align-items-start justify-content-between">
              <div className="stat-icon-box bg-red-icon text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div className="mini-bars-indicator bars-red">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
              </div>
            </div>
            <div className="stat-content mt-3">
              <span className="stat-card-label">{stats[1]?.title || 'Total Orders'}</span>
              <h2 className="stat-card-value text-dark my-1">{stats[1]?.value || '248'}</h2>
              <div className="d-flex align-items-center gap-1 stat-trend-badge text-success">
                <span className="trend-arrow">↑</span>
                <span className="trend-text">{stats[1]?.trend || '+8.2%'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-stat-card card-blue">
            <div className="d-flex align-items-start justify-content-between">
              <div className="stat-icon-box bg-blue-icon text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div className="mini-bars-indicator bars-blue">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
              </div>
            </div>
            <div className="stat-content mt-3">
              <span className="stat-card-label">{stats[2]?.title || 'Total Products'}</span>
              <h2 className="stat-card-value text-dark my-1">{stats[2]?.value || '1,250'}</h2>
              <div className="stat-subtext text-secondary">
                {stats[2]?.subtitle || 'Active stock'}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Employees */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-stat-card card-green">
            <div className="d-flex align-items-start justify-content-between">
              <div className="stat-icon-box bg-green-icon text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="mini-bars-indicator bars-green">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
              </div>
            </div>
            <div className="stat-content mt-3">
              <span className="stat-card-label">{stats[3]?.title || 'Employees'}</span>
              <h2 className="stat-card-value text-dark my-1">{stats[3]?.value || '12'}</h2>
              <div className="stat-subtext text-secondary">
                {stats[3]?.subtitle || 'Active staff'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Row (Sales & Order Overview + Category Wise Sales) */}
      <div className="row g-4 mb-4">
        {/* Sales & Order Overview */}
        <div className="col-12 col-lg-7">
          <div className="analytics-card chart-card h-100">
            <div className="chart-header d-flex justify-content-between align-items-center mb-3">
              <h5 className="chart-title mb-0 fw-bold">Sales & Order Overview</h5>
              <select
                className="form-select form-select-sm chart-select"
                value={salesTimeframe}
                onChange={(e) => setSalesTimeframe(e.target.value)}
              >
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* Responsive Dual-Axis SVG Combo Chart */}
            <div className="combo-chart-wrapper position-relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-100 h-auto"
                style={{ overflow: 'visible', maxHeight: '260px' }}
              >
                <defs>
                  <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6A1A" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FFA266" stopOpacity="0.45" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 10000, 20000, 30000, 40000].map((val) => {
                  const y = paddingTop + plotH - (val / maxSales) * plotH;
                  return (
                    <g key={val}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#F0EDEB"
                        strokeDasharray={val === 0 ? 'none' : '3 3'}
                        strokeWidth="1"
                      />
                      {/* Left Y Axis (Sales) */}
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94A3B8"
                        fontWeight="500"
                      >
                        {val === 0 ? '0' : `${val / 1000}K`}
                      </text>
                    </g>
                  );
                })}

                {/* Right Y Axis (Orders) */}
                {[0, 50, 100, 150, 200].map((val) => {
                  const y = paddingTop + plotH - (val / maxOrders) * plotH;
                  return (
                    <text
                      key={`ord-${val}`}
                      x={chartWidth - paddingRight + 8}
                      y={y + 4}
                      textAnchor="start"
                      fontSize="10"
                      fill="#94A3B8"
                      fontWeight="500"
                    >
                      {val}
                    </text>
                  );
                })}

                {/* Axis Titles */}
                <text
                  x={12}
                  y={paddingTop + plotH / 2}
                  transform={`rotate(-90 12 ${paddingTop + plotH / 2})`}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748B"
                  fontWeight="600"
                >
                  Sales (₹)
                </text>
                <text
                  x={chartWidth - 8}
                  y={paddingTop + plotH / 2}
                  transform={`rotate(90 ${chartWidth - 8} ${paddingTop + plotH / 2})`}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748B"
                  fontWeight="600"
                >
                  Orders
                </text>

                {/* Bars for Sales */}
                {salesData.map((d, idx) => {
                  const step = plotW / salesData.length;
                  const x = paddingLeft + idx * step + step * 0.22;
                  const barWidth = step * 0.56;
                  const barH = (d.sales / maxSales) * plotH;
                  const y = paddingTop + plotH - barH;

                  return (
                    <g key={d.day}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        rx="4"
                        ry="4"
                        fill="url(#salesBarGrad)"
                        className="sales-bar"
                        onMouseEnter={() => setHoveredDay(d)}
                        onMouseLeave={() => setHoveredDay(null)}
                      />
                      {/* X Axis Labels */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#64748B"
                        fontWeight="600"
                      >
                        {d.day}
                      </text>
                    </g>
                  );
                })}

                {/* Line graph for Orders */}
                {(() => {
                  const points = salesData.map((d, idx) => {
                    const step = plotW / salesData.length;
                    const x = paddingLeft + idx * step + step * 0.5;
                    const y = paddingTop + plotH - (d.orders / maxOrders) * plotH;
                    return { x, y, ...d };
                  });

                  const pathStr = points.reduce((acc, pt, i) => {
                    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  return (
                    <g>
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="2.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((pt) => (
                        <circle
                          key={`pt-${pt.day}`}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill="#FFFFFF"
                          stroke="#EA580C"
                          strokeWidth="2.5"
                          onMouseEnter={() => setHoveredDay(pt)}
                          onMouseLeave={() => setHoveredDay(null)}
                          style={{ cursor: 'pointer' }}
                        />
                      ))}
                    </g>
                  );
                })()}
              </svg>

              {/* Hover Tooltip */}
              {hoveredDay && (
                <div
                  className="chart-tooltip shadow-sm"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.92)',
                    color: '#fff',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                >
                  <strong>{hoveredDay.day}</strong>: Sales ₹{hoveredDay.sales.toLocaleString()} • {hoveredDay.orders} Orders
                </div>
              )}
            </div>

            {/* Bottom Chart Legend */}
            <div className="chart-legend d-flex justify-content-center align-items-center gap-4 mt-3 pt-2 border-top">
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#FF6A1A',
                    display: 'inline-block'
                  }}
                ></span>
                <span className="small fw-semibold text-secondary">Sales (₹)</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px'
                  }}
                >
                  <span style={{ width: '8px', height: '2px', backgroundColor: '#EA580C' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', border: '2px solid #EA580C', backgroundColor: '#fff' }}></span>
                  <span style={{ width: '8px', height: '2px', backgroundColor: '#EA580C' }}></span>
                </span>
                <span className="small fw-semibold text-secondary">Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Wise Sales Donut */}
        <div className="col-12 col-lg-5">
          <div className="analytics-card donut-card h-100">
            <div className="chart-header d-flex justify-content-between align-items-center mb-3">
              <h5 className="chart-title mb-0 fw-bold">Category Wise Sales</h5>
              <select
                className="form-select form-select-sm chart-select"
                value={categoryTimeframe}
                onChange={(e) => setCategoryTimeframe(e.target.value)}
              >
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>

            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 my-2">
              {/* Donut SVG */}
              <div className="donut-svg-container position-relative" style={{ width: donutSize, height: donutSize }}>
                <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`}>
                  <g transform={`rotate(-90 ${center} ${center})`}>
                    {donutArcs.map((arc, i) => (
                      <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="transparent"
                        stroke={arc.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={arc.strokeDasharray}
                        strokeDashoffset={arc.strokeDashoffset}
                        strokeLinecap="butt"
                      />
                    ))}
                  </g>
                </svg>

                {/* Donut Center Text */}
                <div
                  className="donut-center-info position-absolute text-center"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px'
                  }}
                >
                  <div className="donut-center-value fw-bold text-dark" style={{ fontSize: '15px' }}>
                    {analyticsData?.category_total_sales || '₹ 1,85,420'}
                  </div>
                  <div className="donut-center-label text-muted" style={{ fontSize: '11px' }}>
                    Total Sales
                  </div>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="donut-legend-list d-flex flex-column gap-2">
                {categorySegments.map((item) => (
                  <div key={item.name} className="d-flex align-items-center justify-content-between gap-3" style={{ minWidth: '150px' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          display: 'inline-block'
                        }}
                      ></span>
                      <span className="small text-secondary" style={{ fontSize: '13px' }}>{item.name}</span>
                    </div>
                    <span className="small fw-bold text-dark" style={{ fontSize: '13px' }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Access Section */}
      <div className="analytics-quick-access-section mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 text-dark">Quick Access</h5>
          <button
            type="button"
            className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
            onClick={() => onNavigateTab('products')}
          >
            View All →
          </button>
        </div>

        <div className="row g-3">
          {[
            {
              id: 'pos',
              label: 'Sales',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              )
            },
            {
              id: 'partners',
              label: 'Employees',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              )
            },
            {
              id: 'partners',
              label: 'Customers',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )
            },
            {
              id: 'purchases',
              label: 'Suppliers',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              )
            },
            {
              id: 'reports',
              label: 'Reports',
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              )
            }
          ].map((item, idx) => (
            <div key={idx} className="col-6 col-sm-4 col-md-3">
              <div
                className="quick-access-tile text-center p-3 h-100"
                onClick={() => onNavigateTab(item.id)}
                role="button"
                tabIndex={0}
              >
                <div className="quick-access-icon mb-2">
                  {item.icon}
                </div>
                <div className="quick-access-label fw-bold text-dark">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Row (Recent Activities + Low Stock Products) */}
      <div className="row g-4">
        {/* Recent Activities */}
        <div className="col-12 col-lg-6">
          <div className="analytics-card activities-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="chart-title mb-0 fw-bold">Recent Activities</h5>
              <button
                type="button"
                className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
                onClick={() => onNavigateTab('reports')}
              >
                View All →
              </button>
            </div>

            <div className="activities-list d-flex flex-column gap-3">
              {activities.map((act) => (
                <div key={act.id} className="activity-item d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="activity-icon-box">
                      {act.icon === 'cart' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                      )}
                      {act.icon === 'box' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        </svg>
                      )}
                      {act.icon === 'user' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                      {act.icon === 'refresh' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2.2">
                          <polyline points="23 4 23 10 17 10"></polyline>
                          <polyline points="1 20 1 14 7 14"></polyline>
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="activity-title fw-bold text-dark">{act.title}</div>
                      <div className="activity-sub small text-secondary">{act.description}</div>
                    </div>
                  </div>
                  <div className="activity-time text-muted small text-nowrap">
                    {act.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="col-12 col-lg-6">
          <div className="analytics-card low-stock-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="chart-title mb-0 fw-bold">Low Stock Products</h5>
              <button
                type="button"
                className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold p-0"
                onClick={() => onNavigateTab('inventory')}
              >
                View All →
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-borderless align-middle mb-0 low-stock-table">
                <thead>
                  <tr className="border-bottom text-muted" style={{ fontSize: '12px' }}>
                    <th scope="col" className="ps-0 pb-2">Product</th>
                    <th scope="col" className="pb-2">Stock</th>
                    <th scope="col" className="text-end pe-0 pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="low-stock-row border-bottom">
                      <td className="ps-0 py-2">
                        <div className="d-flex align-items-center gap-2">
                          <span className="product-icon-emoji">{p.icon || '📦'}</span>
                          <span className="fw-semibold text-dark product-name-cell">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-danger fw-semibold" style={{ fontSize: '13px' }}>
                        {p.stock}
                      </td>
                      <td className="text-end pe-0 py-2">
                        <span
                          className={`badge rounded-pill px-2 py-1 ${
                            p.status_color === 'danger'
                              ? 'bg-danger-subtle text-danger'
                              : 'bg-warning-subtle text-warning-emphasis'
                          }`}
                          style={{ fontSize: '11px', fontWeight: 600 }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardView;

