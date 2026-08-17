# ShipTrack Pro - Frontend Audit & B2C MVP Alignment Analysis

**Author**: Senior Frontend Integration Engineer  
**Status**: Completed — Awaiting User Approval before Phase 2 Implementation  
**Backend Source of Truth**: B2C MVP Backend (100% verified, 43 automated tests passing)

---

## 1. Inventory of Existing Frontend Pages & Components

### 1.1 Authentication & Profile Pages (`src/pages/auth/`)
* **`Login.tsx`**: Existing login form with email/password. Uses `authService.login()`.
* **`Register.tsx`**: Existing registration form. Needs alignment with B2C MVP registration contract (`firstName`, `lastName`, `email`, `phone`, `password`).
* **`ForgotPassword.tsx`**: Mock UI (not part of MVP backend).
* **`Profile.tsx`**: Large mock profile editor.

### 1.2 Dashboard Pages (`src/pages/dashboards/` & `src/pages/Dashboard.tsx`)
* **`Dashboard.tsx`**: Switch component directing to role dashboards.
* **`CustomerDashboard.tsx`**: Contains KPI cards, shipment tracking input, and recent shipments table (currently uses mock data from `DomainContext`).
* **`DriverDashboard.tsx`**: Legacy driver dashboard showing active routes and mock stops.
* **`AdministratorDashboard.tsx`**: Contains fake analytics charts, enterprise metrics, and mock stat cards.
* **`BusinessClientDashboard.tsx`**: Legacy non-MVP role dashboard.

### 1.3 Shipment & Tracking Pages (`src/pages/shipments/`)
* **`ShipmentList.tsx`**: Table of shipments (currently reading from `DomainContext` / mock).
* **`CreateShipment.tsx`**: Multi-step package wizard with complex dimensional weight calculations (needs alignment with B2C MVP flat fields: `senderName`, `senderPhone`, `receiverName`, `receiverPhone`, `pickupAddress`, `deliveryAddress`, `packageDescription`, `weight`).
* **`ShipmentDetail.tsx`**: Large shipment details view.
* **`TrackingPage.tsx`**: Public/customer tracking timeline view.

### 1.4 Unsupported / Enterprise Pages (To Be Removed)
* **`src/pages/routes/`**: `RoutePlanner.tsx`, `RouteOptimization.tsx`, `Geofencing.tsx`
* **`src/pages/intelligence/`**: `ETAPrediction.tsx`
* **`src/pages/operations/`**: `LiveDelivery.tsx`, `DriverManagement.tsx`
* **`src/pages/delivery/`**: `DigitalSignature.tsx`, `PODDashboard.tsx` (legacy complex enterprise tables)
* **`src/pages/admin/`**: `Organizations.tsx`, `Roles.tsx`, `AuditLogs.tsx`, `SystemHealth.tsx`, `SystemSettings.tsx`
* **`src/pages/analytics/`**: `ExecutiveAnalytics.tsx`
* **`src/pages/communications/`**: `CommunicationLogs.tsx`

---

## 2. Existing API Services & Mock Data Analysis

### 2.1 API Client (`src/services/apiClient.ts`)
* Uses `fetchWithAuth()` with `localStorage.getItem('accessToken')` and automatic refresh token retry against `/api/v1/auth/refresh`.
* Works with Vite proxy (`/api` $\rightarrow$ `http://localhost:8080`).

### 2.2 Mock Data & State Stores (`src/services/mockData.ts` & `src/context/DomainContext.tsx`)
* **`mockData.ts`** (13.7 KB): Contains large arrays of fake enterprise data: `MOCK_ORGANIZATIONS`, `MOCK_ADDRESSES`, `MOCK_PACKAGES`, `MOCK_DRIVER_VEHICLE_ASSIGNMENTS`, `MOCK_EXCEPTIONS`, `MOCK_PODS`, `MOCK_STATUS_EVENTS`, `MOCK_TRACKING_EVENTS`.
* **`DomainContext.tsx`** (17.5 KB): Manages in-memory state for routes, stops, vehicles, and organizations.
* **Legacy Sub-APIs (`src/services/api/`)**: `organizationApi.ts`, `routeApi.ts`, `intelligenceApi.ts`, `analyticsApi.ts` call non-existent backend routes.

