package com.shiptrackpro.backend.pod.dto;

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
public class PodResponse {
    private UUID id;
    private UUID shipmentId;
    private String trackingNumber;
    private String receiverName;
    private String photoUrl;
    private ZonedDateTime deliveryTime;
    private String message;
}
