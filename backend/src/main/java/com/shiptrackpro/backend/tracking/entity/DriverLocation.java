package com.shiptrackpro.backend.tracking.entity;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "driver_locations")
public class DriverLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(precision = 10, scale = 2)
    private BigDecimal accuracy;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_status", length = 30)
    @Builder.Default
    private TrackingConnectionStatus connectionStatus = TrackingConnectionStatus.CONNECTED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private TrackingStatus status = TrackingStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private ZonedDateTime startedAt;

    @Column(name = "ended_at")
    private ZonedDateTime endedAt;

    @Column(name = "ended_reason", length = 100)
    private String endedReason;

    @Column(name = "last_ping_at")
    private ZonedDateTime lastPingAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
