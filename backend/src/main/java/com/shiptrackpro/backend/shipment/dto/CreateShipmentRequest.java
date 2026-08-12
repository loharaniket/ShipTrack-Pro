package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import lombok.Data;
import java.util.List;

@Data
public class CreateShipmentRequest {
    private String origin;
    private String destination;

    private List<PackageDto> packages;
    private ShipmentPriority priority;
}
