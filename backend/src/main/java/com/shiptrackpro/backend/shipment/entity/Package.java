package com.shiptrackpro.backend.shipment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "packages")
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false)
    private Double weightKg;

    @Column(nullable = false)
    private String dimensionsCm;

    @Column(nullable = false)
    private String contentDescription;

    @Column(updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    private ZonedDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
