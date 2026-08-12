package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ShipmentDto {
    private UUID id;
    private String trackingNumber;
    private UUID companyId;

    private String origin;
    private String destination;

    private ShipmentStatus status;
    private ShipmentPriority priority;
    
    private ZonedDateTime estimatedDeliveryTime;
    private ZonedDateTime actualDeliveryDate;
    private ZonedDateTime createdAt;

    private List<PackageDto> packages;
}
