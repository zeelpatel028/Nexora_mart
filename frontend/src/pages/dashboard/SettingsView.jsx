import React, { useState } from 'react';
import { LOCAL_API_URL, RENDER_API_URL } from '../../constants';
import { getActiveApiUrl, setActiveApiUrl } from '../../services/api';
import { useTheme } from '../../contexts';

export const SettingsView = () => {
  const { theme, toggleTheme } = useTheme();
  const [apiUrl, setApiUrl] = useState(getActiveApiUrl());
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

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
          latency: `${latency}ms`
        });
      } else {
        setTestResult({
          ok: false,
          status: `HTTP ${res.status}`,
          message: res.statusText
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        status: 'Unreachable',
        message: err.message || 'Connection failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="settings-view-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <h5 className="fw-bold text-dark mb-1">Appearance</h5>
        <p className="text-muted small mb-3">Customize visual display preference</p>

        <div className="d-flex align-items-center justify-content-between py-2 border-bottom">
          <div>
            <div className="fw-semibold text-dark">Dark Theme</div>
            <div className="small text-muted">Switch between daylight and midnight dark palette</div>
          </div>
          <div className="form-check form-switch fs-4">
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
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
        <h5 className="fw-bold text-dark mb-1">Backend Server Connection</h5>
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
            <button type="submit" className="btn btn-primary px-3 fw-semibold" style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}>
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

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-bold text-dark mb-1">System & Diagnostic Information</h5>
        <p className="text-muted small mb-3">Application specifications and build details</p>

        <div className="row g-2 small">
          <div className="col-6 text-muted">Application Name:</div>
          <div className="col-6 fw-semibold text-dark text-end">Tulsi Mart</div>

          <div className="col-6 text-muted">Client Platform:</div>
          <div className="col-6 fw-semibold text-dark text-end">React 18 + Vite (Web)</div>

          <div className="col-6 text-muted">Native Mobile Counterpart:</div>
          <div className="col-6 fw-semibold text-dark text-end">React Native (Android / iOS)</div>

          <div className="col-6 text-muted">Build Version:</div>
          <div className="col-6 fw-semibold text-dark text-end">v1.0.0 (Production)</div>

          <div className="col-6 text-muted">Backend Architecture:</div>
          <div className="col-6 fw-semibold text-dark text-end">FastAPI (Python) + Aiven MySQL</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

