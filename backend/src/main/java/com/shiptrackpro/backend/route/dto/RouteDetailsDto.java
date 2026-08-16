package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteDetailsDto {
    private UUID id;
    private String name;
    private UUID organizationId;
    private String driverId;
    private RouteStatus status;
    private Double totalDistanceKm;
    private Integer totalDurationMinutes;
    private ZonedDateTime plannedStart;
    private ZonedDateTime plannedEnd;
    private ZonedDateTime actualStart;
    private ZonedDateTime actualEnd;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private List<RouteStopDto> stops;
}
