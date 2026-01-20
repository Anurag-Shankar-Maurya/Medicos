import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { MedicineList } from '../features/inventory/MedicineList';
import { BillingPage } from '../features/billing/BillingPage';
import { CartPage } from '../features/cart/CartPage';
import { SalesPage } from '../features/sales/SalesPage';
import { SaleDetailPage } from '../features/sales/SaleDetailPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import ReportsPage from '../features/reports/ReportsPage';
import { StaffPage } from '../features/staff/StaffPage';
import { useAuth } from './providers';

// Guard for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Fallback loader
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

export const AppRouter = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<MedicineList />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="sales/:id" element={<SaleDetailPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<StaffPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
