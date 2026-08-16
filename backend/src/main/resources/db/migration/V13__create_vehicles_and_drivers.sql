-- V13__create_vehicles_and_drivers.sql

CREATE TABLE vehicles (
    id UUID PRIMARY KEY NOT NULL,
    organization_id UUID NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'Van',
    capacity_kg DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_vehicle_organization FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_vehicles_organization_id ON vehicles(organization_id);

CREATE TABLE drivers (
    id UUID PRIMARY KEY NOT NULL,
    user_id UUID NOT NULL UNIQUE,
    organization_id UUID NOT NULL,
    vehicle_id UUID,
    license_number VARCHAR(50),
    experience_years INTEGER DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_driver_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_driver_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE INDEX idx_drivers_organization_id ON drivers(organization_id);
CREATE INDEX idx_drivers_user_id ON drivers(user_id);
CREATE INDEX idx_drivers_vehicle_id ON drivers(vehicle_id);
