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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false)
    private Integer stopOrder;

    private ZonedDateTime estimatedArrival;
    
    private ZonedDateTime actualArrival;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStopStatus status = RouteStopStatus.PENDING;
}
