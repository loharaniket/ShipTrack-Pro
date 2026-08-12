package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import lombok.Data;

@Data
public class UpdateShipmentRequest {
    private String destination;
    private ShipmentPriority priority;
}
