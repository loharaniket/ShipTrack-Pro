package com.shiptrackpro.backend.route.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class CreateRouteRequest {
    private UUID driverId;
    private List<UUID> shipmentIds;
}
