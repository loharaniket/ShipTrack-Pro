package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStopStatus;
import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class RouteStopDto {
    private UUID id;
    private UUID routeId;
    private UUID shipmentId;
    private Integer stopOrder;
    private ZonedDateTime estimatedArrival;
    private ZonedDateTime actualArrival;
    private RouteStopStatus status;
}
