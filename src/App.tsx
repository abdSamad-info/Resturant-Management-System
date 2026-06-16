import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationProvider } from './context/NotificationContext';

// Shared Layout Custom Frame
import Layout from './components/Layout';

// Module View Elements
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';

// Initialize the React Query standard client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent redundant requests during focus
      retry: 1,                    // Graceful failover limit
      staleTime: 1000 * 60 * 3     // 3 minutes stale cache threshhold
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
              {/* Fallback route to home */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </HashRouter>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
