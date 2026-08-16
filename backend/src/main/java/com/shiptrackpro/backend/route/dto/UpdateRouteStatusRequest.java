package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRouteStatusRequest {
    @NotNull(message = "Route status is required")
    private RouteStatus status;
}
