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
public class CreateShipmentResponse {
    private UUID id;
    private String message;
    private String trackingNumber;
    private String status;
}
