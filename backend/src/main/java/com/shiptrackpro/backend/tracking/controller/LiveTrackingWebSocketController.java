package com.shiptrackpro.backend.tracking.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.tracking.service.LiveTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class LiveTrackingWebSocketController {

    private final LiveTrackingService liveTrackingService;

    @MessageMapping("/tracking/start")
    public void handleStartTracking(@Payload StartTrackingRequest request, Principal principal) {
        if (principal instanceof AbstractAuthenticationToken token
                && token.getPrincipal() instanceof CustomUserDetails customUser) {
            liveTrackingService.startTracking(request, customUser.getUser());
        }
    }

    @MessageMapping("/tracking/location")
    public void handleLocationUpdate(@Payload UpdateLocationRequest request, Principal principal) {
        if (principal instanceof AbstractAuthenticationToken token
                && token.getPrincipal() instanceof CustomUserDetails customUser) {
            liveTrackingService.updateLocation(request, customUser.getUser());
        }
    }

    @MessageMapping("/tracking/end")
    public void handleEndTracking(@Payload UUID shipmentId, Principal principal) {
        if (principal instanceof AbstractAuthenticationToken token
                && token.getPrincipal() instanceof CustomUserDetails customUser) {
            liveTrackingService.stopTracking(shipmentId, "DELIVERED", customUser.getUser());
        }
    }
}
