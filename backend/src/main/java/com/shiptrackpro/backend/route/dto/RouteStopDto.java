package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStopStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteStopDto {
    private UUID id;
    private UUID routeId;
    private UUID shipmentId;
    private String trackingNumber;
    private String recipientName;
    private String destinationAddressLabel;
    private Integer stopOrder;
    private RouteStopStatus status;
    private ZonedDateTime plannedArrival;
    private ZonedDateTime actualArrival;
    private ZonedDateTime actualDeparture;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
