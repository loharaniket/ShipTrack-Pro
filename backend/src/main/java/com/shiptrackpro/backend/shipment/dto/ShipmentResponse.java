package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentPriority;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ShipmentResponse {
    private UUID id;
    private String trackingNumber;
    private UUID organizationId;
    private String serviceType;
    private ShipmentPriority priority;
    private ShipmentStatus status;
    private String customerName;
    private String recipientName;
    private String recipientPhone;
    private AddressDto originAddress;
    private AddressDto destinationAddress;
    private List<ShipmentPackageDto> packages;
    private List<ShipmentHistoryDto> history;
    private ZonedDateTime scheduledPickup;
    private ZonedDateTime scheduledDelivery;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
