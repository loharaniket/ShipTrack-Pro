-- V9__create_shipment_packages.sql
CREATE TABLE shipment_packages (
    id UUID PRIMARY KEY NOT NULL,
    shipment_id UUID NOT NULL,
    description VARCHAR(255) NOT NULL,
    weight_kg NUMERIC(10,2),
    length_cm NUMERIC(10,2),
    width_cm NUMERIC(10,2),
    height_cm NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_package_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE
);

CREATE INDEX idx_shipment_packages_shipment_id ON shipment_packages(shipment_id);
