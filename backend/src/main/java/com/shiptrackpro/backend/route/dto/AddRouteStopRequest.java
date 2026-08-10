package com.shiptrackpro.backend.route.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AddRouteStopRequest {
    private UUID shipmentId;
    private Integer stopOrder;
}
