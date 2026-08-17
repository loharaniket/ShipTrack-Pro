package com.shiptrackpro.backend.admin.dto;

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
public class AssignDriverRequest {

    @NotNull(message = "shipmentId is required")
    private UUID shipmentId;

    @NotNull(message = "driverId is required")
    private UUID driverId;
}
