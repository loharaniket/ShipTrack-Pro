package com.shiptrackpro.backend.shipment.dto;

import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
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
public class CustomerShipmentDto {
    private UUID id;
    private String trackingNumber;
    private UUID customerId;
    private String customerName;
    private String senderName;
    private String senderPhone;
    private String receiverName;
    private String receiverPhone;
    private String pickupAddress;
    private String deliveryAddress;
    private String packageDescription;
    private Double weight;
    private ShipmentStatus status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
