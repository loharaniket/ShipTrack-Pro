package com.shiptrackpro.backend.support.service;

import com.shiptrackpro.backend.support.entity.SupportEscalation;
import com.shiptrackpro.backend.support.entity.SupportException;
import com.shiptrackpro.backend.support.repository.SupportEscalationRepository;
import com.shiptrackpro.backend.support.repository.SupportExceptionRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportExceptionRepository exceptionRepository;
    private final SupportEscalationRepository escalationRepository;
    private final UserRepository userRepository;

    public List<SupportException> getExceptions() {
        return exceptionRepository.findAll();
    }

    public SupportException resolveException(UUID id) {
        SupportException ex = exceptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exception not found"));
        ex.setStatus("RESOLVED");
        ex.setResolvedAt(ZonedDateTime.now());
        return exceptionRepository.save(ex);
    }

    public List<SupportEscalation> getEscalations() {
        return escalationRepository.findAll();
    }

    public SupportEscalation assignEscalation(UUID id, UUID agentId) {
        SupportEscalation esc = escalationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escalation not found"));
        
        esc.setAssignedTo(userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("User not found")));
        esc.setStatus("IN_PROGRESS");
        return escalationRepository.save(esc);
    }
}
