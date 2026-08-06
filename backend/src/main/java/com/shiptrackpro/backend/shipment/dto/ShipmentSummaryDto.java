package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class ShipmentSummaryDto {
    private UUID id;
    private String trackingNumber;
    private String receiverName;
    private String receiverCity;
    private ShipmentStatus status;
    private ShipmentPriority priority;
    private ZonedDateTime createdAt;
}
