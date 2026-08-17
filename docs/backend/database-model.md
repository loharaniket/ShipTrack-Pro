# ShipTrack Pro - Database Model & Schema Documentation

The PostgreSQL database schema consists of normalized tables powering the B2C logistics lifecycle:

---

## Entity Relationship Summary

```
 users (id UUID) ──< user_roles >── roles (id UUID)
   │
   ├──< refresh_tokens (user_id)
   │
   ├──< shipments (customer_id) ──< delivery_assignments (shipment_id, driver_id)
   │         │
   │         ├──< shipment_tracking (shipment_id)
   │         │
   │         └──── proof_of_delivery (shipment_id)
   │
   ├──< support_tickets (customer_id, shipment_id)
   │
   └──< notifications (user_id)
```

---

## 1. Core Tables

### `users`
- `id`: UUID (PK)
- `email`: VARCHAR(255) (Unique, Indexed)
- `password_hash`: VARCHAR(255)
- `first_name`: VARCHAR(100)
- `last_name`: VARCHAR(100)
- `phone`: VARCHAR(30)
- `status`: VARCHAR(30) ('ACTIVE', 'INACTIVE')
- `created_at`: TIMESTAMP WITH TIME ZONE
- `updated_at`: TIMESTAMP WITH TIME ZONE

### `roles` & `user_roles`
- Seeded roles: `ADMINISTRATOR`, `CUSTOMER`, `DRIVER`, `SUPPORT_AGENT`.

### `shipments`
- `id`: UUID (PK)
- `tracking_number`: VARCHAR(30) (Unique, e.g., 'STP10001', generated from `shipment_seq`)
- `customer_id`: UUID (FK -> users)
- `sender_name`, `sender_phone`: VARCHAR
- `receiver_name`, `receiver_phone`: VARCHAR
- `pickup_address`, `delivery_address`: VARCHAR
- `package_description`: VARCHAR
- `weight`: DOUBLE PRECISION
- `status`: VARCHAR ('CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED')
- `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

### `delivery_assignments`
- `id`: UUID (PK)
- `shipment_id`: UUID (FK -> shipments)
- `driver_id`: UUID (FK -> users)
- `assigned_date`: TIMESTAMP WITH TIME ZONE
- `status`: VARCHAR ('ASSIGNED')

### `shipment_tracking`
- `id`: UUID (PK)
- `shipment_id`: UUID (FK -> shipments)
- `status`: VARCHAR
- `description`: VARCHAR
- `updated_by`: VARCHAR (Internal updater name)
- `created_at`: TIMESTAMP WITH TIME ZONE

### `proof_of_delivery`
- `id`: UUID (PK)
- `shipment_id`: UUID (FK -> shipments, Unique)
- `receiver_name`: VARCHAR
- `photo_url`: VARCHAR (Local file path, e.g., '/uploads/pod/...')
- `delivery_time`: TIMESTAMP WITH TIME ZONE

### `support_tickets`
- `id`: UUID (PK)
- `customer_id`: UUID (FK -> users)
- `shipment_id`: UUID (FK -> shipments, Nullable)
- `subject`: VARCHAR
- `description`: TEXT
- `status`: VARCHAR ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')
- `created_at`, `updated_at`: TIMESTAMP WITH TIME ZONE

### `notifications`
- `id`: UUID (PK)
- `user_id`: UUID (FK -> users)
- `title`: VARCHAR
- `message`: TEXT
- `type`: VARCHAR
- `is_read`: BOOLEAN
- `created_at`: TIMESTAMP WITH TIME ZONE
