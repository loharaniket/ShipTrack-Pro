package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.Data;

@Data
public class UpdateShipmentStatusRequest {
    private ShipmentStatus newStatus;
    private String location;
    private String note;
}
