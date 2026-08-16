-- V16__update_routes_and_stops_status_check_constraints.sql

ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_status_check;

ALTER TABLE routes ADD CONSTRAINT routes_status_check 
    CHECK (status IN ('DRAFT', 'PLANNED', 'ASSIGNED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

ALTER TABLE route_stops DROP CONSTRAINT IF EXISTS route_stops_status_check;

ALTER TABLE route_stops ADD CONSTRAINT route_stops_status_check 
    CHECK (status IN ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED'));
