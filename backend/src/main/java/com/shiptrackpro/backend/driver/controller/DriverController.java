package com.shiptrackpro.backend.driver.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.driver.dto.UpdateStatusRequest;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/operator", "/api/v1/operator"})
@RequiredArgsConstructor
public class DriverController {

    private final DeliveryService deliveryService;

    @GetMapping("/deliveries")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<CustomerShipmentDto>>> getAssignedDeliveries(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<CustomerShipmentDto> deliveries = deliveryService.getDriverDeliveries(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Assigned deliveries fetched successfully", deliveries));
    }

    @PutMapping("/shipments/{id}/status")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<CustomerShipmentDto>> updateShipmentStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CustomerShipmentDto updated = deliveryService.updateShipmentStatus(
                id,
                request.getStatus(),
                request.getDescription(),
                userDetails.getUser()
        );
        return ResponseEntity.ok(ApiResponse.success("Shipment status updated successfully", updated));
    }
}
