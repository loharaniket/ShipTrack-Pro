-- V1__init_b2c_schema.sql
-- Complete ShipTrack Pro B2C MVP Database Schema

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Seed MVP Roles
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'ADMINISTRATOR', 'Administrator') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'CUSTOMER', 'Customer') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'DRIVER', 'Logistics Operator Driver') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'SUPPORT_AGENT', 'Support Agent') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), 'BUSINESS_CLIENT', 'Business Client') ON CONFLICT (name) DO NOTHING;

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. User Roles join table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Refresh Tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- 5. Shipments table
CREATE SEQUENCE IF NOT EXISTS shipment_seq START WITH 10001 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY,
    tracking_number VARCHAR(30) NOT NULL UNIQUE,
    customer_id UUID REFERENCES users(id),
    sender_name VARCHAR(150) NOT NULL,
    sender_phone VARCHAR(30),
    receiver_name VARCHAR(150) NOT NULL,
    receiver_phone VARCHAR(30) NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    package_description VARCHAR(255),
    weight DOUBLE PRECISION,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- 6. Delivery Assignments table
CREATE TABLE IF NOT EXISTS delivery_assignments (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id),
    assigned_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED'
);

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_shipment ON delivery_assignments(shipment_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_driver ON delivery_assignments(driver_id);

-- 7. Shipment Tracking table
CREATE TABLE IF NOT EXISTS shipment_tracking (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment ON shipment_tracking(shipment_id);

-- 8. Proof of Delivery table
CREATE TABLE IF NOT EXISTS proof_of_delivery (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
    receiver_name VARCHAR(150) NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    delivery_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pod_shipment ON proof_of_delivery(shipment_id);

-- 9. Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id),
    shipment_id UUID REFERENCES shipments(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_shipment ON support_tickets(shipment_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- 10. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
