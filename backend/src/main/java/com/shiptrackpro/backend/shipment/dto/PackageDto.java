package com.shiptrackpro.backend.shipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PackageDto {
    private UUID id;
    private Double weightKg;
    private String dimensionsCm;
    private String contentDescription;
}
