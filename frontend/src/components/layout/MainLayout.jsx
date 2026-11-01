import React from 'react';

export const MainLayout = ({ children }) => {
  return (
    <div className="app-viewport-root">
      <main className="main-display-area">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
