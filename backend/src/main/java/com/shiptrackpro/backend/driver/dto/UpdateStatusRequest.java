package com.shiptrackpro.backend.driver.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusRequest {

    @NotNull(message = "status is required")
    private ShipmentStatus status;

    private String description;
    private String location;
}
