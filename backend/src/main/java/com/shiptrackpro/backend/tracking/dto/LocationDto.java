package com.shiptrackpro.backend.tracking.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LocationDto {
    private Double latitude;
    private Double longitude;
    private String locationName;
}
