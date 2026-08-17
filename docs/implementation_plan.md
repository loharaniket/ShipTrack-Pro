# ShipTrack Pro - Final B2C MVP Backend Implementation Plan

This implementation plan incorporates all specifications, architectural constraints, and governance rules for the **ShipTrack Pro B2C MVP Backend**.

---

## 1. System Architecture & Role Matrix

The system supports four distinct user roles, where Driver and Support Agent are standard users assigned their respective roles:

| Feature / Action | Customer | Driver (Operator) | Support Agent | Administrator |
|---|:---:|:---:|:---:|:---:|
| Register & Login | Yes | Yes | Yes | Yes |
| Create Shipment (`POST /api/customer/shipments`) | **Yes** | No | No | No (Monitor only) |
| View Own Shipments (`GET /api/customer/shipments`) | **Own Only** | No | No | All |
| Public Tracking (`GET /api/tracking/{trackingNumber}`) | **Public** | **Public** | **Public** | **Public** |
| View Assigned Deliveries (`GET /api/operator/deliveries`) | No | **Assigned Only** | No | All |
| Update Status (`PUT /api/operator/shipments/{id}/status`) | No | **Assigned Only** (up to `OUT_FOR_DELIVERY`) | No | Allowed |
| Upload POD & Complete Delivery (`POST /api/operator/pod`) | No | **Assigned Only** | No | Allowed |
| View Proof of Delivery (POD) | **Own Shipments** | Assigned Only | Yes | Yes |
| Create Support Ticket (`POST /api/customer/tickets`) | **Yes** | No | No | No |
| Manage Support Tickets (`/api/support/tickets/**`) | Own Tickets | No | **Yes** | **Yes** |
| Assign Driver (`POST /api/admin/assignments`) | No | No | No | **Yes** |
| Manage Users & Drivers (`/api/admin/**`) | No | No | No | **Yes** |
| View Dashboard & Reports (`/api/admin/dashboard/**`) | No | No | No | **Yes** |

---

## 2. Core Business & Technical Constraints

