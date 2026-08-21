-- V3__create_addresses_table_and_migrate_shipments.sql
-- 1. Create normalized addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 7) NOT NULL DEFAULT 40.712776,
    longitude DECIMAL(10, 7) NOT NULL DEFAULT -74.005974,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create spatial & lookup indexes
CREATE INDEX IF NOT EXISTS idx_addresses_coords ON addresses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_addresses_postal ON addresses(postal_code);
CREATE INDEX IF NOT EXISTS idx_addresses_city_state ON addresses(city, state);

-- 3. Add Foreign Keys to shipments table
ALTER TABLE shipments 
    ADD COLUMN IF NOT EXISTS origin_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS destination_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_shipments_origin ON shipments(origin_address_id);
CREATE INDEX IF NOT EXISTS idx_shipments_destination ON shipments(destination_address_id);

-- 4. Backfill existing legacy data so referential integrity is 100% intact
DO $$
DECLARE
    rec RECORD;
    orig_id UUID;
    dest_id UUID;
BEGIN
    FOR rec IN SELECT id, pickup_address, delivery_address FROM shipments WHERE origin_address_id IS NULL LOOP
        -- Insert origin address
        INSERT INTO addresses (id, line1, city, state, country, postal_code, latitude, longitude)
        VALUES (gen_random_uuid(), COALESCE(rec.pickup_address, 'Origin Location'), 'New York', 'NY', 'USA', '10001', 40.712776, -74.005974)
        RETURNING id INTO orig_id;
        
        -- Insert destination address
        INSERT INTO addresses (id, line1, city, state, country, postal_code, latitude, longitude)
        VALUES (gen_random_uuid(), COALESCE(rec.delivery_address, 'Delivery Location'), 'New York', 'NY', 'USA', '10002', 40.758896, -73.985130)
        RETURNING id INTO dest_id;
        
        -- Link back to shipment
        UPDATE shipments 
        SET origin_address_id = orig_id, destination_address_id = dest_id 
        WHERE id = rec.id;
    END LOOP;
END $$;
