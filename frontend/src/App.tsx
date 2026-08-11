import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/auth/Login';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { ShipmentList } from '@/pages/shipments/ShipmentList';
import { CreateShipment } from '@/pages/shipments/CreateShipment';
import { ShipmentDetail } from '@/pages/shipments/ShipmentDetail';
import { TrackingPage } from '@/pages/shipments/TrackingPage';
import { LiveDelivery } from '@/pages/operations/LiveDelivery';
import { FleetManagement } from '@/pages/operations/FleetManagement';
import { DriverManagement } from '@/pages/operations/DriverManagement';
import { DriverApp } from '@/pages/mobile/DriverApp';
import { RoutePlanner } from '@/pages/routes/RoutePlanner';
import { RouteOptimization } from '@/pages/routes/RouteOptimization';
import { Geofencing } from '@/pages/routes/Geofencing';
import { ETAPrediction } from '@/pages/intelligence/ETAPrediction';
import { PODDashboard } from '@/pages/delivery/PODDashboard';
import { DigitalSignature } from '@/pages/delivery/DigitalSignature';
import { NotificationCenter } from '@/pages/communications/NotificationCenter';
import { CommunicationLogs } from '@/pages/communications/CommunicationLogs';
import { ExecutiveAnalytics } from '@/pages/analytics/ExecutiveAnalytics';
import { Reports } from '@/pages/analytics/Reports';
import { SystemSettings } from '@/pages/admin/SystemSettings';
import { Users } from '@/pages/admin/Users';
import { Roles } from '@/pages/admin/Roles';
import { Integrations } from '@/pages/admin/Integrations';
import { ApiKeys } from '@/pages/admin/ApiKeys';
import { Webhooks } from '@/pages/admin/Webhooks';
import { AuditLogs } from '@/pages/admin/AuditLogs';
import { SystemHealth } from '@/pages/admin/SystemHealth';
import { Customers } from '@/pages/customers/Customers';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        
        {/* Core Authenticated Routes (Accessible to everyone, but content might differ) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/shipments" element={<ShipmentList />} />
            <Route path="/shipments/:id" element={<ShipmentDetail />} />
            
            {/* Business / Logistics / Support / Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['BusinessClient', 'LogisticsOperator', 'SupportAgent', 'Administrator']} />}>
              <Route path="/tracking/:id" element={<TrackingPage />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            {/* Business / Logistics / Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['BusinessClient', 'LogisticsOperator', 'Administrator']} />}>
              <Route path="/shipments/create" element={<CreateShipment />} />
              <Route path="/routes/planner" element={<RoutePlanner />} />
              <Route path="/routes/optimization" element={<RouteOptimization />} />
              <Route path="/analytics" element={<ExecutiveAnalytics />} />
            </Route>

            {/* Logistics / Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['LogisticsOperator', 'Administrator']} />}>
              <Route path="/operations" element={<LiveDelivery />} />
              <Route path="/fleet" element={<FleetManagement />} />
              <Route path="/drivers" element={<DriverManagement />} />
              <Route path="/routes/geofencing" element={<Geofencing />} />
              <Route path="/intelligence/eta" element={<ETAPrediction />} />
              <Route path="/pod" element={<PODDashboard />} />
              <Route path="/communications/logs" element={<CommunicationLogs />} />
            </Route>
            
            {/* Driver Only (Mobile app views in reality, but here for demo) */}
            <Route element={<ProtectedRoute allowedRoles={['Driver', 'Administrator']} />}>
              <Route path="/driver-app" element={<DriverApp />} />
              <Route path="/pod/signature" element={<DigitalSignature />} />
            </Route>

            {/* Admin Only */}
            <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/api" element={<ApiKeys />} />
              <Route path="/webhooks" element={<Webhooks />} />
              <Route path="/audit" element={<AuditLogs />} />
              <Route path="/system-health" element={<SystemHealth />} />
            </Route>
            
            {/* Placeholders for future phases */}
            <Route path="/support" element={<div className="p-4">Support (Pending)</div>} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
