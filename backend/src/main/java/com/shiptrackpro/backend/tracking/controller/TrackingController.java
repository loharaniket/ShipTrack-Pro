package com.shiptrackpro.backend.tracking.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.tracking.dto.CreateTrackingEventRequest;
import com.shiptrackpro.backend.tracking.dto.LocationDto;
import com.shiptrackpro.backend.tracking.dto.TrackingEventDto;
import com.shiptrackpro.backend.tracking.dto.TrackingTimelineDto;
import com.shiptrackpro.backend.tracking.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrackingTimelineDto>> getTracking(
            @PathVariable UUID id) {
        // Keeping it simple, returning the timeline DTO for now
        TrackingTimelineDto response = trackingService.getTrackingTimeline(id.toString());
        return ResponseEntity.ok(ApiResponse.success("Tracking info fetched successfully", response));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<TrackingTimelineDto>> getTrackingTimeline(
            @PathVariable UUID id) {
        TrackingTimelineDto response = trackingService.getTrackingTimeline(id.toString());
        return ResponseEntity.ok(ApiResponse.success("Tracking timeline fetched successfully", response));
    }

    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<TrackingEventDto>> addTrackingEvent(
            @RequestBody CreateTrackingEventRequest request,
            Authentication auth) {
        TrackingEventDto response = trackingService.addTrackingEvent(request.getTrackingNumber(), request, auth);
        return ResponseEntity.ok(ApiResponse.success("Tracking event added successfully", response));
    }

    @GetMapping("/{id}/location-history")
    public ResponseEntity<ApiResponse<java.util.List<LocationDto>>> getLocationHistory(
            @PathVariable UUID id) {
        // Return dummy location history for beginner-friendly approach
        return ResponseEntity.ok(ApiResponse.success("Location history fetched successfully", java.util.Collections.emptyList()));
    }
}
