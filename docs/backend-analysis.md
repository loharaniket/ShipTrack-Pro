# ShipTrack Pro - Backend Analysis & MVP Gap Report

## 1. Overview

This document provides a comprehensive technical analysis of the existing **ShipTrack Pro** backend codebase against the **B2C Logistics MVP Product Specification**.

The goal of this MVP is a clean, frictionless B2C shipment management platform supporting four key user roles:
1. **Customer**
2. **Logistics Operator (Driver)**
3. **Support Agent**
4. **Administrator**

---

## 2. Module-by-Module Technical Analysis

### 2.1 Authentication & Security
* **Existing**:
  - `User` entity (`id UUID`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `status`, `created_at`, `updated_at`, `last_login_at`).
  - `roles` and `user_roles` tables.
  - JWT token generation and validation (`JwtService`, `JwtFilter`, `SecurityConfig`).
  - Refresh token persistence and rotation (`RefreshToken`, `RefreshTokenRepository`).
  - `AuthController` exposing `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me`.
* **Missing**:
  - Direct MVP endpoints: `POST /api/auth/register` and `POST /api/auth/login` (without requiring `/v1` prefix or aliased to both).
  - MVP Registration response format: `{"success": true, "message": "Registration successful"}`.
  - MVP Login response format: `{"token": "jwt-token", "user": {"id": "...", "name": "Rahul", "role": "CUSTOMER"}}`.
  - Defined roles aligned with MVP: `CUSTOMER`, `DRIVER` (Logistics Operator), `SUPPORT_AGENT`, `ADMINISTRATOR`.
* **Broken / Need Refactor**:
  - `AuthService.register()` automatically initializes an `Organization` and `OrganizationMember`, tightly coupling B2C user registration with the enterprise B2B organization hierarchy.
  - Role management contains `BUSINESS_CLIENT` which is enterprise-specific.
* **Need Remove**:
  - Multi-tenant organization auto-provisioning logic in `AuthService`.

---

### 2.2 User Management
* **Existing**:
  - `User` entity, `UserRepository`, `UserService`, and `UserController` (`/api/v1/users`).
* **Missing**:
  - Direct role-based admin endpoints under `/api/admin/users` and `/api/admin/drivers` / `/api/admin/operators`.
* **Need Refactor**:
  - Simplify user roles to direct B2C roles (`CUSTOMER`, `DRIVER`, `SUPPORT_AGENT`, `ADMINISTRATOR`).
  - Ensure password encryption uses BCrypt and validation is standard.

---

### 2.3 Shipment Management
* **Existing**:
  - `Shipment` entity with `id`, `tracking_number`, `organization_id`, `created_by`, `customer_name`, `recipient_name`, `recipient_phone`, `origin_address_id`, `destination_address_id`, `service_type`, `priority`, `status`.
  - `shipment_packages` table and `Address` entity.
  - `ShipmentController` at `/api/v1/shipments`.
