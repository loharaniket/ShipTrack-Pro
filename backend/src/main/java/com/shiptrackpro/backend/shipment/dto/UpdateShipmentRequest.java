package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import lombok.Data;
import java.time.ZonedDateTime;

@Data
public class UpdateShipmentRequest {
    private ShipmentPriority priority;
    private String deliveryInstructions;
    private ZonedDateTime scheduledPickup;
    private ZonedDateTime scheduledDelivery;
}
