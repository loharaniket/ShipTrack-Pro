package com.shiptrackpro.backend.route.entity;

import com.shiptrackpro.backend.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
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
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RouteStatus status = RouteStatus.DRAFT;

    @Column(name = "total_distance_km", nullable = false)
    private Double totalDistanceKm = 0.0;

    @Column(name = "total_duration_minutes", nullable = false)
    private Integer totalDurationMinutes = 0;

    @Column(name = "planned_start")
    private ZonedDateTime plannedStart;

    @Column(name = "planned_end")
    private ZonedDateTime plannedEnd;

    @Column(name = "actual_start")
    private ZonedDateTime actualStart;

    @Column(name = "actual_end")
    private ZonedDateTime actualEnd;

    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stopOrder ASC")
    private List<RouteStop> stops = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
