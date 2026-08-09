package com.shiptrackpro.backend.delivery.dto;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private Double latitude;
    private Double longitude;
}
