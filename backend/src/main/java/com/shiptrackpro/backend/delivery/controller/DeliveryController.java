package com.shiptrackpro.backend.delivery.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.delivery.dto.*;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/delivery")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<DriverDto>>> getDrivers() {
        List<DriverDto> response = deliveryService.getDrivers();
        return ResponseEntity.ok(ApiResponse.success("Drivers fetched successfully", response));
    }

    @GetMapping("/drivers/me")
    public ResponseEntity<ApiResponse<DriverDto>> getDriverProfile(Authentication auth) {
        DriverDto response = deliveryService.getDriverProfile(auth);
        return ResponseEntity.ok(ApiResponse.success("Driver profile fetched successfully", response));
    }

    @GetMapping("/drivers/me/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> getDriverAssignments(Authentication auth) {
        List<AssignmentDto> response = deliveryService.getDriverAssignments(auth);
        return ResponseEntity.ok(ApiResponse.success("Driver assignments fetched successfully", response));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<AssignmentDto>> assignShipment(
            @RequestBody ShipmentAssignmentRequest request, Authentication auth) {
        AssignmentDto response = deliveryService.assignShipment(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment assigned successfully", response));
    }

    @PostMapping("/drivers/{driverId}/location")
    public ResponseEntity<ApiResponse<String>> updateLocation(
            @PathVariable UUID driverId, @RequestBody LocationUpdateRequest request) {
        String response = deliveryService.updateDriverLocation(driverId, request);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", response));
    }

    @GetMapping("/drivers/{driverId}/location")
    public ResponseEntity<ApiResponse<DriverLocationDto>> getLatestLocation(
            @PathVariable UUID driverId) {
        DriverLocationDto response = deliveryService.getLatestDriverLocation(driverId);
        return ResponseEntity.ok(ApiResponse.success("Location fetched successfully", response));
    }
}
