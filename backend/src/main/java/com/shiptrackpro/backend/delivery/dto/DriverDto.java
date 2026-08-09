package com.shiptrackpro.backend.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class DriverDto {
    private UUID id;
    private String driverName;
    private String licenseNumber;
    private Integer experienceYears;
}
