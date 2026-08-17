# ShipTrack Pro - Frontend Integration Architecture & Guide

This document serves as the comprehensive integration contract for React / Vue / Next.js frontend clients connecting to the ShipTrack Pro B2C MVP Backend.

---

## 1. Authentication & Token Management

### Login & Token Handshake
1. The frontend initiates `POST /api/auth/login` with email and password.
2. The server responds with:
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
3. **Storage**:
   - Save `accessToken` in local memory or secure storage.
   - Save `refreshToken` for automatic token renewal (`POST /api/auth/refresh`).
   - For all authenticated HTTP requests, attach the authorization header:
     ```http
     Authorization: Bearer <accessToken>
     ```

---

## 2. Role-Based Navigation Matrix

Frontend routing guards should direct users based on `user.role` received in the login response:

| Role | Primary Dashboard Route | Permitted Views & Capabilities |
| :--- | :--- | :--- |
| **`CUSTOMER`** | `/customer/dashboard` | Book shipments, view own shipments, view PODs, raise complaints, view alerts |
| **`DRIVER`** | `/operator/dashboard` | View assigned deliveries, update shipment status, upload POD photo/signature |
| **`SUPPORT_AGENT`**| `/support/dashboard` | View and manage all support tickets, filter by status, check shipment timelines |
| **`ADMINISTRATOR`** | `/admin/dashboard` | Monitor platform KPIs, dispatch & assign shipments, manage users & drivers |

---

## 3. Standard API Response Structure

All successful responses conform to the standard `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

---

## 4. Standard Error Response Structure

All failed requests return the structured `ErrorResponse` envelope:
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

### Frontend Error Interceptor Handling:
- `400 BAD_REQUEST`: Render `error.response.data.message` in toast/form alert.
- `401 UNAUTHORIZED`: Clear token, attempt refresh via `/api/auth/refresh`, or redirect to `/login`.
- `403 FORBIDDEN`: Display "Access Denied" view or toast notification.
- `404 NOT_FOUND`: Render 404 resource view or display "Item not found".
- `500 INTERNAL_SERVER_ERROR`: Display generic server issue notification.

---

## 5. Development CORS & Base URLs
* **Backend Base URL**: `http://localhost:8080`
* **Allowed Frontend Origins**:
  - `http://localhost:3000` (React / Next.js)
  - `http://localhost:5173` (Vite)
  - `http://localhost:4173` (Vite Preview)