* **Missing**:
  - MVP Customer APIs:
    - `POST /api/customer/shipments` (with `senderName`, `senderPhone`, `receiverName`, `receiverPhone`, `pickupAddress`, `deliveryAddress`, `packageDescription`, `weight`).
    - `GET /api/customer/shipments` (lists current customer's shipments).
    - `GET /api/customer/shipments/{id}` (customer shipment details).
  - MVP Admin APIs:
    - `GET /api/admin/shipments/pending` (lists unassigned shipments for dispatch).
    - `GET /api/admin/shipments` (all shipments monitor).
  - MVP Shipment Status Flow:
    `CREATED` -> `ASSIGNED` -> `PICKED_UP` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED`.
* **Need Refactor**:
  - Decouple `Shipment` from `organization_id` and normalize address fields directly or via flexible schema to match simple B2C inputs.
  - Update `ShipmentStatus` enum to strictly follow the 6-state MVP pipeline.

---

### 2.4 Tracking & History
* **Existing**:
  - `shipment_history` table (V10) and `ShipmentTrackingEvent` entity.
  - `TrackingController` at `/api/v1/tracking/{id}`.
* **Missing**:
  - Public Tracking API: `GET /api/tracking/{trackingNumber}` returning:
    ```json
    {
      "trackingNumber": "STP10001",
      "currentStatus": "IN_TRANSIT",
      "timeline": [
        {
          "status": "CREATED",
          "description": "Shipment created",
          "updatedBy": "Rahul Patil",
          "createdAt": "2026-08-17T10:00:00Z"
        }
      ]
    }
    ```
  - Direct tracking event recording whenever a shipment status transition occurs.
* **Need Refactor**:
  - `ShipmentTracking` model fields: `id UUID`, `shipment_id`, `status`, `description`, `updated_by`, `created_at`.

---

### 2.5 Driver & Delivery Assignment
* **Existing**:
  - `delivery` package with `Driver`, `Vehicle`, `ShipmentAssignment`, `DriverLocation`, `WebSocketConfig`, `LiveLocationController`.
  - `routes` and `route_stops` (V11-V16).
* **Missing**:
  - Admin Assignment API: `POST /api/admin/assignments` (`{ "shipmentId": "...", "driverId": "..." }`).
  - Driver APIs:
    - `GET /api/operator/deliveries` (fetch driver's assigned shipments).
    - `PUT /api/operator/shipments/{id}/status` (`{ "status": "IN_TRANSIT", "description": "Package reached Pune hub" }`).
* **Need Refactor**:
  - Simplify `delivery` into `driver` / `admin` packages with a clean `DeliveryAssignment` entity (`id UUID`, `shipment_id`, `driver_id`, `assigned_date`, `status`).
* **Need Remove**:
  - Live location websockets (`LiveLocationController`, `WebSocketConfig`, `DriverLocation`).
  - Vehicle fleet entities (`Vehicle`).
  - Route optimization modules (`routes`, `route_stops`, `RouteController`, `RouteService`).

---

### 2.6 Proof Of Delivery (POD)
* **Existing**:
  - `PodRecord` entity (`id`, `shipment`, `driver`, `packagePhoto`, `doorPhoto`, `signature`, `status`).
  - `PodController` (`/api/v1/pod/upload-photo`, `/api/v1/pod/submit`).
* **Missing**:
  - Driver POD API: `POST /api/operator/pod` (`multipart/form-data` with `shipmentId`, `receiverName`, `photo`).
  - Storing POD record (`id UUID`, `shipment_id`, `receiver_name`, `photo_url`, `delivery_time`).
  - Automatically transitioning shipment status to `DELIVERED` upon successful POD upload.
  - Customer API to view POD for delivered shipment.
* **Need Refactor**:
  - Replace complex multi-photo signature model with simple `ProofOfDelivery` model matching the MVP spec.

---

### 2.7 Support & Tickets
* **Existing**:
  - `support` package with `SupportException` and `SupportEscalation`.
* **Missing**:
  - B2C Customer Complaint API: `POST /api/customer/tickets`.
  - Support Agent APIs:
    - `GET /api/support/tickets` (list all tickets).
    - `GET /api/support/tickets/{id}` (ticket details).
    - `PUT /api/support/tickets/{id}` (update ticket status / resolution notes).
  - `SupportTicket` model: `id UUID`, `customer_id`, `shipment_id`, `subject`, `description`, `status`, `created_at`.
* **Need Refactor**:
  - Replace `SupportException` / `SupportEscalation` with standard `SupportTicket` model and service.

---

### 2.8 Dashboard & Reports
* **Existing**:
  - `analytics` package with `AnalyticsController` and enterprise KPI calculators.
* **Missing**:
  - Administrator dashboard statistics endpoint (`GET /api/admin/dashboard/stats`).
  - Basic summary reports for shipments, deliveries, active drivers, and open complaints.
* **Need Remove**:
  - Complex enterprise analytics and ML/AI ETA prediction services (`intelligence` package).

---

## 3. Categorized Summary Report

| Category | Components / Features | Action |
|---|---|---|
| **Existing & Retained** | Flyway migration setup, PostgreSQL configuration, JWT token generation & filter, Spring Security stateless architecture, Password hashing (BCrypt), Global exception handling framework | Keep & Refine |
| **Missing** | B2C Customer APIs (`/api/customer/*`), Driver Operator APIs (`/api/operator/*`), Admin Assignment APIs (`/api/admin/*`), Support Ticket APIs (`/api/support/*`), Public Tracking API (`/api/tracking/*`), B2C Flyway migration scripts | Implement Phase by Phase |
| **Broken / Out of Spec** | Duplicate key handling in legacy tests, registration requiring organization creation, status flow mismatch (`READY_FOR_PLANNING` vs MVP `CREATED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`) | Fix & Align |
| **Need Refactor** | `Shipment` entity & DTOs, `User` entity & roles, `PodRecord` -> `ProofOfDelivery`, `SupportException` -> `SupportTicket`, `ShipmentAssignment` -> `DeliveryAssignment` | Refactor cleanly |
| **Need Remove** | `intelligence` package (AI ETA), `analytics` enterprise KPIs, `route` optimization & stops, `organization` B2B multi-tenancy, `audit` enterprise logger, `search` global search, WebSocket live location tracking | Remove to avoid bloat |

---

## 4. Package Structure Alignment

The target package structure will strictly adhere to:
```
com.shiptrackpro.backend
 ├── auth            # Login, Register, JWT, Security filters
 ├── user            # User entity, User Management
 ├── shipment        # Shipment entity, Customer shipment APIs, Admin shipment monitor
 ├── tracking        # ShipmentTracking entity, Tracking timeline APIs
 ├── driver          # Driver deliveries, status updates, assignment handling
 ├── pod             # Proof Of Delivery entity, upload handling
 ├── support         # SupportTicket entity, Customer complaint & Support agent APIs
 ├── admin           # Admin assignments, driver/user management, statistics & reports
 ├── notification    # Simple event notifications / status alerts
 └── common          # DTOs, exceptions, responses, security utilities
```
