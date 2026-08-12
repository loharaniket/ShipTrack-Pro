package com.shiptrackpro.backend.intelligence.dto;

import lombok.Data;

@Data
public class EtaKpiDto {
    private double onTimeDeliveryRate; // e.g., 95.5
    private int totalDelayedShipments;
    private double averageDelayMinutes;
}
