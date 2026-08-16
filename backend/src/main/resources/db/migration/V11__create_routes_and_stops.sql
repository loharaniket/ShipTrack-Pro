-- V11__create_routes_and_stops.sql

CREATE TABLE routes (
    id UUID PRIMARY KEY NOT NULL,
    organization_id UUID NOT NULL,
    driver_id VARCHAR(100),
    name VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_distance_km DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    total_duration_minutes INTEGER NOT NULL DEFAULT 0,
    planned_start TIMESTAMP WITH TIME ZONE,
    planned_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_route_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_routes_organization_id ON routes(organization_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_driver_id ON routes(driver_id);

CREATE TABLE route_stops (
    id UUID PRIMARY KEY NOT NULL,
    route_id UUID NOT NULL,
    shipment_id UUID NOT NULL,
    stop_order INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    planned_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    actual_departure TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_route_stops_route FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    CONSTRAINT fk_route_stops_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id)
);

CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_shipment_id ON route_stops(shipment_id);
