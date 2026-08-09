package com.shiptrackpro.backend.delivery.dto;

import com.shiptrackpro.backend.delivery.entity.VehicleStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class VehicleDto {
    private UUID id;
    private String vehicleNumber;
    private String vehicleType;
    private Double capacityKg;
    private VehicleStatus status;
}
