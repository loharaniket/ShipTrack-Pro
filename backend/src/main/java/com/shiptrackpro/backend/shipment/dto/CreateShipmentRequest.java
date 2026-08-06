package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import lombok.Data;
import java.util.List;

@Data
public class CreateShipmentRequest {
    private String senderName;
    private String senderPhone;
    private AddressDto senderAddress;

    private String receiverName;
    private String receiverPhone;
    private AddressDto receiverAddress;

    private List<PackageDto> packages;
    private ShipmentPriority priority;
}
