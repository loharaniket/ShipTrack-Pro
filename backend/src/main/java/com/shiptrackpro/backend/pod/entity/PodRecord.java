package com.shiptrackpro.backend.pod.entity;

import com.shiptrackpro.backend.delivery.entity.Driver;
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
@Table(name = "pod_records")
public class PodRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(columnDefinition = "TEXT")
    private String packagePhoto; // Base64

    @Column(columnDefinition = "TEXT")
    private String doorPhoto; // Base64

    @Column(columnDefinition = "TEXT")
    private String signature; // Base64

    private Double latitude;
    private Double longitude;

    private String status = "PENDING_VERIFICATION"; // PENDING_VERIFICATION, VERIFIED, REJECTED

    private ZonedDateTime timestamp = ZonedDateTime.now();

    @CreationTimestamp
    @Column(updatable = false)
    private ZonedDateTime createdAt;
}
