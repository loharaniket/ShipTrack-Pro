package com.shiptrackpro.backend.route.entity;

import com.shiptrackpro.backend.delivery.entity.Driver;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "total_distance_km")
    private Double totalDistanceKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStatus status = RouteStatus.PLANNED;

    private ZonedDateTime startTime;
    private ZonedDateTime endTime;

    @Column(updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
    
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
