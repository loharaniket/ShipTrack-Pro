package com.shiptrackpro.backend.route.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignDriverRequest {
    @NotBlank(message = "Driver ID is required")
    private String driverId;
}
