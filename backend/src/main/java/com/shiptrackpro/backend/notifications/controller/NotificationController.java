package com.shiptrackpro.backend.notifications.controller;

import com.shiptrackpro.backend.common.config.security.CustomUserDetails;
import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my-alerts")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyAlerts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UUID currentUserId = userDetails.getUser().getId();
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", notificationService.getMyAlerts(currentUserId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable UUID id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }
}
