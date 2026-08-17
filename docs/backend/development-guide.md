# ShipTrack Pro - Backend Development Guide

## 1. Package Structure
```
com.shiptrackpro.backend
 ├── admin           # Admin assignments, KPIs, dashboard, and reports
 ├── auth            # Login, Register, JWT, refresh tokens, security filters
 ├── common          # Response wrappers (ApiResponse), exceptions, web configuration
 ├── delivery        # Delivery assignments, assignment repository, core delivery service
 ├── driver          # Driver deliveries and status update endpoints
 ├── notifications   # In-app notifications entity, service, controller
 ├── pod             # Proof of delivery entity, local file storage service, upload controller
 ├── shipment        # Shipment entity, customer shipment endpoints, state transitions
 ├── support         # Support tickets, customer complaint endpoints, agent management
 ├── tracking        # Shipment tracking audit events, public tracking endpoint
 └── user            # User entity, roles, user repositories
```

---

## 2. Core Business Rules & Invariants

1. **State Machine Transitions**:
   `CREATED` -> `ASSIGNED` -> `PICKED_UP` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED`
   - Only `POST /api/operator/pod` transitions status to `DELIVERED`.
   - Backward, skipped, or illegal transitions throw `400 Bad Request`.
2. **Transaction Consistency**:
   - Every status transition is `@Transactional` and updates:
     1. `shipments.status`
     2. `shipment_tracking`
     3. `notifications`
3. **Privacy**:
   - Public tracking (`/api/tracking/**`) never exposes internal updater IDs or employee details.

---

## 3. Running Automated Tests
```bash
mvn clean test
```
All unit and integration tests validate the full 8-phase MVP lifecycle with zero regressions.
