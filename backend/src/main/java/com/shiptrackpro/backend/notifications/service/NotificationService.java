package com.shiptrackpro.backend.notifications.service;

import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import com.shiptrackpro.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getMyAlerts(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    public Notification markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public Notification createNotification(User user, String title, String message, String type) {
        if (user == null) return null;
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }
}
