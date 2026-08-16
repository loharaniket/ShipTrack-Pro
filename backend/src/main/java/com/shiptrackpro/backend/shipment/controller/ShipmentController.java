package com.shiptrackpro.backend.shipment.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.shipment.dto.*;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> createShipment(
            @Valid @RequestBody CreateShipmentRequest request, Authentication auth) {
        ShipmentResponse response = shipmentService.createShipment(request, auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shipment created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'CUSTOMER', 'DRIVER')")
    public ResponseEntity<ApiResponse<Page<ShipmentResponse>>> getShipments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        Pageable pageable = PageRequest.of(page, size);
        Page<ShipmentResponse> response = shipmentService.getShipments(user, pageable, Optional.ofNullable(search), Optional.ofNullable(status));
        return ResponseEntity.ok(ApiResponse.success("Shipments fetched successfully", response));
    }

    @GetMapping("/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> getShipmentByTrackingNumber(
            @PathVariable String trackingNumber, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        ShipmentResponse response = shipmentService.getShipmentByTrackingNumber(user, trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Shipment fetched successfully", response));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateShipment(
            @PathVariable UUID id,
            @RequestBody UpdateShipmentRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        ShipmentResponse response = shipmentService.updateShipment(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Shipment updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'CUSTOMER', 'DRIVER')")
    public ResponseEntity<ApiResponse<ShipmentResponse>> updateShipmentStatus(
            @PathVariable UUID id,
            @RequestBody UpdateShipmentStatusRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        ShipmentResponse response = shipmentService.updateShipmentStatus(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated successfully", response));
    }
}
