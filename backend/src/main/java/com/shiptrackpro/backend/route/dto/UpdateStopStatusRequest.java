package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStopStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class UpdateStopStatusRequest {
    @NotNull(message = "Stop status is required")
    private RouteStopStatus status;

    private ZonedDateTime actualArrival;
    private ZonedDateTime actualDeparture;
}
