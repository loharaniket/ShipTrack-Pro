package com.shiptrackpro.backend.tracking.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.tracking.dto.ActiveDriverTrackingDto;
import com.shiptrackpro.backend.tracking.dto.DriverLocationDto;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.tracking.service.LiveTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/tracking", "/api/tracking"})
@RequiredArgsConstructor
public class LiveTrackingController {

    private final LiveTrackingService liveTrackingService;

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<DriverLocationDto>> startTracking(
            @Valid @RequestBody StartTrackingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DriverLocationDto response = liveTrackingService.startTracking(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Tracking started successfully", response));
    }

    @PostMapping("/location")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<DriverLocationDto>> updateLocation(
            @Valid @RequestBody UpdateLocationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DriverLocationDto response = liveTrackingService.updateLocation(request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", response));
    }

    @PostMapping("/end/{shipmentId}")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<DriverLocationDto>> stopTracking(
            @PathVariable UUID shipmentId,
            @RequestParam(required = false, defaultValue = "DELIVERED") String reason,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DriverLocationDto response = liveTrackingService.stopTracking(shipmentId, reason, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Tracking ended successfully", response));
    }

    @GetMapping("/active-drivers")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'SUPPORT_AGENT')")
    public ResponseEntity<ApiResponse<List<ActiveDriverTrackingDto>>> getActiveDrivers() {
        List<ActiveDriverTrackingDto> response = liveTrackingService.getActiveDrivers();
        return ResponseEntity.ok(ApiResponse.success("Active drivers retrieved successfully", response));
    }

    @GetMapping("/shipment/{shipmentId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'BUSINESS_CLIENT', 'DRIVER', 'SUPPORT_AGENT', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<DriverLocationDto>> getShipmentLiveLocation(
            @PathVariable UUID shipmentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DriverLocationDto response = liveTrackingService.getShipmentLiveLocation(shipmentId, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Shipment live tracking retrieved successfully", response));
    }
}