---

## 3. Feature Comparison & Action Table

| Frontend Feature | Backend API Available | Action Required |
| :--- | :--- | :--- |
| **Customer Register** | `POST /api/auth/register` | Connect real API with validation and redirect to Login |
| **Customer / User Login** | `POST /api/auth/login` | Connect real API; store `accessToken`, `refreshToken`, and `user.role` |
| **Current User Me** | `GET /api/auth/me` | Connect real API on startup |
| **Customer Shipment Creation** | `POST /api/customer/shipments` | Connect real API; show generated `STP10001+` tracking number |
| **Customer Shipment History** | `GET /api/customer/shipments` | Connect real API; display table with live status badges |
| **Customer Shipment Detail** | `GET /api/customer/shipments/{id}` | Connect real API; render full metadata and timeline |
| **Customer Proof of Delivery View** | `GET /api/customer/shipments/{id}/pod` | Connect real API; display recipient name, photo, delivery timestamp |
| **Public Tracking** | `GET /api/tracking/{trackingNumber}` | Connect real API; render chronological sanitized timeline |
| **Customer Support Ticket Creation** | `POST /api/customer/tickets` | **NEW**: Create `CreateComplaint.tsx` form |
| **Customer View Tickets** | `GET /api/customer/tickets` | **NEW**: Create `MyTickets.tsx` list |
| **Driver Assigned Deliveries** | `GET /api/operator/deliveries` | Connect real API; display assigned shipments |
| **Driver Status Progression** | `PUT /api/operator/shipments/{id}/status` | Connect real API; allowed: `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY` |
| **Driver POD Upload** | `POST /api/operator/pod` (multipart) | Connect real API; file upload + recipient name $\rightarrow$ transitions to `DELIVERED` |
| **Support Agent Tickets List** | `GET /api/support/tickets` | **NEW**: Create `SupportDashboard.tsx` and `Tickets.tsx` with status filters |
| **Support Agent Ticket Resolution** | `PUT /api/support/tickets/{id}` | **NEW**: Create `TicketDetails.tsx` with status update modal |
| **Admin Dashboard Stats** | `GET /api/admin/dashboard/stats` | Connect real API; replace fake charts with live KPI metrics |
| **Admin Pending Dispatch** | `GET /api/admin/shipments/pending` | **NEW**: Create `PendingShipments.tsx` / `AssignDelivery.tsx` |
| **Admin Driver Assignment** | `POST /api/admin/assignments` | Connect real API with driver selector modal |
| **Admin Driver List** | `GET /api/admin/drivers` | Connect real API; view active driver pool |
| **Admin User Management** | `GET /api/admin/users` | Connect real API; paginated user table |
| **Admin Operational Reports** | `GET /api/admin/reports` | Connect real API; live status breakdown and platform totals |
| **In-App Notifications** | `GET /api/notifications/my-alerts`<br>`PUT /api/notifications/{id}/read` | Connect real API in `NotificationBell.tsx` and `NotificationCenter.tsx` |
| *Route Optimization & AI* | Not supported in B2C MVP | **REMOVE** |
| *Geofencing & Map Routing* | Not supported in B2C MVP | **REMOVE** |
| *ETA Prediction Engine* | Not supported in B2C MVP | **REMOVE** |
| *Organization Management* | Not supported in B2C MVP | **REMOVE** |
| *Executive Analytics / Warehouse* | Not supported in B2C MVP | **REMOVE** |

---

## 4. Missing Pages to be Created for B2C MVP

