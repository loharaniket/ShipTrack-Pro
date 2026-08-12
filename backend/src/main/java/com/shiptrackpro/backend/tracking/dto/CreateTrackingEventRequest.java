package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingEventType;
import lombok.Data;

@Data
public class CreateTrackingEventRequest {
    private String trackingNumber;
    private ShipmentStatus status;
    private TrackingEventType eventType;
    private String description;
    private Double latitude;
    private Double longitude;
    private String locationName;
}
