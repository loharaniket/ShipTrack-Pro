package com.shiptrackpro.backend.tracking.dto;

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
public class ActiveDriverTrackingDto {

    private UUID trackingId;
    private UUID driverId;
    private String driverName;
    private String driverEmail;
    private String driverPhone;
    private UUID shipmentId;
    private String trackingNumber;
    private String receiverName;
    private String deliveryAddress;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal accuracy;
    private TrackingConnectionStatus connectionStatus;
    private TrackingStatus status;
    private ZonedDateTime startedAt;
    private ZonedDateTime lastPingAt;
}
