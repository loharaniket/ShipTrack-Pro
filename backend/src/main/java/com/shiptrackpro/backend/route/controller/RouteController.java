package com.shiptrackpro.backend.route.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.route.dto.*;
import com.shiptrackpro.backend.route.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.shiptrackpro.backend.route.entity.RouteStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RouteDto>>> getAllRoutes(
            @RequestParam(required = false) RouteStatus status) {
        List<RouteDto> response = routeService.getAllRoutes(status);
        return ResponseEntity.ok(ApiResponse.success("Routes fetched successfully", response));
    }

    @GetMapping("/driver/me")
    public ResponseEntity<ApiResponse<List<RouteDto>>> getMyRoutes(Authentication auth) {
        List<RouteDto> response = routeService.getMyRoutes(auth);
        return ResponseEntity.ok(ApiResponse.success("Driver routes fetched successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RouteDto>> createRoute(@RequestBody CreateRouteRequest request) {
        RouteDto response = routeService.createRoute(request);
        return ResponseEntity.ok(ApiResponse.success("Route created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RouteDetailsDto>> getRouteDetails(@PathVariable UUID id) {
        RouteDetailsDto response = routeService.getRouteDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Route details fetched successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RouteDto>> updateRouteStatus(
            @PathVariable UUID id, @RequestBody UpdateRouteStatusRequest request) {
        RouteDto response = routeService.updateRouteStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Route status updated successfully", response));
    }

    @PostMapping("/{id}/stops")
    public ResponseEntity<ApiResponse<RouteStopDto>> addStopToRoute(
            @PathVariable UUID id, @RequestBody AddRouteStopRequest request) {
        RouteStopDto response = routeService.addStopToRoute(id, request);
        return ResponseEntity.ok(ApiResponse.success("Route stop added successfully", response));
    }

    @PutMapping("/{id}/stops/{stopId}")
    public ResponseEntity<ApiResponse<RouteStopDto>> updateStopStatus(
            @PathVariable UUID id, @PathVariable UUID stopId, @RequestBody UpdateStopStatusRequest request) {
        RouteStopDto response = routeService.updateStopStatus(id, stopId, request);
        return ResponseEntity.ok(ApiResponse.success("Route stop status updated successfully", response));
    }
}
