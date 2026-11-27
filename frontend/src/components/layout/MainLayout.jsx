import React from 'react';
import { useRouter } from '../../routes/useRouter';

export const MainLayout = ({ children }) => {
  const { currentPath } = useRouter();
  const isDashboard = currentPath.toLowerCase().includes('dashboard');

  // Dashboard takes 100% edge-to-edge full width and its own modern scrolling layout
  if (isDashboard) {
    return <div className="admin-app-root">{children}</div>;
  }

  // Auth & Splash screens use centered viewport container
  return (
    <div className="app-viewport-root">
      <main className="main-display-area">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
