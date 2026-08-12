package com.shiptrackpro.backend.delivery.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class DriverLocationDto {
    private UUID driverId;
    private Double lat;
    private Double lng;
    private Double speed;
}
