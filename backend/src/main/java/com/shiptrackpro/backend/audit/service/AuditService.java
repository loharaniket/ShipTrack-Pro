package com.shiptrackpro.backend.audit.service;

import com.shiptrackpro.backend.audit.dto.AuditLogDto;
import com.shiptrackpro.backend.audit.entity.AuditAction;
import com.shiptrackpro.backend.audit.entity.AuditLog;
import com.shiptrackpro.backend.audit.repository.AuditLogRepository;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void logAction(UUID userId, AuditAction action, String entityName, UUID entityId) {
        if (userId == null) return;
        
        AppUser user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            AuditLog log = new AuditLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            auditLogRepository.save(log);
        }
    }

    public Page<AuditLogDto> getUserActivity(UUID userId, Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.findByUserId(userId, pageable);
        return logs.map(this::mapToDto);
    }

    private AuditLogDto mapToDto(AuditLog log) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(log.getId());
        dto.setUserId(log.getUser().getId());
        dto.setAction(log.getAction());
        dto.setEntityName(log.getEntityName());
        dto.setEntityId(log.getEntityId());
        dto.setTimestamp(log.getTimestamp());
        return dto;
    }
}
