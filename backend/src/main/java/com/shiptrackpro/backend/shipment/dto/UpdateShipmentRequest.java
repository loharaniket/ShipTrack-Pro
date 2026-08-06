package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import lombok.Data;

@Data
public class UpdateShipmentRequest {
    private String receiverName;
    private String receiverPhone;
    private AddressDto receiverAddress;
    private ShipmentPriority priority;
}
