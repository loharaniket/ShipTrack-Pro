package com.shiptrackpro.backend.audit.dto;

import com.shiptrackpro.backend.audit.entity.AuditAction;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AuditLogDto {
    private UUID id;
    private UUID userId;
    private AuditAction action;
    private String entityName;
    private UUID entityId;
    private ZonedDateTime timestamp;
}
