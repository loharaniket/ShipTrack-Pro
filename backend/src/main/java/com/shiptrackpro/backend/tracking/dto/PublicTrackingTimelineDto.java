package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicTrackingTimelineDto {
    private ShipmentStatus status;
    private String description;
    private ZonedDateTime createdAt;
}
