package com.shiptrackpro.backend.address.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeocodeResultDto {

    private String displayName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String line1;
    private String city;
    private String state;
    private String country;
    private String postalCode;
}
