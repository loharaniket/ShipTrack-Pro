package com.shiptrackpro.backend.route.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.route.dto.*;
import com.shiptrackpro.backend.route.entity.RouteStatus;
import com.shiptrackpro.backend.route.service.RouteService;
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
@RequestMapping("/api/v1/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<RouteDto>>> getAllRoutes(
            @RequestParam(required = false) RouteStatus status, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        List<RouteDto> response = routeService.getAllRoutes(user, status);
        return ResponseEntity.ok(ApiResponse.success("Routes fetched successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT', 'DRIVER')")
    public ResponseEntity<ApiResponse<RouteDetailsDto>> getRouteDetails(
            @PathVariable UUID id, Authentication auth) {
        User user = getAuthenticatedUser(auth);
        RouteDetailsDto response = routeService.getRouteDetails(id, user);
        return ResponseEntity.ok(ApiResponse.success("Route details fetched successfully", response));
    }

    @GetMapping("/driver/me")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<RouteDetailsDto>>> getMyRoutes(Authentication auth) {
        List<RouteDetailsDto> response = routeService.getMyRoutes(auth);
        return ResponseEntity.ok(ApiResponse.success("Driver routes fetched successfully", response));
    }

    @PostMapping("/plan")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'BUSINESS_CLIENT')")
    public ResponseEntity<ApiResponse<RouteDto>> createRoute(
            @Valid @RequestBody CreateRouteRequest request, Authentication auth) {
        RouteDto response = routeService.createRoute(request, auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Route planned successfully", response));
    }

    @PostMapping("/{id}/assign-driver")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<RouteDto>> assignDriver(
            @PathVariable UUID id,
            @Valid @RequestBody AssignDriverRequest request,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        RouteDto response = routeService.assignDriver(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Driver assigned successfully", response));
    }

    @PostMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<RouteDto>> dispatchRoute(
            @PathVariable UUID id,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        RouteDto response = routeService.dispatchRoute(id, user);
        return ResponseEntity.ok(ApiResponse.success("Route dispatched successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<RouteDto>> updateRouteStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRouteStatusRequest request,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        RouteDto response = routeService.updateRouteStatus(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Route status updated successfully", response));
    }

    @PutMapping("/{id}/stops/{stopId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'DRIVER')")
    public ResponseEntity<ApiResponse<RouteStopDto>> updateStopStatus(
            @PathVariable UUID id,
            @PathVariable UUID stopId,
            @Valid @RequestBody UpdateStopStatusRequest request,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        RouteStopDto response = routeService.updateStopStatus(id, stopId, request, user);
        return ResponseEntity.ok(ApiResponse.success("Route stop status updated successfully", response));
    }

    @PostMapping("/{id}/optimize")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<RouteDetailsDto>> optimizeRoute(
            @PathVariable UUID id,
            @RequestBody(required = false) OptimizeRouteRequest request,
            Authentication auth) {
        User user = getAuthenticatedUser(auth);
        if (request == null) {
            request = new OptimizeRouteRequest();
        }
        RouteDetailsDto response = routeService.optimizeRoute(id, request, user);
        return ResponseEntity.ok(ApiResponse.success("Route optimized successfully", response));
    }
}
