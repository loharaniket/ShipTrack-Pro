package com.shiptrackpro.backend.delivery.dto;

import com.shiptrackpro.backend.delivery.entity.AssignmentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class AssignmentDto {
    private UUID id;
    private UUID shipmentId;
    private UUID driverId;
    private AssignmentStatus status;
    private ZonedDateTime assignedAt;
}
