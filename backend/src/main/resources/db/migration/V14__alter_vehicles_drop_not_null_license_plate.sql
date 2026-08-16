-- V14__alter_vehicles_drop_not_null_license_plate.sql

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'license_plate'
    ) THEN
        ALTER TABLE vehicles ALTER COLUMN license_plate DROP NOT NULL;
    END IF;
END $$;
