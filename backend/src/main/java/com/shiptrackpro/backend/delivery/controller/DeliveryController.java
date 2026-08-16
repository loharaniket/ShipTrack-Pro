package com.shiptrackpro.backend.delivery.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.delivery.dto.*;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping("/drivers")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<DriverDto>>> getDrivers(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<DriverDto> response = deliveryService.getDrivers(user);
        return ResponseEntity.ok(ApiResponse.success("Drivers fetched successfully", response));
    }

    @PostMapping("/drivers")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<DriverDto>> createDriver(
            @Valid @RequestBody CreateDriverRequest request, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        DriverDto response = deliveryService.createDriver(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver created successfully", response));
    }

    @GetMapping("/vehicles")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getVehicles(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<VehicleDto> response = deliveryService.getVehicles(user);
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", response));
    }

    @GetMapping("/drivers/me")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<DriverDto>> getDriverProfile(Authentication auth) {
        DriverDto response = deliveryService.getDriverProfile(auth);
        return ResponseEntity.ok(ApiResponse.success("Driver profile fetched successfully", response));
    }

    @GetMapping("/drivers/me/assignments")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getDriverAssignments(Authentication auth) {
        List<AssignmentDto> response = deliveryService.getDriverAssignments(auth);
        return ResponseEntity.ok(ApiResponse.success("Driver assignments fetched successfully", response));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<AssignmentDto>> assignShipment(
            @RequestBody ShipmentAssignmentRequest request, Authentication auth) {
        AssignmentDto response = deliveryService.assignShipment(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment assigned successfully", response));
    }

    @PostMapping("/drivers/{driverId}/location")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<String>> updateLocation(
            @PathVariable UUID driverId, @RequestBody LocationUpdateRequest request) {
        String response = deliveryService.updateDriverLocation(driverId, request);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", response));
    }

    @GetMapping("/drivers/{driverId}/location")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'DRIVER')")
    public ResponseEntity<ApiResponse<DriverLocationDto>> getLatestLocation(
            @PathVariable UUID driverId) {
        DriverLocationDto response = deliveryService.getLatestDriverLocation(driverId);
        return ResponseEntity.ok(ApiResponse.success("Location fetched successfully", response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT')")
    public ResponseEntity<ApiResponse<List<DriverDto>>> getActiveDrivers(Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<DriverDto> response = deliveryService.getDrivers(user);
        return ResponseEntity.ok(ApiResponse.success("Active drivers retrieved", response));
    }

    @GetMapping("/drivers/{id}/current-route")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getCurrentRoute(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Current route fetched", 
            java.util.Map.of("remainingDistanceKm", 12.5, "etaMinutes", 35)));
    }
}
