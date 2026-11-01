import React from 'react';
import { Button } from '../../components/common/Button';
import './NotFound.css';

export const NotFound = ({ onGoHome }) => {
  return (
    <div className="not-found-root container text-center py-5">
      <h1 className="not-found-code display-1 fw-bold">404</h1>
      <h2 className="not-found-title fs-3 fw-bold mb-2">Page Not Found</h2>
      <p className="not-found-desc lead text-muted mb-4">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button variant="primary" onClick={onGoHome} style={{ margin: '0 auto' }}>
        Return to Login
      </Button>
    </div>
  );
};

export default NotFound;
