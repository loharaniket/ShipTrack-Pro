package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStatus;
import lombok.Data;

@Data
public class UpdateRouteStatusRequest {
    private RouteStatus status;
}
