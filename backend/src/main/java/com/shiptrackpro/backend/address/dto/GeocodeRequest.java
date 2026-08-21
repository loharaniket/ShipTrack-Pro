package com.shiptrackpro.backend.address.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeocodeRequest {

    @NotBlank(message = "Address string cannot be blank")
    private String rawAddress;
}
