package com.shiptrackpro.backend.intelligence.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AtRiskShipmentDto {
    private UUID shipmentId;
    private String trackingNumber;
    private String riskLevel; // HIGH, MEDIUM
    private String riskFactor; // e.g. "Weather Delay", "Traffic"
    private int delayedByMinutes;
}
