# ShipTrack Pro - Frontend Integration Checklist & API Reference

This checklist provides full technical details, JSON payloads, and frontend integration examples for every endpoint in the ShipTrack Pro B2C MVP backend.

---

## 1. Authentication Endpoints

### 1.1 Customer Registration
* **Method & Path**: `POST /api/auth/register`
* **Authentication**: None (Public)
* **Request JSON**:
  ```json
  {
    "firstName": "Rahul",
    "lastName": "Patil",
    "email": "rahul.patil@example.com",
    "phone": "9876543210",
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "success": true,
      "message": "Registration successful"
    }
  }
  ```
* **Frontend Usage Example**:
  ```typescript
  const registerUser = async (formData: RegisterForm) => {
    const res = await api.post('/api/auth/register', formData);
    return res.data;
  };
  ```

---

### 1.2 User Login
* **Method & Path**: `POST /api/auth/login`
* **Authentication**: None (Public)
* **Request JSON**:
  ```json
  {
    "email": "rahul.patil@example.com",
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "7f000001-98a4-1a3b-8198-a4773c880000",
      "tokenType": "Bearer",
      "expiresIn": 900,
      "user": {
        "id": "7f000001-98a4-1a3b-8198-a4773c880000",
        "name": "Rahul Patil",
        "firstName": "Rahul",
        "lastName": "Patil",
        "email": "rahul.patil@example.com",
        "role": "CUSTOMER",
        "roles": ["CUSTOMER"]
      }
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password",
    "status": 401,
    "error": "UNAUTHORIZED"
  }
  ```

---

## 2. Customer Shipment Management

### 2.1 Book Shipment
* **Method & Path**: `POST /api/customer/shipments`
* **Authentication**: Bearer JWT (`ROLE_CUSTOMER`)
* **Request JSON**:
  ```json
  {
    "senderName": "Rahul Patil",
    "senderPhone": "9876543210",
    "receiverName": "Amit Sharma",
    "receiverPhone": "9876543211",
    "pickupAddress": "Aundh, Pune",
    "deliveryAddress": "Bandra, Mumbai",
    "packageDescription": "Electronics",
    "weight": 1.5
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Shipment created",
    "data": {
      "id": "UUID",
      "message": "Shipment created",
      "trackingNumber": "STP10001",
      "status": "CREATED"
    }
  }
  ```

---

### 2.2 Get My Shipments
* **Method & Path**: `GET /api/customer/shipments`
* **Authentication**: Bearer JWT (`ROLE_CUSTOMER`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Shipments fetched successfully",
    "data": [
      {
        "id": "UUID",
        "trackingNumber": "STP10001",
        "senderName": "Rahul Patil",
        "receiverName": "Amit Sharma",
        "pickupAddress": "Aundh, Pune",
        "deliveryAddress": "Bandra, Mumbai",
        "status": "CREATED",
        "weight": 1.5,
        "createdAt": "2026-08-17T10:00:00Z"
      }
    ]
  }
  ```

---

### 2.3 Get Proof of Delivery (POD)
* **Method & Path**: `GET /api/customer/shipments/{id}/pod`
* **Authentication**: Bearer JWT (`ROLE_CUSTOMER`, `ROLE_ADMINISTRATOR`, `ROLE_SUPPORT_AGENT`, `ROLE_DRIVER`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Proof of Delivery fetched successfully",
    "data": {
      "id": "UUID",
      "shipmentId": "UUID",
      "trackingNumber": "STP10001",
      "receiverName": "Amit Sharma",
      "photoUrl": "/uploads/pod/abc-123.jpg",
      "deliveryTime": "2026-08-17T14:30:00Z"
    }
  }
  ```

---

## 3. Public Tracking

