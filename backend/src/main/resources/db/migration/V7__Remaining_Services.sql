-- 7. Route Management Service (Geofences)
CREATE TABLE geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- POLYGON, RADIUS
    coordinates TEXT, -- Storing JSON string for simplicity
    radius_meters DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Proof of Delivery Service (POD)
CREATE TABLE pod_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    package_photo TEXT, -- Base64
    door_photo TEXT, -- Base64
    signature TEXT, -- Base64
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION', -- PENDING_VERIFICATION, VERIFIED, REJECTED
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pod_shipment ON pod_records(shipment_id);

-- 9. Notification Service
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- SMS, EMAIL, PUSH
    status VARCHAR(50) NOT NULL, -- SENT, FAILED
    recipient VARCHAR(255) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Support & Exception Management Service
CREATE TABLE support_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- DELIVERY_DELAY, FAILED_DELIVERY, ADDRESS_ISSUE
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, RESOLVED
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_exceptions_shipment ON support_exceptions(shipment_id);

CREATE TABLE support_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exception_id UUID REFERENCES support_exceptions(id) ON DELETE CASCADE,
    priority VARCHAR(50) DEFAULT 'HIGH', -- HIGH, CRITICAL
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. System Configuration Service
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Initial Settings
INSERT INTO platform_settings (config_key, config_value) VALUES 
('TIMEZONE', 'UTC'),
('SESSION_TIMEOUT_MINUTES', '60');

-- 5. Live Delivery Service (Vehicles)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' -- ACTIVE, MAINTENANCE, INACTIVE
);
