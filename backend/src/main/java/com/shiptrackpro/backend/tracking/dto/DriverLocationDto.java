package com.shiptrackpro.backend.tracking.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingConnectionStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationDto {

    private UUID id;
    private UUID shipmentId;
    private String trackingNumber;
    private UUID driverId;
    private String driverName;
    private String driverPhone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal accuracy;
    private TrackingConnectionStatus connectionStatus;
    private TrackingStatus status;
    private ShipmentStatus shipmentStatus;
    private ZonedDateTime startedAt;
    private ZonedDateTime endedAt;
    private String endedReason;
    private ZonedDateTime lastPingAt;
    private ZonedDateTime updatedAt;
}