### 3.1 Public Shipment Tracking
* **Method & Path**: `GET /api/tracking/{trackingNumber}`
* **Authentication**: None (Public)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Tracking timeline fetched successfully",
    "data": {
      "trackingNumber": "STP10001",
      "currentStatus": "IN_TRANSIT",
      "timeline": [
        {
          "status": "CREATED",
          "description": "Shipment created",
          "createdAt": "2026-08-17T10:00:00Z"
        },
        {
          "status": "ASSIGNED",
          "description": "Driver assigned for delivery: Rahul",
          "createdAt": "2026-08-17T10:30:00Z"
        },
        {
          "status": "IN_TRANSIT",
          "description": "In transit to Mumbai",
          "createdAt": "2026-08-17T12:00:00Z"
        }
      ]
    }
  }
  ```

---

## 4. Driver Operations

### 4.1 Get Assigned Deliveries
* **Method & Path**: `GET /api/operator/deliveries`
* **Authentication**: Bearer JWT (`ROLE_DRIVER`, `ROLE_ADMINISTRATOR`)

---

### 4.2 Progress Shipment Status
* **Method & Path**: `PUT /api/operator/shipments/{id}/status`
* **Authentication**: Bearer JWT (`ROLE_DRIVER` assigned only, `ROLE_ADMINISTRATOR`)
* **Allowed Statuses**: `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`
* **Request JSON**:
  ```json
  {
    "status": "IN_TRANSIT",
    "description": "Package reached Mumbai hub",
    "location": "Mumbai"
  }
  ```

---

### 4.3 Upload Proof of Delivery (Complete Delivery)
* **Method & Path**: `POST /api/operator/pod`
* **Content-Type**: `multipart/form-data`
* **Authentication**: Bearer JWT (`ROLE_DRIVER` assigned only, `ROLE_ADMINISTRATOR`)
* **Form Fields**:
  - `shipmentId`: UUID
  - `receiverName`: string
  - `photo`: file binary (.jpg, .jpeg, .png, .webp, max 5MB)
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Proof of Delivery uploaded and shipment delivered successfully",
    "data": {
      "id": "UUID",
      "shipmentId": "UUID",
      "trackingNumber": "STP10001",
      "receiverName": "Amit Sharma",
      "photoUrl": "/uploads/pod/e174b...png",
      "deliveryTime": "2026-08-17T15:00:00Z"
    }
  }
  ```

---

## 5. Support Complaints

### 5.1 Raise Complaint
* **Method & Path**: `POST /api/customer/tickets`
* **Authentication**: Bearer JWT (`ROLE_CUSTOMER`)
* **Request JSON**:
  ```json
  {
    "shipmentId": "UUID (optional)",
    "subject": "Delivery Delay",
    "description": "Package not received by estimated time."
  }
  ```

### 5.2 View & Update Tickets
* `GET /api/support/tickets?status=OPEN` (`ROLE_SUPPORT_AGENT`, `ROLE_ADMINISTRATOR`)
* `GET /api/support/tickets/{id}` (`ROLE_SUPPORT_AGENT`, `ROLE_ADMINISTRATOR`, `ROLE_CUSTOMER` owner)
* `PUT /api/support/tickets/{id}` (`ROLE_SUPPORT_AGENT`, `ROLE_ADMINISTRATOR`) with `{ "status": "RESOLVED" }`

---

## 6. Admin Dashboard & Dispatches

* `GET /api/admin/dashboard/stats` (`ROLE_ADMINISTRATOR`)
* `GET /api/admin/reports` (`ROLE_ADMINISTRATOR`)
* `GET /api/admin/shipments/pending` (`ROLE_ADMINISTRATOR`)
* `POST /api/admin/assignments` (`ROLE_ADMINISTRATOR`) with `{ "shipmentId": "UUID", "driverId": "UUID" }`
* `GET /api/admin/drivers` (`ROLE_ADMINISTRATOR`)
* `GET /api/admin/users` (`ROLE_ADMINISTRATOR`)

---

## 7. In-App Notifications

* `GET /api/notifications/my-alerts` (Authenticated user)
* `PUT /api/notifications/{id}/read` (Authenticated owner)

---

## Security & Verification Summary

- [x] Customer data isolation verified (attempt to read unowned shipment or ticket returns `403 Forbidden`).
- [x] Driver authorization verified (unassigned driver cannot update status or upload POD).
- [x] State transition invariants verified (direct jump to `DELIVERED` rejected with `400 Bad Request`).
- [x] Safe POD file validation verified (only image formats allowed; non-image/dangerous files rejected).
- [x] Automated notifications triggered on all critical shipment & ticket lifecycle transitions.
- [x] CORS configured with explicit localhost origins (`3000`, `5173`, `4173`).
- [x] End-to-end integration test (`ShipTrackE2ETest`) passes 100%.
