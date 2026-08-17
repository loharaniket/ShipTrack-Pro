package com.shiptrackpro.backend.admin.controller;

import com.shiptrackpro.backend.admin.dto.AssignDriverRequest;
import com.shiptrackpro.backend.admin.dto.AssignmentResponse;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/admin", "/api/v1/admin"})
@RequiredArgsConstructor
public class AdminController {

    private final ShipmentService shipmentService;
    private final DeliveryService deliveryService;

    @GetMapping("/shipments/pending")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<CustomerShipmentDto>>> getPendingShipments() {
        List<CustomerShipmentDto> response = shipmentService.getPendingShipments();
        return ResponseEntity.ok(ApiResponse.success("Pending shipments fetched successfully", response));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> assignDriver(
            @Valid @RequestBody AssignDriverRequest request) {
        DeliveryAssignment assignment = deliveryService.assignShipment(request.getShipmentId(), request.getDriverId());
        AssignmentResponse response = deliveryService.mapToAssignmentResponse(assignment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Driver assigned successfully", response));
    }

    @GetMapping("/drivers")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<User>>> getDrivers() {
        List<User> drivers = deliveryService.getDrivers();
        return ResponseEntity.ok(ApiResponse.success("Drivers fetched successfully", drivers));
    }
}
