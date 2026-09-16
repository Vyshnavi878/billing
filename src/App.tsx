import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BillingPage from './pages/BillingPage';
import InvoicesPage from './pages/InvoicesPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import PaymentsPage from './pages/PaymentsPage';
import ExpensesPage from './pages/ExpensesPage';
import GSTPage from './pages/GSTPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

import CreateInvoicePage from './pages/CreateInvoicePage';
import InvoicePreviewPage from './pages/InvoicePreviewPage';
import InvoiceSuccessPage from './pages/InvoiceSuccessPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CustomerDetailPage from './pages/CustomerDetailPage';

// Protected route guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Login route (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

    {/* Protected - inside AppShell */}
    <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
      <Route index element={<DashboardPage />} />
      <Route path="billing" element={<BillingPage />} />
      <Route path="billing/create" element={<CreateInvoicePage />} />
      <Route path="billing/preview" element={<InvoicePreviewPage />} />
      <Route path="billing/preview/:id" element={<InvoicePreviewPage />} />
      <Route path="billing/success" element={<InvoiceSuccessPage />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="invoices/:id" element={<InvoiceDetailPage />} />
      <Route path="invoices/:id/preview" element={<InvoicePreviewPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="inventory/:id" element={<ProductDetailPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="customers/:id" element={<CustomerDetailPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="expenses" element={<ExpensesPage />} />
      <Route path="gst" element={<GSTPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>

    {/* Catch all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <AppProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AppProvider>
);

export default App;
