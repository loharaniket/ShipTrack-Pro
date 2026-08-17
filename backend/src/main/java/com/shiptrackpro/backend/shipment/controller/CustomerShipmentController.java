package com.shiptrackpro.backend.shipment.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/customer/shipments", "/api/v1/customer/shipments"})
@RequiredArgsConstructor
public class CustomerShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CreateShipmentResponse>> createShipment(
            @Valid @RequestBody CreateShipmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CreateShipmentResponse response = shipmentService.createShipment(request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<CustomerShipmentDto>>> getCustomerShipments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<CustomerShipmentDto> response = shipmentService.getCustomerShipments(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Shipments fetched successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMINISTRATOR', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<CustomerShipmentDto>> getShipmentById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CustomerShipmentDto response = shipmentService.getCustomerShipmentById(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Shipment details fetched successfully", response));
    }
}
