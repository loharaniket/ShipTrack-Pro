package com.shiptrackpro.backend.shipment.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AddressDto {
    private UUID id;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Double latitude;
    private Double longitude;
    private String contactName;
    private String contactPhone;
    private String deliveryInstructions;
}
