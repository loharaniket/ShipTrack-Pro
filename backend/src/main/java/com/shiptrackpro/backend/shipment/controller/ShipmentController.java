package com.shiptrackpro.backend.shipment.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.shipment.dto.*;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentDto>> createShipment(
            @RequestBody CreateShipmentRequest request, Authentication auth) {
        ShipmentDto response = shipmentService.createShipment(request, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentDto>> getShipmentById(
            @PathVariable UUID id, Authentication auth) {
        ShipmentDto response = shipmentService.getShipmentById(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment fetched successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ShipmentSummaryDto>>> getAllShipments(
            @RequestParam(required = false) Boolean assigned,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ShipmentSummaryDto> response = shipmentService.getAllShipments(assigned, pageable, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipments fetched successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentDto>> updateShipment(
            @PathVariable UUID id,
            @RequestBody UpdateShipmentRequest request, Authentication auth) {
        ShipmentDto response = shipmentService.updateShipment(id, request, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment updated successfully", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelShipment(
            @PathVariable UUID id, Authentication auth) {
        shipmentService.cancelShipment(id, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment cancelled successfully", null));
    }

    @PostMapping("/{id}/packages")
    public ResponseEntity<ApiResponse<PackageDto>> addPackageToShipment(
            @PathVariable UUID id, @RequestBody PackageDto request) {
        PackageDto response = shipmentService.addPackageToShipment(id, request);
        System.out.println("\n***********Package Add Successfully************");
        return ResponseEntity.ok(ApiResponse.success("Package added successfully", response));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<ShipmentHistoryDto>>> getShipmentHistory(
            @PathVariable UUID id) {
        List<ShipmentHistoryDto> response = shipmentService.getShipmentHistory(id);
        return ResponseEntity.ok(ApiResponse.success("History fetched successfully", response));
    }

    // LOGISTICS_OPERATOR, SUPPORT_AGENT,ADMINISTRATOR
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateShipmentStatus(@PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body, Authentication auth) {
        ShipmentStatus status = ShipmentStatus.valueOf(body.get("status"));
        shipmentService.updateShipmentHistory(id, status, auth);
        return ResponseEntity.ok(ApiResponse.success("Shipment Status Updated", null));
    }
}
