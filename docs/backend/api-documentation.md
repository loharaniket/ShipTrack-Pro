# ShipTrack Pro - Complete B2C API Documentation

Base URL: `http://localhost:8080` (Endpoints support both `/api/...` and `/api/v1/...` routes).

---

## 1. Authentication APIs

### Register Customer
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "firstName": "Rahul",
    "lastName": "Patil",
    "email": "rahul.patil@example.com",
    "phone": "9876543210",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
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

### Login
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
  ```json
  {
    "email": "rahul.patil@example.com",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "7f000001-98a4-1a3b-8198-a4773c880000",
        "name": "Rahul Patil",
        "email": "rahul.patil@example.com",
        "role": "CUSTOMER"
      }
    }
  }
  ```

---

## 2. Customer Shipment Management

### Create Shipment
* **Endpoint**: `POST /api/customer/shipments`
* **Access**: Role `CUSTOMER`
* **Request Body**:
  ```json
  {
    "senderName": "Rahul Patil",
    "senderPhone": "9876543210",
    "receiverName": "Amit Sharma",
    "receiverPhone": "9876543211",
    "pickupAddress": "Flat 101, Model Colony, Pune",
    "deliveryAddress": "Tower B, BKC, Mumbai",
    "packageDescription": "Electronics - Smartphone",
    "weight": 0.85
  }
  ```
* **Response (201 Created)**:
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

### Get Customer Shipments
* **Endpoint**: `GET /api/customer/shipments`
* **Access**: Role `CUSTOMER`
* **Response (200 OK)**: Returns list of user's shipments ordered by date descending.

### Get Shipment by ID
* **Endpoint**: `GET /api/customer/shipments/{id}`
* **Access**: Role `CUSTOMER` (owner only), `ADMINISTRATOR`, or `SUPPORT_AGENT`.

---

## 3. Admin Operations

### Get Users
* **Endpoint**: `GET /api/admin/users` (also `/api/users`, `/api/v1/admin/users`)
* **Access**: Role `ADMINISTRATOR`
* **Query Parameters**: `search`, `status`, `role`, `page`, `size`
* **Response (200 OK)**: Paginated user response.

### Get Pending Unassigned Shipments
* **Endpoint**: `GET /api/admin/shipments/pending`
* **Access**: Role `ADMINISTRATOR`
* **Response (200 OK)**: Returns shipments with status `CREATED`.

### Assign Driver
* **Endpoint**: `POST /api/admin/assignments`
* **Access**: Role `ADMINISTRATOR`
* **Request Body**:
  ```json
  {
    "shipmentId": "UUID",
    "driverId": "UUID"
  }
  ```
* **Response (201 Created)**: Status changes `CREATED` -> `ASSIGNED`.

### Get Drivers
* **Endpoint**: `GET /api/admin/drivers`
* **Access**: Role `ADMINISTRATOR`
* **Response (200 OK)**: Returns active delivery drivers.

### Get Dashboard Statistics
* **Endpoint**: `GET /api/admin/dashboard/stats`
* **Access**: Role `ADMINISTRATOR`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalShipments": 120,
      "pendingDispatch": 15,
      "inTransit": 45,
      "delivered": 60,
      "openComplaints": 4,
      "activeDrivers": 12
    }
  }
  ```

### Get Admin Reports
* **Endpoint**: `GET /api/admin/reports`
* **Access**: Role `ADMINISTRATOR`
* **Response (200 OK)**: Returns status breakdown and overall platform metrics.

---

## 4. Driver / Operator Workflow

### Get Assigned Deliveries
* **Endpoint**: `GET /api/operator/deliveries`
* **Access**: Role `DRIVER`, `ADMINISTRATOR`

### Update Shipment Status
* **Endpoint**: `PUT /api/operator/shipments/{id}/status`
* **Access**: Role `DRIVER` (assigned only), `ADMINISTRATOR`
* **Allowed Statuses**: `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`
* **Request Body**:
  ```json
  {
    "status": "IN_TRANSIT",
    "description": "Package reached Pune hub",
    "location": "Pune"
  }
  ```

### Upload Proof of Delivery (Complete Delivery)
* **Endpoint**: `POST /api/operator/pod` (multipart/form-data)
* **Access**: Role `DRIVER` (assigned only), `ADMINISTRATOR`
* **Form Fields**:
  - `shipmentId`: UUID
  - `receiverName`: String
  - `photo`: File binary
* **Response (201 Created)**: Status transitions to `DELIVERED`.

---

## 5. Public Tracking

### Public Tracking Inquiries
* **Endpoint**: `GET /api/tracking/{trackingNumber}`
* **Access**: Public
* **Response (200 OK)**:
  ```json
  {
    "success": true,
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
          "createdAt": "2026-08-17T11:00:00Z"
        },
        {
          "status": "IN_TRANSIT",
          "description": "Package reached Pune hub",
          "createdAt": "2026-08-17T14:30:00Z"
        }
      ]
    }
  }
  ```

---

## 6. Customer Support & Complaints

### Raise Support Ticket
* **Endpoint**: `POST /api/customer/tickets`
* **Access**: Role `CUSTOMER`
* **Request Body**:
  ```json
  {
    "shipmentId": "UUID (optional)",
    "subject": "Delayed Delivery",
    "description": "Package has not arrived on time."
  }
  ```

### Manage Tickets (Support Agents & Admin)
* **Endpoint**: `GET /api/support/tickets?status=OPEN`
* **Endpoint**: `GET /api/support/tickets/{id}`
* **Endpoint**: `PUT /api/support/tickets/{id}` (`{ "status": "RESOLVED" }`)

---

## 7. Notifications

### Get User Alerts
* **Endpoint**: `GET /api/notifications/my-alerts`
* **Access**: Authenticated User

### Mark Alert as Read
* **Endpoint**: `PUT /api/notifications/{id}/read`
* **Access**: Authenticated User (Owner only)

---

## 8. Global Error Responses

All failed API requests return a consistent JSON response:

```json
{
  "success": false,
  "message": "Shipment must be in OUT_FOR_DELIVERY status to complete delivery.",
  "timestamp": "2026-08-17T10:30:00Z",
  "status": 400,
  "error": "BAD_REQUEST",
  "path": "/api/operator/pod"
}
```

### Common HTTP Status Codes:
- `400 Bad Request`: Validation failure or invalid lifecycle state transition.
- `401 Unauthorized`: Missing or invalid JWT authentication token.
- `403 Forbidden`: Insufficient role permissions or accessing unowned resources.
- `404 Not Found`: Resource (shipment, ticket, user, notification) does not exist.
- `409 Conflict`: Resource unique conflict (e.g. duplicate email registration).
- `500 Internal Server Error`: Unhandled server exceptions.
