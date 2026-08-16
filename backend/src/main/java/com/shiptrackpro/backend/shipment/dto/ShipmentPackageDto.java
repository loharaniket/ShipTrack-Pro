package com.shiptrackpro.backend.shipment.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ShipmentPackageDto {
    private UUID id;
    private String description;
    private Double weightKg;
    private Double lengthCm;
    private Double widthCm;
    private Double heightCm;
}
