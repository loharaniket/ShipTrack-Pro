package com.shiptrackpro.backend.support.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.support.dto.SupportTicketDto;
import com.shiptrackpro.backend.support.dto.UpdateTicketRequest;
import com.shiptrackpro.backend.support.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/support/tickets", "/api/v1/support/tickets"})
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<SupportTicketDto>>> getAllTickets(
            @RequestParam(required = false) String status) {
        List<SupportTicketDto> tickets = supportService.getAllTickets(status);
        return ResponseEntity.ok(ApiResponse.success("Support tickets fetched successfully", tickets));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMINISTRATOR', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<SupportTicketDto>> getTicketById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketDto ticket = supportService.getTicketDetails(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Support ticket fetched successfully", ticket));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<SupportTicketDto>> updateTicketStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketDto updated = supportService.updateTicketStatus(id, request.getStatus(), userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Support ticket updated successfully", updated));
    }
}
