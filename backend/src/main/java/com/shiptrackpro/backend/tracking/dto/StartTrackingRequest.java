package com.shiptrackpro.backend.tracking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartTrackingRequest {

    @NotNull(message = "Shipment ID is required")
    private UUID shipmentId;
}