### Customer Module (`src/pages/customer/`)
1. `CustomerDashboard.tsx` (Connected to live shipment summary & quick track)
2. `CreateShipment.tsx` (B2C form: sender, receiver, addresses, description, weight)
3. `MyShipments.tsx` (Live customer shipments list)
4. `ShipmentDetails.tsx` (Metadata + chronological events + POD view)
5. `TrackShipment.tsx` (Public / authenticated timeline search)
6. `CreateComplaint.tsx` (Raise ticket for delayed / damaged shipment)
7. `MyTickets.tsx` (List customer's support tickets & statuses)

### Driver / Operator Module (`src/pages/driver/`)
1. `DriverDashboard.tsx` (Assigned shipments summary)
2. `AssignedDeliveries.tsx` (Live list of driver deliveries)
3. `UpdateShipmentStatus.tsx` / modal (`PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`)
4. `UploadPOD.tsx` (Photo capture / file picker + receiver name input)

### Support Agent Module (`src/pages/support/`)
1. `SupportDashboard.tsx` (Overview of complaints by status)
2. `Tickets.tsx` (Filterable table: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
3. `TicketDetails.tsx` (Customer inquiry details, shipment reference, status updater)

### Admin Module (`src/pages/admin/`)
1. `AdminDashboard.tsx` (Live KPIs from `/api/admin/dashboard/stats`)
2. `Users.tsx` (Live user management from `/api/admin/users`)
3. `Drivers.tsx` (Live driver management from `/api/admin/drivers`)
4. `PendingShipments.tsx` / `AssignDelivery.tsx` (Queue of `CREATED` shipments to assign drivers)
5. `Reports.tsx` (Live status distribution from `/api/admin/reports`)

### Notifications (`src/components/notifications/`)
1. `NotificationBell.tsx` (Top nav badge with unread count)
2. `NotificationCenter.tsx` (List of user alerts with click to mark as read)

---

## 5. Remove List (Unsupported / Fake Enterprise Features)

The following files and fake mock services will be removed or replaced with real B2C components:
* `src/pages/routes/RoutePlanner.tsx`, `RouteOptimization.tsx`, `Geofencing.tsx`
* `src/pages/intelligence/ETAPrediction.tsx`
* `src/pages/operations/LiveDelivery.tsx`
* `src/pages/analytics/ExecutiveAnalytics.tsx`
* `src/pages/admin/Organizations.tsx`, `Roles.tsx`, `AuditLogs.tsx`, `SystemHealth.tsx`
* `src/pages/communications/CommunicationLogs.tsx`
* `src/pages/dashboards/BusinessClientDashboard.tsx`
* `src/services/api/routeApi.ts`, `intelligenceApi.ts`, `analyticsApi.ts`, `organizationApi.ts`
* `src/services/mockData.ts`, `src/services/mockWebSocket.ts`

---

## 6. Clean Service Layer Architecture

The frontend will use dedicated, typed services inside `src/services/`:
```
src/services/
 ├── authService.ts          # login, register, logout, getCurrentUser
 ├── shipmentService.ts      # createShipment, getCustomerShipments, getShipmentById, getShipmentPod
 ├── trackingService.ts      # getPublicTrackingTimeline
 ├── driverService.ts        # getAssignedDeliveries, updateShipmentStatus, uploadPod
 ├── supportService.ts       # createTicket, getMyTickets, getAllTickets, getTicketDetails, updateTicketStatus
 ├── adminService.ts         # getDashboardStats, getReports, getPendingShipments, assignDriver, getDrivers, getUsers
 └── notificationService.ts  # getMyAlerts, markAsRead
```

---

## 7. Implementation Roadmap (Phased Execution)

* **Phase 1**: Frontend Audit & API Alignment Analysis (**Completed — Current Step**)
* **Phase 2**: Authentication & Role-Based Routing Integration
* **Phase 3**: Customer Module (Shipment booking, tracking, POD, and complaint creation)
* **Phase 4**: Admin Module (KPI dashboard, pending shipments queue, driver assignment, users, reports)
* **Phase 5**: Driver Module (Assigned deliveries, status updates, POD multipart upload)
* **Phase 6**: Support Module (Ticket queues, status filtering, resolution updates)
* **Phase 7**: Notification Center, Common UI Polish, and Production Build Verification
