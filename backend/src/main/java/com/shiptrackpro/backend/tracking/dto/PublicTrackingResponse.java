package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicTrackingResponse {
    private String trackingNumber;
    private ShipmentStatus currentStatus;
    private List<PublicTrackingTimelineDto> timeline;
}
