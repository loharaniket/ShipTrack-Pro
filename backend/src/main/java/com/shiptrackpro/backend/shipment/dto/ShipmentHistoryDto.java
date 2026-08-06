package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class ShipmentHistoryDto {
    private UUID id;
    private ShipmentStatus status;
    private String statusRemarks;
    private UUID changedById;
    private String changedByName;
    private ZonedDateTime recordedAt;
}
