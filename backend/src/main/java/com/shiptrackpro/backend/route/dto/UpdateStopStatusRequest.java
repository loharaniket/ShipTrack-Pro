package com.shiptrackpro.backend.route.dto;

import com.shiptrackpro.backend.route.entity.RouteStopStatus;
import lombok.Data;
import java.time.ZonedDateTime;

@Data
public class UpdateStopStatusRequest {
    private RouteStopStatus status;
    private ZonedDateTime actualArrival;
}
