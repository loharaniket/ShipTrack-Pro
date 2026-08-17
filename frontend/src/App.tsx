import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { DomainProvider } from '@/context/DomainContext';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { MyShipments } from '@/pages/customer/MyShipments';
import { CreateShipment } from '@/pages/customer/CreateShipment';
import { ShipmentDetails } from '@/pages/customer/ShipmentDetails';
import { TrackShipment } from '@/pages/customer/TrackShipment';
import { CreateComplaint } from '@/pages/customer/CreateComplaint';
import { MyTickets } from '@/pages/customer/MyTickets';
import { TicketDetails } from '@/pages/customer/TicketDetails';
import { LiveDelivery } from '@/pages/operations/LiveDelivery';
import { DriverManagement } from '@/pages/operations/DriverManagement';
import { MyRoute } from '@/pages/driver/MyRoute';
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
import { AuditLogs } from '@/pages/admin/AuditLogs';
import { SystemHealth } from '@/pages/admin/SystemHealth';
import { Organizations } from '@/pages/admin/Organizations';
import { Customers } from '@/pages/admin/Customers';
import { Profile } from '@/pages/auth/Profile';
import { NotFound } from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <DomainProvider>
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Public Track Route (accessible without login) */}
          <Route path="/track" element={<TrackShipment />} />
          <Route path="/track/:trackingNumber" element={<TrackShipment />} />
        
          {/* Core Authenticated Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<NotificationCenter />} />

              {/* Customer Shipment Routes */}
              <Route path="/shipments" element={<MyShipments />} />
              <Route path="/shipments/create" element={<CreateShipment />} />
              <Route path="/shipments/:id" element={<ShipmentDetails />} />
              <Route path="/tracking" element={<TrackShipment />} />
              <Route path="/tracking/:trackingNumber" element={<TrackShipment />} />

              {/* Customer Support Routes */}
              <Route path="/customer/tickets" element={<MyTickets />} />
              <Route path="/customer/tickets/create" element={<CreateComplaint />} />
              <Route path="/customer/tickets/:id" element={<TicketDetails />} />
              
              {/* Business / Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['BusinessClient', 'Administrator']} />}>
                <Route path="/customers" element={<Customers />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
              
              {/* Business / Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['BusinessClient', 'Administrator']} />}>
                <Route path="/analytics" element={<ExecutiveAnalytics />} />
              </Route>

              {/* Admin Only - Operational Control */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="/routes/planner" element={<RoutePlanner />} />
                <Route path="/routes/optimization" element={<RouteOptimization />} />
              </Route>

              {/* Admin Only - Operational Control is now just Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="/operations" element={<LiveDelivery />} />
                <Route path="/drivers" element={<DriverManagement />} />
                <Route path="/routes/geofencing" element={<Geofencing />} />
                <Route path="/intelligence/eta" element={<ETAPrediction />} />
                <Route path="/pod" element={<PODDashboard />} />
                <Route path="/communications/logs" element={<CommunicationLogs />} />
              </Route>
              
              {/* Driver Only Web Views */}
              <Route element={<ProtectedRoute allowedRoles={['Driver', 'Administrator']} />}>
                <Route path="/my-route" element={<MyRoute />} />
                <Route path="/pod/signature" element={<DigitalSignature />} />
              </Route>

              {/* Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="/settings" element={<SystemSettings />} />
                <Route path="/organizations" element={<Organizations />} />
                <Route path="/users" element={<Users />} />
                <Route path="/roles" element={<Roles />} />
                <Route path="/audit" element={<AuditLogs />} />
                <Route path="/system-health" element={<SystemHealth />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DomainProvider>
    </AuthProvider>
  );
}

export default App;
