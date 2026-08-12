package com.shiptrackpro.backend.intelligence.dto;

import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class EtaPredictionDto {
    private UUID shipmentId;
    private ZonedDateTime originalEta;
    private ZonedDateTime predictedEta;
    private String confidenceLevel; // HIGH, MEDIUM, LOW
    private String reasonForChange;
}
