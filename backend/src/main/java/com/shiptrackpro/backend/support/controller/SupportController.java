package com.shiptrackpro.backend.support.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.support.entity.SupportEscalation;
import com.shiptrackpro.backend.support.entity.SupportException;
import com.shiptrackpro.backend.support.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @GetMapping("/exceptions")
    public ResponseEntity<ApiResponse<List<SupportException>>> getExceptions() {
        return ResponseEntity.ok(ApiResponse.success("Exceptions retrieved", supportService.getExceptions()));
    }

    @PostMapping("/exceptions/{id}/resolve")
    public ResponseEntity<ApiResponse<SupportException>> resolveException(@PathVariable UUID id) {
        SupportException exception = supportService.resolveException(id);
        return ResponseEntity.ok(ApiResponse.success("Exception resolved", exception));
    }

    @GetMapping("/escalations")
    public ResponseEntity<ApiResponse<List<SupportEscalation>>> getEscalations() {
        return ResponseEntity.ok(ApiResponse.success("Escalations retrieved", supportService.getEscalations()));
    }

    @PutMapping("/escalations/{id}/assign")
    public ResponseEntity<ApiResponse<SupportEscalation>> assignEscalation(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body) {
        SupportEscalation escalation = supportService.assignEscalation(id, body.get("agentId"));
        return ResponseEntity.ok(ApiResponse.success("Escalation assigned", escalation));
    }
}
