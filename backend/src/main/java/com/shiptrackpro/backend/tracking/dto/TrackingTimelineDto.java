package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
public class TrackingTimelineDto {
    private String trackingNumber;
    private ShipmentStatus currentStatus;
    private ZonedDateTime estimatedDelivery;
    private List<TrackingEventDto> events;
}
