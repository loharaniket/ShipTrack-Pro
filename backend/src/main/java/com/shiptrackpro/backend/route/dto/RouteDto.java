package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStatus;
import lombok.Builder;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class RouteDto {
    private UUID id;
    private UUID driverId;
    private Double totalDistanceKm;
    private RouteStatus status;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
}
