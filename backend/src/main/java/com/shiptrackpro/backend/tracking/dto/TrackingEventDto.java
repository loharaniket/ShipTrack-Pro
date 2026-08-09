package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingEventType;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class TrackingEventDto {
    private UUID id;
    private ShipmentStatus status;
    private TrackingEventType eventType;
    private String description;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private String createdByName;
    private ZonedDateTime createdAt;
}
