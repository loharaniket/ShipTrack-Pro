import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import ShipmentList from './pages/shipments/ShipmentList';
import CreateShipment from './pages/shipments/CreateShipment';
import ShipmentDetails from './pages/shipments/ShipmentDetails';
import EditShipment from './pages/shipments/EditShipment';
import ProfileSettings from './pages/settings/ProfileSettings';
import PublicTracking from './pages/tracking/PublicTracking';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import CreateEditUser from './pages/admin/CreateEditUser';
import UserActivity from './pages/admin/UserActivity';
import CompanyManagement from './pages/admin/CompanyManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/track" element={<PublicTracking />} />
            <Route path="/track/:trackingNumber" element={<PublicTracking />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/shipments" element={
              <ProtectedRoute>
                <ShipmentList />
              </ProtectedRoute>
            } />
            
            <Route path="/shipments/create" element={
              <ProtectedRoute>
                <CreateShipment />
              </ProtectedRoute>
            } />
            
            <Route path="/shipments/:id" element={
              <ProtectedRoute>
                <ShipmentDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/shipments/:id/edit" element={
              <ProtectedRoute>
                <EditShipment />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/create" element={<CreateEditUser />} />
              <Route path="users/:id/edit" element={<CreateEditUser />} />
              <Route path="users/:id/activity" element={<UserActivity />} />
              <Route path="companies" element={<CompanyManagement />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
