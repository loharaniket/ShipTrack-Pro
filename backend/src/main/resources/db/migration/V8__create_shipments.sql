-- V8__create_shipments.sql
CREATE SEQUENCE shipment_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE shipments (
    id UUID PRIMARY KEY NOT NULL,
    tracking_number VARCHAR(20) NOT NULL UNIQUE,
    organization_id UUID NOT NULL,
    created_by UUID NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    origin_address_id UUID,
    destination_address_id UUID NOT NULL,
    scheduled_pickup TIMESTAMP WITH TIME ZONE,
    scheduled_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_shipment_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    CONSTRAINT fk_shipment_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_shipment_origin_address FOREIGN KEY (origin_address_id) REFERENCES addresses(id),
    CONSTRAINT fk_shipment_destination_address FOREIGN KEY (destination_address_id) REFERENCES addresses(id)
);

CREATE INDEX idx_shipments_organization_id ON shipments(organization_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_created_at ON shipments(created_at);
CREATE INDEX idx_shipments_scheduled_delivery ON shipments(scheduled_delivery);
