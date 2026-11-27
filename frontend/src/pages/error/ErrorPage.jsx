import React, { useState, useEffect } from 'react';
import './ErrorPage.css';

export const ErrorPage = ({
  code = 404,
  title,
  description,
  retryAfter: initialRetryAfter = 300,
  onRetry,
  onGoHome,
  onGoBack,
  onLogin
}) => {
  const [countdown, setCountdown] = useState(
    code === 429 ? Math.max(initialRetryAfter || 300, 1) : 0
  );

  useEffect(() => {
    if (code !== 429 || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [code, countdown]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Preset configurations for each error code
  const configs = {
    401: {
      defaultTitle: 'Authentication Required',
      defaultDesc: 'Please log in to access this page.',
      badgeText: 'HTTP 401',
      badgeColor: '#F59E0B',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
    403: {
      defaultTitle: 'Access Denied',
      defaultDesc: "You don't have permission to access this resource.",
      badgeText: 'HTTP 403',
      badgeColor: '#EF4444',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      )
    },
    404: {
      defaultTitle: 'Page Not Found',
      defaultDesc: "The page you're looking for doesn't exist or has been moved.",
      badgeText: 'HTTP 404',
      badgeColor: '#FF6A1A',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )
    },
    429: {
      defaultTitle: 'Too Many Requests',
      defaultDesc: "You've made too many requests. Please try again later.",
      badgeText: 'HTTP 429',
      badgeColor: '#F97316',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    500: {
      defaultTitle: 'Something Went Wrong',
      defaultDesc: 'Our servers encountered an unexpected issue. Please try again shortly.',
      badgeText: 'HTTP 500',
      badgeColor: '#EF4444',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )
    },
    502: {
      defaultTitle: 'Bad Gateway',
      defaultDesc: 'Server communication error. Upstream service failed to respond.',
      badgeText: 'HTTP 502',
      badgeColor: '#F59E0B',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      )
    },
    503: {
      defaultTitle: 'Service Unavailable',
      defaultDesc: 'The system is undergoing scheduled maintenance or temporary capacity overload.',
      badgeText: 'HTTP 503',
      badgeColor: '#3B82F6',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    },
    504: {
      defaultTitle: 'Gateway Timeout',
      defaultDesc: 'The connection timed out while waiting for a response from the server.',
      badgeText: 'HTTP 504',
      badgeColor: '#8B5CF6',
      icon: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="6" x2="12" y2="12" />
          <line x1="12" y1="12" x2="16" y2="16" />
        </svg>
      )
    }
  };

  const currentConfig = configs[code] || configs[404];
  const finalTitle = title || currentConfig.defaultTitle;
  const finalDesc = description || currentConfig.defaultDesc;

  return (
    <div className="nexora-error-container">
      <div className="nexora-error-card">
        {/* Glowing Status Badge */}
        <div className="nexora-error-badge" style={{ borderColor: currentConfig.badgeColor }}>
          <span className="nexora-badge-dot" style={{ backgroundColor: currentConfig.badgeColor }} />
          <span>{currentConfig.badgeText}</span>
        </div>

        {/* Dynamic Icon */}
        <div className="nexora-error-icon-wrapper">
          {currentConfig.icon}
        </div>

        {/* Heading & Description */}
        <h1 className="nexora-error-title">{finalTitle}</h1>
        <p className="nexora-error-description">{finalDesc}</p>

        {/* Rate Limiting 429 Countdown */}
        {code === 429 && (
          <div className="nexora-retry-countdown-box">
            <span className="nexora-countdown-label">Remaining retry time:</span>
            <span className="nexora-countdown-timer">
              {countdown > 0 ? formatTime(countdown) : 'Ready'}
            </span>
            <div className="nexora-countdown-progress">
              <div
                className="nexora-countdown-bar"
                style={{
                  width: `${initialRetryAfter ? ((initialRetryAfter - countdown) / initialRetryAfter) * 100 : 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Context-Specific Action Buttons */}
        <div className="nexora-error-actions">
          {code === 401 && (
            <button
              type="button"
              className="nexora-btn-primary"
              onClick={onLogin || onGoHome}
            >
              Log In to Continue
            </button>
          )}

          {code === 403 && (
            <button
              type="button"
              className="nexora-btn-primary"
              onClick={onGoHome}
            >
              Back to Dashboard
            </button>
          )}

          {code === 404 && (
            <>
              {onGoBack && (
                <button
                  type="button"
                  className="nexora-btn-secondary"
                  onClick={onGoBack}
                >
                  Go Back
                </button>
              )}
              <button
                type="button"
                className="nexora-btn-primary"
                onClick={onGoHome}
              >
                Back to Home
              </button>
            </>
          )}

          {code === 429 && (
            <>
              <button
                type="button"
                className="nexora-btn-primary"
                onClick={onRetry}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Retry in ${countdown}s` : 'Try Again Now'}
              </button>
              {onGoHome && (
                <button
                  type="button"
                  className="nexora-btn-secondary"
                  onClick={onGoHome}
                >
                  Return to Dashboard
                </button>
              )}
            </>
          )}

          {(code === 500 || code === 502 || code === 503 || code === 504) && (
            <>
              {onRetry && (
                <button
                  type="button"
                  className="nexora-btn-primary"
                  onClick={onRetry}
                >
                  Try Again
                </button>
              )}
              <button
                type="button"
                className="nexora-btn-secondary"
                onClick={onGoHome}
              >
                Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

