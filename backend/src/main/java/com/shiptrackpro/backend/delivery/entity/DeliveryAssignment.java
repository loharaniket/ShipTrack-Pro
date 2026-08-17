package com.shiptrackpro.backend.delivery.entity;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "delivery_assignments")
public class DeliveryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @CreationTimestamp
    @Column(name = "assigned_date", nullable = false, updatable = false)
    private ZonedDateTime assignedDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ASSIGNED";
}
