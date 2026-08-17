package com.shiptrackpro.backend.support.dto;

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
public class SupportTicketDto {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private UUID shipmentId;
    private String trackingNumber;
    private String subject;
    private String description;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
