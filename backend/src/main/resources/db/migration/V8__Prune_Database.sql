-- 1. Prune Companies
ALTER TABLE companies DROP COLUMN IF EXISTS phone;
ALTER TABLE companies DROP COLUMN IF EXISTS website;

-- 2. Prune Users
ALTER TABLE users DROP COLUMN IF EXISTS last_login;

-- 3. Prune Shipments
ALTER TABLE shipments DROP COLUMN IF EXISTS sender_name;
ALTER TABLE shipments DROP COLUMN IF EXISTS sender_phone;
ALTER TABLE shipments DROP COLUMN IF EXISTS sender_address_id;
ALTER TABLE shipments DROP COLUMN IF EXISTS receiver_name;
ALTER TABLE shipments DROP COLUMN IF EXISTS receiver_phone;
ALTER TABLE shipments DROP COLUMN IF EXISTS receiver_address_id;

-- Add new minimal fields to Shipments
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin VARCHAR(255) NOT NULL DEFAULT 'Unknown';
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination VARCHAR(255) NOT NULL DEFAULT 'Unknown';

-- Drop unused addresses table? We might still need it if something else uses it, but right now Shipment doesn't.
-- Actually, let's just keep it just in case, or drop it since we stripped the relations.
-- Not dropping addresses table for safety, but we've removed references.
