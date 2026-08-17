package com.shiptrackpro.backend.tracking.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.tracking.dto.PublicTrackingResponse;
import com.shiptrackpro.backend.tracking.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/tracking", "/api/v1/tracking"})
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService trackingService;

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<ApiResponse<PublicTrackingResponse>> getPublicTracking(
            @PathVariable String trackingNumber) {
        PublicTrackingResponse response = trackingService.getPublicTrackingTimeline(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Tracking timeline fetched successfully", response));
    }
}
