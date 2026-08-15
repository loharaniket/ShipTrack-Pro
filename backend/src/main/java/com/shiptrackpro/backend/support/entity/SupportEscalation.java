package com.shiptrackpro.backend.support.entity;

import com.shiptrackpro.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "support_escalations")
public class SupportEscalation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exception_id", nullable = false)
    private SupportException exception;

    private String priority = "HIGH"; // HIGH, CRITICAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;
}
