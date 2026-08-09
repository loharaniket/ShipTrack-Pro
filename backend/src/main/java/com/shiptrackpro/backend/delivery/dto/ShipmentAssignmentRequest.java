package com.shiptrackpro.backend.delivery.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ShipmentAssignmentRequest {
    private UUID shipmentId;
    private UUID driverId;
}
