package com.shiptrackpro.backend.route.entity;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "route_stops")
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RouteStopStatus status = RouteStopStatus.PENDING;

    @Column(name = "planned_arrival")
    private ZonedDateTime plannedArrival;

    @Column(name = "actual_arrival")
    private ZonedDateTime actualArrival;

    @Column(name = "actual_departure")
    private ZonedDateTime actualDeparture;

    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
