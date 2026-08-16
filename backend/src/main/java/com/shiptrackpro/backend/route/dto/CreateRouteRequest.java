package com.shiptrackpro.backend.route.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreateRouteRequest {
    @NotBlank(message = "Route name is required")
    private String name;

    @NotEmpty(message = "At least one shipment ID is required")
    private List<UUID> shipmentIds;

    private String driverId;
    private ZonedDateTime plannedStart;
    private ZonedDateTime plannedEnd;
}
