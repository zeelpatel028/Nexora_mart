import React, { useState } from 'react';
import { LOCAL_API_URL, RENDER_API_URL } from '../../constants';
import { getActiveApiUrl, setActiveApiUrl } from '../../services/api';
import { useTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';

export const SettingsView = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Backend connection states (preserved from existing implementation)
  const [apiUrl, setApiUrl] = useState(getActiveApiUrl());
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Preferences states
  const [language, setLanguage] = useState('English (IN)');
  const [currency, setCurrency] = useState('INR (₹)');
  const [dateFormat, setDateFormat] = useState('DD-MM-YYYY');
  const [notifications, setNotifications] = useState(true);
  const [printerPaperSize, setPrinterPaperSize] = useState('58mm (Thermal)');
  const [autoPrint, setAutoPrint] = useState(false);

  // Active modal state
  const [activeModal, setActiveModal] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Profile data derivations
  const ownerFullName = user?.first_name
    ? `${user.first_name} ${user.surname || ''}`.trim()
    : user?.name || 'Store Owner';
  const ownerEmail = user?.email || 'owner@tulsimart.com';
  const storeName = user?.store_name || user?.store?.name || 'Tulsi Mart Supermarket';
  const storeTypeName = user?.store_type || user?.shop_category || 'Grocery & Retail Store';

  const ownerInitials = (ownerFullName || 'TM')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  // Primary colors
  const primaryOrange = '#FF6700';

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (!apiUrl.trim()) return;
    setActiveApiUrl(apiUrl.trim());
    setSaveMsg(`API URL updated to: ${apiUrl.trim()}`);
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const handleSelectRender = () => {
    setApiUrl(RENDER_API_URL);
    setActiveApiUrl(RENDER_API_URL);
    setSaveMsg(`Switched to Render Cloud Backend (${RENDER_API_URL})`);
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const handleSelectLocal = () => {
    setApiUrl(LOCAL_API_URL);
    setActiveApiUrl(LOCAL_API_URL);
    setSaveMsg(`Switched to Localhost Backend (${LOCAL_API_URL})`);
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = Date.now();
    try {
      const clean = apiUrl.trim().replace(/\/api\/?$/, '');
      const healthUrl = `${clean}/health`;
      const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
      const latency = Date.now() - start;
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        setTestResult({
          ok: true,
          status: json.status || 'OK',
          service: json.service || 'Tulsi Mart FastAPI',
          latency: `${latency}ms`,
        });
      } else {
        setTestResult({
          ok: false,
          status: `HTTP ${res.status}`,
          message: res.statusText,
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        status: 'Unreachable',
        message: err.message || 'Connection failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    if (logout) {
      await logout();
    }
  };

  return (
    <div className="settings-page-wrapper py-3" style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* ==================================================== */}
      {/* 1. KHATABOOK-INSPIRED TOP PROFILE SECTION            */}
      {/* ==================================================== */}
      <div
        className="card border-0 shadow-sm rounded-4 p-4 mb-4"
        style={{
          backgroundColor: '#FFF7ED',
          border: '1.5px solid #FFD7B5',
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            {/* Avatar Circle */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm position-relative"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: primaryOrange,
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              {ownerInitials}
              <span
                className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '18px', height: '18px', fontSize: '10px' }}
              >
                ✓
              </span>
            </div>

            {/* Owner & Store Details */}
            <div>
              <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.3px' }}>
                {ownerFullName}
              </h5>
              <div className="small text-muted">{ownerEmail}</div>
              <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                <span
                  className="badge d-inline-flex align-items-center gap-1 px-2.5 py-1 text-dark fw-semibold"
                  style={{ backgroundColor: '#FFE8D6', border: '1px solid #FFD7B5' }}
                >
                  🏪 {storeName}
                </span>
                <span
                  className="badge px-2 py-1 text-uppercase fw-bold"
                  style={{ backgroundColor: '#FF6700', color: '#FFF', fontSize: '10px' }}
                >
                  {storeTypeName}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            className="btn btn-outline-primary px-3 py-1.5 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-1.5"
            style={{
              borderColor: primaryOrange,
              color: primaryOrange,
              backgroundColor: '#FFFFFF',
            }}
            onClick={() => setActiveModal('editProfile')}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. BUSINESS SETTINGS SECTION                         */}
      {/* ==================================================== */}
      <div className="mb-4">
        <div
          className="text-uppercase fw-bold small mb-2 px-1"
          style={{ letterSpacing: '0.8px', color: '#64748B', fontSize: '11.5px' }}
        >
          BUSINESS SETTINGS
        </div>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="list-group list-group-flush">
            {/* Business Profile */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('businessProfile')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🏪
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Business Profile</div>
                  <div className="small text-muted text-start">Store legal name, brand logo & details</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Store Information */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('storeInfo')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🏬
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Store Information</div>
                  <div className="small text-muted text-start">Opening hours, contact phone & email</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Business Address */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('businessAddress')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  📍
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Business Address</div>
                  <div className="small text-muted text-start">Shop number, street, city & pincode</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Invoice & Bill Settings */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('invoiceSettings')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🧾
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Invoice & Bill Settings</div>
                  <div className="small text-muted text-start">Bill header, logo, terms & sequence</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Payment Settings */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('paymentSettings')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  💳
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Payment Settings</div>
                  <div className="small text-muted text-start">UPI QR, Bank account & payment modes</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Tax & GST Settings */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('taxSettings')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  %
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Tax & GST Settings</div>
                  <div className="small text-muted text-start">GSTIN, tax slabs & HSN configuration</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Printer Settings */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('printerSettings')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🖨️
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Printer Settings</div>
                  <div className="small text-muted text-start">{printerPaperSize} • {autoPrint ? 'Auto Print ON' : 'Manual Print'}</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. ACCOUNT & SECURITY SECTION                        */}
      {/* ==================================================== */}
      <div className="mb-4">
        <div
          className="text-uppercase fw-bold small mb-2 px-1"
          style={{ letterSpacing: '0.8px', color: '#64748B', fontSize: '11.5px' }}
        >
          ACCOUNT & SECURITY
        </div>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="list-group list-group-flush">
            {/* Edit Personal Information */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('editProfile')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  👤
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Edit Personal Information</div>
                  <div className="small text-muted text-start">Owner name, mobile number & profile photo</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Change Password */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('changePassword')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🔑
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Change Password</div>
                  <div className="small text-muted text-start">Update login security credentials</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Login & Security */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('security')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🔒
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Login & Security</div>
                  <div className="small text-muted text-start">Active JWT session & cryptographic token auth</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Manage Devices */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('devices')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  📱
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Manage Devices</div>
                  <div className="small text-muted text-start">Current browser / workstation session</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Privacy Settings */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('privacy')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🛡️
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Privacy Settings</div>
                  <div className="small text-muted text-start">Store data isolation & merchant confidentiality</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. APP PREFERENCES SECTION                           */}
      {/* ==================================================== */}
      <div className="mb-4">
        <div
          className="text-uppercase fw-bold small mb-2 px-1"
          style={{ letterSpacing: '0.8px', color: '#64748B', fontSize: '11.5px' }}
        >
          APP PREFERENCES
        </div>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="list-group list-group-flush">
            {/* Language */}
            <div className="list-group-item d-flex align-items-center justify-content-between py-3 px-3.5 border-light">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🌐
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Language</div>
                  <div className="small text-muted">Select application display language</div>
                </div>
              </div>
              <select
                className="form-select form-select-sm w-auto fw-semibold border-light bg-light"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English (IN)">English (IN)</option>
                <option value="हिन्दी (Hindi)">हिन्दी (Hindi)</option>
                <option value="ગુજરાતી (Gujarati)">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {/* Dark / Light Theme Toggle */}
            <div className="list-group-item d-flex align-items-center justify-content-between py-3 px-3.5 border-light">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  {theme === 'dark' ? '🌙' : '☀️'}
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Dark / Light Theme</div>
                  <div className="small text-muted">{theme === 'dark' ? 'Dark Mode (Midnight)' : 'Light Mode (Daylight)'}</div>
                </div>
              </div>
              <div className="form-check form-switch fs-4 mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Notifications Toggle */}
            <div className="list-group-item d-flex align-items-center justify-content-between py-3 px-3.5 border-light">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  🔔
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Notifications</div>
                  <div className="small text-muted">Low stock alerts, bill reminders & updates</div>
                </div>
              </div>
              <div className="form-check form-switch fs-4 mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Currency Settings */}
            <div className="list-group-item d-flex align-items-center justify-content-between py-3 px-3.5 border-light">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  ₹
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Currency Settings</div>
                  <div className="small text-muted">Primary billing and sales accounting currency</div>
                </div>
              </div>
              <span className="badge px-2.5 py-1.5 fw-bold" style={{ backgroundColor: '#FFF7ED', color: primaryOrange, border: '1px solid #FFD7B5' }}>
                {currency}
              </span>
            </div>

            {/* Date & Time Format */}
            <div className="list-group-item d-flex align-items-center justify-content-between py-3 px-3.5 border-light">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  📅
                </div>
                <div>
                  <div className="fw-bold text-dark" style={{ fontSize: '14.5px' }}>Date & Time Format</div>
                  <div className="small text-muted">Format for bills, invoices & receipts</div>
                </div>
              </div>
              <select
                className="form-select form-select-sm w-auto fw-semibold border-light bg-light"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. BACKEND SERVER CONNECTION (PRESERVED)             */}
      {/* ==================================================== */}
      <div className="mb-4">
        <div
          className="text-uppercase fw-bold small mb-2 px-1"
          style={{ letterSpacing: '0.8px', color: '#64748B', fontSize: '11.5px' }}
        >
          BACKEND SERVER CONNECTION
        </div>
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <p className="text-muted small mb-3">Configure production cloud or local development server</p>

          {saveMsg && (
            <div className="alert alert-success py-2 small mb-3">
              ✓ {saveMsg}
            </div>
          )}

          <form onSubmit={handleSaveUrl} className="mb-3">
            <label className="form-label small fw-semibold text-secondary">Active API Base URL</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://..."
              />
              <button
                type="submit"
                className="btn btn-primary px-3 fw-semibold text-white"
                style={{ backgroundColor: primaryOrange, borderColor: primaryOrange }}
              >
                Save
              </button>
            </div>
          </form>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={handleSelectRender}
            >
              ☁️ Switch to Render Cloud
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={handleSelectLocal}
            >
              💻 Switch to Localhost
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={handleTestConnection}
              disabled={isTesting}
              style={{ borderColor: primaryOrange, color: primaryOrange }}
            >
              {isTesting ? 'Testing...' : '⚡ Test Connection'}
            </button>
          </div>

          {testResult && (
            <div className={`alert alert-${testResult.ok ? 'success' : 'danger'} py-2 small mb-0`}>
              {testResult.ok ? (
                <div>
                  <strong>Backend Online:</strong> {testResult.service} ({testResult.status}) • Latency: {testResult.latency}
                </div>
              ) : (
                <div>
                  <strong>Connection Error:</strong> {testResult.status} ({testResult.message})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 6. HELP & SUPPORT SECTION                            */}
      {/* ==================================================== */}
      <div className="mb-4">
        <div
          className="text-uppercase fw-bold small mb-2 px-1"
          style={{ letterSpacing: '0.8px', color: '#64748B', fontSize: '11.5px' }}
        >
          HELP & SUPPORT
        </div>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="list-group list-group-flush">
            {/* Help Center */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('helpCenter')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  ❓
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Help Center</div>
                  <div className="small text-muted text-start">Tutorials & operational user guides</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Contact Support */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('support')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  📞
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Contact Support</div>
                  <div className="small text-muted text-start">WhatsApp & live helpdesk assistance</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* Report a Problem */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('reportBug')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  ⚠️
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Report a Problem</div>
                  <div className="small text-muted text-start">Submit bug reports or technical feedback</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* FAQs */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('faqs')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  📋
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>Frequently Asked Questions</div>
                  <div className="small text-muted text-start">Billing, stock alerts & GST queries</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>

            {/* About Tulsi Mart */}
            <button
              type="button"
              className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 px-3.5 border-light"
              onClick={() => setActiveModal('about')}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF7ED', fontSize: '19px' }}
                >
                  ℹ️
                </div>
                <div>
                  <div className="fw-bold text-dark text-start" style={{ fontSize: '14.5px' }}>About Tulsi Mart</div>
                  <div className="small text-muted text-start">Version 2.0.0 (Enterprise Multi-Store Edition)</div>
                </div>
              </div>
              <span className="text-muted fw-bold">›</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 7. KHATABOOK-INSPIRED LOGOUT SECTION                 */}
      {/* ==================================================== */}
      <div
        className="card border-0 rounded-4 p-3 mb-4 d-flex flex-row align-items-center justify-content-between"
        style={{
          backgroundColor: '#FEF2F2',
          border: '1.5px solid #FEE2E2',
          cursor: 'pointer',
        }}
        onClick={() => setShowLogoutConfirm(true)}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-danger"
            style={{ width: '42px', height: '42px', backgroundColor: '#FEE2E2', fontSize: '20px' }}
          >
            🚪
          </div>
          <div>
            <div className="fw-bold text-danger" style={{ fontSize: '15px' }}>Log Out from Tulsi Mart</div>
            <div className="small" style={{ color: '#991B1B' }}>Safely end current merchant session</div>
          </div>
        </div>
        <span className="text-danger fw-bold fs-5 me-2">›</span>
      </div>

      {/* Footer Branding */}
      <div className="text-center py-2 text-muted small">
        <div>Tulsi Mart • Made with ❤️ for Indian Store Owners</div>
        <div style={{ fontSize: '11px' }}>Version 2.0.0 (Web Dashboard Release)</div>
      </div>

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <div className="modal-header border-0 pb-1">
                <h5 className="modal-title fw-bold text-danger">Log Out Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutConfirm(false)}
                />
              </div>
              <div className="modal-body py-2">
                <p className="text-secondary mb-0">
                  Are you sure you want to log out of Tulsi Mart? You will need to enter your password to access store data again.
                </p>
              </div>
              <div className="modal-footer border-0 pt-2 gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3.5 fw-semibold"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
                  onClick={handleConfirmLogout}
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generic Information Modal */}
      {activeModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '460px' }}>
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <div className="modal-header border-0 pb-1">
                <h5 className="modal-title fw-bold text-dark">
                  {activeModal === 'businessProfile' && 'Business Profile Details'}
                  {activeModal === 'storeInfo' && 'Store Information'}
                  {activeModal === 'businessAddress' && 'Business Address'}
                  {activeModal === 'invoiceSettings' && 'Invoice & Bill Configuration'}
                  {activeModal === 'paymentSettings' && 'Payment & UPI Settings'}
                  {activeModal === 'taxSettings' && 'Tax & GST Slabs'}
                  {activeModal === 'printerSettings' && 'Thermal Printer Setup'}
                  {activeModal === 'editProfile' && 'Owner Profile Information'}
                  {activeModal === 'changePassword' && 'Security: Change Password'}
                  {activeModal === 'security' && 'Active Session Security'}
                  {activeModal === 'devices' && 'Authorized Workstations'}
                  {activeModal === 'privacy' && 'Data Protection & Privacy'}
                  {activeModal === 'helpCenter' && 'Tulsi Mart Help Center'}
                  {activeModal === 'support' && 'Live Customer Support'}
                  {activeModal === 'reportBug' && 'Report an Issue'}
                  {activeModal === 'faqs' && 'Frequently Asked Questions'}
                  {activeModal === 'about' && 'About Tulsi Mart'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveModal(null)}
                />
              </div>
              <div className="modal-body py-2 small text-secondary">
                {activeModal === 'printerSettings' ? (
                  <div>
                    <label className="fw-semibold text-dark mb-1">Receipt Paper Size</label>
                    <select
                      className="form-select form-select-sm mb-3"
                      value={printerPaperSize}
                      onChange={(e) => setPrinterPaperSize(e.target.value)}
                    >
                      <option value="58mm (Thermal)">58mm (Thermal Bluetooth)</option>
                      <option value="80mm (POS Standard)">80mm (POS Standard Desktop)</option>
                      <option value="A4 Invoice (Full Page)">A4 Invoice (Full Page PDF)</option>
                    </select>

                    <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                      <div>
                        <div className="fw-semibold text-dark">Auto-Print on Bill Save</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Instantly trigger print dialog upon completing a sale</div>
                      </div>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={autoPrint}
                          onChange={(e) => setAutoPrint(e.target.checked)}
                        />
                      </div>
                    </div>
                  </div>
                ) : activeModal === 'support' ? (
                  <div>
                    <p>Dedicated merchant support for grocery, medical, apparel, electronics and retail stores:</p>
                    <div className="d-grid gap-2">
                      <a
                        href="https://wa.me/919999999999?text=Hello%20Tulsi%20Mart%20Support"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-success rounded-pill fw-semibold"
                      >
                        💬 Chat on WhatsApp (+91 99999 99999)
                      </a>
                      <a
                        href="tel:1800123456"
                        className="btn btn-outline-primary rounded-pill fw-semibold"
                      >
                        📞 Toll-Free Helpline (1800-123-456)
                      </a>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">
                      Store: <strong>{storeName}</strong> ({storeTypeName})
                    </p>
                    <p className="mb-2">
                      Owner: <strong>{ownerFullName}</strong> ({ownerEmail})
                    </p>
                    <p className="mb-0 text-muted">
                      This setting is synchronized with your merchant backend database. Changes can also be configured directly via POS terminal or Android app.
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-2">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4 fw-bold text-white"
                  style={{ backgroundColor: primaryOrange, borderColor: primaryOrange }}
                  onClick={() => setActiveModal(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
