# ShipTrack Pro - Authentication & Security Architecture

## 1. Authentication Flow
- **Registration**: `POST /api/auth/register` creates user accounts with default role `CUSTOMER` and hashes passwords with BCrypt (10 rounds).
- **Login**: `POST /api/auth/login` verifies credentials and issues a signed HMAC-SHA256 JWT access token (15-minute validity) alongside a refresh token (7-day validity).
- **Session Management**: `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.

---

## 2. JWT Architecture
- **Header**: Standard `Authorization: Bearer <jwt-token>` header format.
- **Claims**: Contains `sub` (user email), `userId`, and `roles`.
- **Filter**: `JwtFilter` runs on every request prior to `UsernamePasswordAuthenticationFilter`, populating Spring Security's `SecurityContextHolder`.

---

## 3. Role-Based Access Control (RBAC)
- Enabled via `@EnableMethodSecurity` and `@PreAuthorize("hasRole('...')")`.
- Roles:
  - `CUSTOMER`: Create and view own shipments, raise support tickets, view own notifications.
  - `DRIVER`: View assigned deliveries, sequentially progress status up to `OUT_FOR_DELIVERY`, upload POD.
  - `SUPPORT_AGENT`: View and update support tickets, view shipment history and PODs.
  - `ADMINISTRATOR`: Assign shipments to drivers, view system dashboard KPIs, generate summary reports, manage system resources.
