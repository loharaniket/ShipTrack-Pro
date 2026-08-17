package com.shiptrackpro.backend.admin.dto;

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
public class AssignmentResponse {
    private UUID id;
    private UUID shipmentId;
    private String trackingNumber;
    private UUID driverId;
    private String driverName;
    private String status;
    private ZonedDateTime assignedDate;
    private String message;
}
