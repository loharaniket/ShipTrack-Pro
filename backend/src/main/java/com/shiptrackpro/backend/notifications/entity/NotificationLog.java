package com.shiptrackpro.backend.notifications.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "notification_logs")
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String type; // SMS, EMAIL, PUSH

    @Column(nullable = false)
    private String status; // SENT, FAILED

    @Column(nullable = false)
    private String recipient;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime sentAt;
}
