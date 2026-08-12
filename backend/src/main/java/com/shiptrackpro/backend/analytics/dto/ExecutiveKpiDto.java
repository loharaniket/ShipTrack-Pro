package com.shiptrackpro.backend.analytics.dto;

import lombok.Data;

@Data
public class ExecutiveKpiDto {
    private int totalShipments;
    private int activeShipments;
    private double revenue;
    private double onTimeDeliveryRate;
}
