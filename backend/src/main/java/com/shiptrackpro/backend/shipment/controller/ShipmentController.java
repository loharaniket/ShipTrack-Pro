package com.shiptrackpro.backend.shipment.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/shipments", "/api/v1/shipments", "/api/admin/shipments"})
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CreateShipmentResponse>> createShipment(
            @Valid @RequestBody CreateShipmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CreateShipmentResponse response = shipmentService.createShipment(request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Shipment created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'SUPPORT_AGENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Object>> getShipments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        boolean isAdminOrSupport = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR || r.getName() == RoleName.SUPPORT_AGENT);

        if (isAdminOrSupport) {
            Pageable pageable = PageRequest.of(page, size);
            Page<CustomerShipmentDto> response = shipmentService.getAllShipments(pageable);
            return ResponseEntity.ok(ApiResponse.success("Shipments fetched successfully", response));
        } else {
            List<CustomerShipmentDto> response = shipmentService.getCustomerShipments(user);
            return ResponseEntity.ok(ApiResponse.success("Shipments fetched successfully", response));
        }
    }

    @GetMapping("/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'SUPPORT_AGENT', 'CUSTOMER', 'DRIVER')")
    public ResponseEntity<ApiResponse<CustomerShipmentDto>> getShipmentByTrackingNumber(
            @PathVariable String trackingNumber) {
        CustomerShipmentDto response = shipmentService.getShipmentByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Shipment fetched successfully", response));
    }

    @GetMapping("/id/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'SUPPORT_AGENT', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerShipmentDto>> getShipmentById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CustomerShipmentDto response = shipmentService.getCustomerShipmentById(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Shipment fetched successfully", response));
    }
}