1. **Shipment Lifecycle State Machine**:
   $$\text{CREATED} \longrightarrow \text{ASSIGNED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{IN\_TRANSIT} \longrightarrow \text{OUT\_FOR\_DELIVERY} \longrightarrow \text{DELIVERED}$$
   - Direct status endpoint (`PUT /api/operator/shipments/{id}/status`) only permits transitions up to `OUT_FOR_DELIVERY`.
   - The final transition to `DELIVERED` is strictly triggered by **Proof of Delivery (POD) upload** (`POST /api/operator/pod`).
   - Any invalid, skipped, or backward status transitions are rejected with a descriptive `400 Bad Request`.

2. **Shipment Transaction Consistency**:
   - All shipment status transitions are executed in a single atomic `@Transactional` boundary updating:
     1. `shipments.status`
     2. `shipment_tracking` (audit timeline record)
     3. `notifications` (in-app alert record for customer / assigned driver)

3. **Tracking Data Privacy**:
   - Public tracking response (`GET /api/tracking/{trackingNumber}`) strictly omits internal staff names / user IDs (`updatedBy`), providing customer-safe timeline events (`status`, `description`, `timestamp`, `location`).

4. **Proof of Delivery (POD) File Storage**:
   - Uploaded POD photos are saved to local filesystem storage (e.g. `uploads/pod/`).
   - Database stores only the accessible `photo_url` string—no Base64 strings or binary blobs in the database.

5. **API Compatibility & Minimality**:
   - New MVP endpoints strictly follow `/api/...`.
   - Compatibility mappings (e.g. `/api/v1/auth/*`, `/api/v1/shipments`) are preserved only where actively consumed by existing frontend services.
   - No unnecessary APIs outside the MVP specification will be added.

6. **Migration Safety**:
   - Verified current migrations in `db/migration/`: V1 through V16 exist.
   - New migrations will start sequentially at `V17__...`.

---

## 3. Phased Implementation Roadmap

### Phase 1: Authentication & User Roles
* **Database (`V17__b2c_roles_and_schema.sql`)**:
  - Verify and ensure roles `CUSTOMER`, `DRIVER`, `SUPPORT_AGENT`, `ADMINISTRATOR` exist.
* **APIs**:
  - `POST /api/auth/register` (and `/api/v1/auth/register` for frontend compatibility):
    - Payload: `{ "firstName", "lastName", "email", "phone", "password" }`.
    - Hashes password with BCrypt, assigns `CUSTOMER` role, saves user.
    - Returns `{ "success": true, "message": "Registration successful" }`.
  - `POST /api/auth/login` (and `/api/v1/auth/login`):
    - Payload: `{ "email", "password" }`.
    - Returns `{ "token": "<jwt>", "user": { "id": "...", "name": "Rahul Patil", "role": "CUSTOMER" } }`.
  - Retain `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` for frontend session management.
* **Security**:
  - Stateless JWT authentication filter, role-based method security (`@PreAuthorize`).

---

### Phase 2: Customer Shipment Management
* **Database**:
  - Ensure `shipments` table supports B2C schema: `id UUID`, `tracking_number`, `customer_id`, `sender_name`, `sender_phone`, `receiver_name`, `receiver_phone`, `pickup_address`, `delivery_address`, `package_description`, `weight`, `status`, `created_at`.
* **APIs**:
  - `POST /api/customer/shipments`:
    - Only `CUSTOMER` allowed.
    - Generates unique tracking number (`STP10001`, sequential/formatted).
    - Initializes status `CREATED`.
    - Creates initial tracking event and in-app notification in one transaction.
    - Returns `{ "message": "Shipment created", "trackingNumber": "STP10001", "status": "CREATED" }`.
  - `GET /api/customer/shipments`:
    - Returns paginated shipments created by the authenticated customer.
  - `GET /api/customer/shipments/{id}`:
    - Returns shipment details for the owner customer (or admin/support).

---

### Phase 3: Admin Delivery Assignment
* **Database**:
  - `delivery_assignments` table: `id UUID`, `shipment_id UUID`, `driver_id UUID`, `assigned_date TIMESTAMP`, `status VARCHAR`.
* **APIs**:
  - `GET /api/admin/shipments/pending`:
    - Returns unassigned shipments (`status = 'CREATED'`).
  - `POST /api/admin/assignments`:
    - Payload: `{ "shipmentId": "...", "driverId": "..." }`.
    - Validates driver exists (user with `DRIVER` role) and shipment is `CREATED`.
    - Creates `DeliveryAssignment` record.
    - Transactionally transitions shipment status `CREATED` $\rightarrow$ `ASSIGNED`.
    - Appends tracking event and creates customer & driver in-app notifications.

---

### Phase 4: Driver Workflow (Logistics Operator)
* **APIs**:
  - `GET /api/operator/deliveries`:
    - Returns deliveries assigned exclusively to the authenticated driver.
  - `PUT /api/operator/shipments/{id}/status`:
    - Payload: `{ "status": "IN_TRANSIT", "description": "Package reached Pune hub" }`.
    - Validates shipment assignment matches caller.
    - Validates status flow: `ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY`.
    - Prevents transitioning directly to `DELIVERED` via this endpoint.
    - Atomically updates shipment status, inserts tracking event, and creates in-app notification.

---

### Phase 5: Public Tracking System
* **APIs**:
  - `GET /api/tracking/{trackingNumber}`:
    - Public endpoint (no JWT required).
    - Returns:
      ```json
      {
        "trackingNumber": "STP10001",
        "currentStatus": "IN_TRANSIT",
        "timeline": [
          {
            "status": "CREATED",
            "description": "Shipment registered",
            "createdAt": "2026-08-17T10:00:00Z"
          },
          {
            "status": "ASSIGNED",
            "description": "Driver assigned",
            "createdAt": "2026-08-17T11:00:00Z"
          },
          {
            "status": "IN_TRANSIT",
            "description": "Package reached Pune hub",
            "createdAt": "2026-08-17T14:30:00Z"
          }
        ]
      }
      ```
    - Privacy protection: Internal employee identities are not exposed.

---

### Phase 6: Proof of Delivery (POD)
* **Database**:
  - `proof_of_delivery` table: `id UUID`, `shipment_id UUID`, `receiver_name VARCHAR`, `photo_url VARCHAR`, `delivery_time TIMESTAMP`.
* **File Storage**:
  - Configure file storage service saving files under `uploads/pod/` and serving via static resource handler `/uploads/pod/**`.
* **APIs**:
  - `POST /api/operator/pod`:
    - Multipart form: `shipmentId`, `receiverName`, `photo` (file).
    - Validates shipment is assigned to driver and is in `OUT_FOR_DELIVERY` status.
    - Saves photo file to disk, saves `ProofOfDelivery` with `photo_url`.
    - Transactionally transitions shipment status `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`.
    - Appends final tracking event and creates customer notification.
  - `GET /api/customer/shipments/{id}/pod`:
    - Allows customer, support, or admin to view receiver name, delivery time, and photo URL.

---

### Phase 7: Customer Support System
* **Database**:
  - `support_tickets` table: `id UUID`, `customer_id UUID`, `shipment_id UUID`, `subject VARCHAR`, `description TEXT`, `status VARCHAR`, `created_at TIMESTAMP`, `updated_at TIMESTAMP`.
* **APIs**:
  - `POST /api/customer/tickets`:
    - Customer raises ticket regarding a shipment.
  - `GET /api/support/tickets`:
    - Support Agent / Admin views all tickets with status filter (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`).
  - `GET /api/support/tickets/{id}`:
    - Support agent views ticket, customer details, and shipment timeline.
  - `PUT /api/support/tickets/{id}`:
    - Support agent updates ticket status and resolution notes. (Support agents cannot alter shipment operational status).

---

### Phase 8: Admin Dashboard, Notifications, Documentation & Verification
* **Admin Dashboard & Reports**:
  - `GET /api/admin/dashboard/stats`: KPI totals (total shipments, pending dispatch, in transit, delivered, open complaints, active drivers).
  - `GET /api/admin/reports`: Summary shipment reports.
* **Notification APIs**:
  - `GET /api/notifications/my-alerts`: Fetches in-app alerts for authenticated user.
  - `PUT /api/notifications/{id}/read`: Marks alert as read.
* **Comprehensive Documentation in `docs/backend/`**:
  - `setup-guide.md`
  - `api-documentation.md`
  - `database-model.md`
  - `authentication.md`
  - `development-guide.md`

---

## 4. Testing & Verification Plan

### Automated Testing
- `mvn test` execution for every phase verifying:
  - Phase 1: Registration, BCrypt password hashing, JWT generation/validation, role assignments.
  - Phase 2: Customer shipment creation, sequence tracking number generation, customer data isolation.
  - Phase 3: Pending shipments filtering, driver assignment, state change to `ASSIGNED`.
  - Phase 4: Driver delivery isolation, sequential status transition validation, rejection of illegal jumps or `DELIVERED` via status API.
  - Phase 5: Public tracking timeline retrieval and employee privacy enforcement.
  - Phase 6: Multipart POD file upload, disk storage, `photo_url` persistence, transition to `DELIVERED`.
  - Phase 7: Customer complaint creation, support agent ticket updates, restriction from modifying shipment status.
  - Phase 8: Dashboard KPI calculations and in-app notification queries.

---

## 5. Git Commit & Phase-Gate Protocol

For each phase:
1. Complete code and tests for the phase.
2. Run `mvn test` to verify zero regressions and all tests passing.
3. List all changed/created files with concise explanations.
4. Prepare human-written commit message matching the format:
   ```
   type(module): short description

   - What changed
   - Why changed
   - Problem solved
   ```
5. **STOP and request user approval before committing and proceeding to the next phase.**
