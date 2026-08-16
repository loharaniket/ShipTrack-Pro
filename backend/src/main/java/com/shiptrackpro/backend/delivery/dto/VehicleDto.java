package com.shiptrackpro.backend.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private UUID id;
    private String registrationNumber;
    private String type;
    private Double capacityKg;
    private String status;
}
