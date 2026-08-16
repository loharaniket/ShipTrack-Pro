-- V10__create_shipment_history.sql
CREATE TABLE shipment_history (
    id UUID PRIMARY KEY NOT NULL,
    shipment_id UUID NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by UUID,
    change_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    note TEXT,
    CONSTRAINT fk_history_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX idx_shipment_history_shipment_id ON shipment_history(shipment_id);
