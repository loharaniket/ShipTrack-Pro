package com.shiptrackpro.backend.delivery.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDto {
    private UUID id;
    private String name;
    private String phone;
    private String email;
    private String status;
    private UUID vehicleId;
    private VehicleDto vehicle;
    private String licenseNumber;
    private Integer experienceYears;
    private ZonedDateTime createdAt;
}
