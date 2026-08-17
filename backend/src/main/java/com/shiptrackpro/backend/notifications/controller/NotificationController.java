package com.shiptrackpro.backend.notifications.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.notifications.dto.NotificationDto;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-alerts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyAlerts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<NotificationDto> alerts = notificationService.getUserAlerts(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Alerts fetched successfully", alerts));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        NotificationDto notification = notificationService.markNotificationAsRead(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Alert marked as read", notification));
    }
}
