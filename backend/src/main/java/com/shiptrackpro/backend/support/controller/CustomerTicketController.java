package com.shiptrackpro.backend.support.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.support.dto.CreateTicketRequest;
import com.shiptrackpro.backend.support.dto.SupportTicketDto;
import com.shiptrackpro.backend.support.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/customer/tickets", "/api/v1/customer/tickets"})
@RequiredArgsConstructor
public class CustomerTicketController {

    private final SupportService supportService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<SupportTicketDto>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        SupportTicketDto response = supportService.createTicket(request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support ticket created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<SupportTicketDto>>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<SupportTicketDto> response = supportService.getMyTickets(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Support tickets fetched successfully", response));
    }
}
