-- V2__create_driver_locations_table.sql
-- Table for Real-time Driver Location Tracking connected with Shipments

CREATE TABLE IF NOT EXISTS driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    accuracy DECIMAL(10, 2),
    connection_status VARCHAR(30) DEFAULT 'CONNECTED',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    ended_reason VARCHAR(100),
    last_ping_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_shipment ON driver_locations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_status ON driver_locations(status);

-- Partial Unique Index ensuring a driver can only have ONE ACTIVE tracking session at any time
CREATE UNIQUE INDEX IF NOT EXISTS idx_driver_locations_active_driver 
ON driver_locations(driver_id) 
WHERE status = 'ACTIVE';
