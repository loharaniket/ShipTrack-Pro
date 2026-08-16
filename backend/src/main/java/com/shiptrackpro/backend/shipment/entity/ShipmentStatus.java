package com.shiptrackpro.backend.shipment.entity;

public enum ShipmentStatus {
    DRAFT,
    READY_FOR_PLANNING,
    READY_FOR_DISPATCH,
    IN_TRANSIT,
    OUT_FOR_DELIVERY,
    DELIVERED,
    RETURNED,
    CANCELLED
}
