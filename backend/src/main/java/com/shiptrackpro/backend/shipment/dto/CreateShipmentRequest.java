package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateShipmentRequest {
    @NotBlank
    private String customerName;

    @NotBlank
    private String serviceType;

    @NotNull
    private ShipmentPriority priority;

    @NotBlank
    private String recipientName;

    @NotBlank
    private String recipientPhone;

    private AddressDto originAddress;

    @NotNull
    private AddressDto deliveryAddress;

    private List<ShipmentPackageDto> packages;
}
