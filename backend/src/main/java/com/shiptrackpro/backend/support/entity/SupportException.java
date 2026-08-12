package com.shiptrackpro.backend.support.entity;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "support_exceptions")
public class SupportException {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false)
    private String type; // DELIVERY_DELAY, FAILED_DELIVERY, ADDRESS_ISSUE

    private String status = "OPEN"; // OPEN, RESOLVED

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;

    private ZonedDateTime resolvedAt;
}
