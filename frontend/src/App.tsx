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
import { AssignedDeliveries } from '@/pages/driver/AssignedDeliveries';
import { NotificationCenter } from '@/pages/communications/NotificationCenter';
import { PendingShipments } from '@/pages/admin/PendingShipments';
import { Drivers } from '@/pages/admin/Drivers';
import { Users } from '@/pages/admin/Users';
import { Reports } from '@/pages/admin/Reports';
import { LiveFleetTracking } from '@/pages/admin/LiveFleetTracking';
import { LiveTrackingView } from '@/pages/tracking/LiveTrackingView';
import { Tickets } from '@/pages/support/Tickets';
import { SupportTicketDetails } from '@/pages/support/SupportTicketDetails';
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
              <Route path="/shipments/:id/live-tracking" element={<LiveTrackingView />} />
              <Route path="/tracking/live/:id" element={<LiveTrackingView />} />
              <Route path="/tracking" element={<TrackShipment />} />
              <Route path="/tracking/:trackingNumber" element={<TrackShipment />} />

              {/* Customer Support Routes */}
              <Route path="/customer/tickets" element={<MyTickets />} />
              <Route path="/customer/tickets/create" element={<CreateComplaint />} />
              <Route path="/customer/tickets/:id" element={<TicketDetails />} />
              
              {/* Admin & Support Fleet Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'SupportAgent']} />}>
                <Route path="/admin/fleet" element={<LiveFleetTracking />} />
                <Route path="/admin/tracking/fleet" element={<LiveFleetTracking />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="/admin/shipments/pending" element={<PendingShipments />} />
                <Route path="/admin/drivers" element={<Drivers />} />
                <Route path="/admin/users" element={<Users />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/drivers" element={<Drivers />} />
              </Route>

              {/* Support Agent & Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SupportAgent', 'Administrator']} />}>
                <Route path="/support/tickets" element={<Tickets />} />
                <Route path="/support/tickets/:id" element={<SupportTicketDetails />} />
              </Route>
              
              {/* Driver Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['Driver', 'Administrator']} />}>
                <Route path="/driver/deliveries" element={<AssignedDeliveries />} />
                <Route path="/operator/deliveries" element={<AssignedDeliveries />} />
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
