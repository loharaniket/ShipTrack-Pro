package com.shiptrackpro.backend.notifications.service;

import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.entity.NotificationLog;
import com.shiptrackpro.backend.notifications.repository.NotificationLogRepository;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationLogRepository notificationLogRepository;

    public List<Notification> getMyAlerts(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    public Notification markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public List<NotificationLog> getLogs() {
        return notificationLogRepository.findAll();
    }
}
