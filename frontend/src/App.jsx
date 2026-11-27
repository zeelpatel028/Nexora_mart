import React from 'react';
import { AuthProvider, ThemeProvider } from './contexts';
import { RouterProvider } from './routes/RouterContext';
import { AppRoutes } from './routes';
import { MainLayout } from './components/layout';
import './App.css';

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <MainLayout>
            <AppRoutes brandName="TULSI MART" />
          </MainLayout>
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}

export default App;