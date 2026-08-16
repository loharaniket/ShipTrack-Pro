package com.shiptrackpro.backend.route.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class OptimizeRouteRequest {
    @NotEmpty(message = "Optimized stop sequence cannot be empty")
    private List<UUID> optimizedStopSequence;
}
