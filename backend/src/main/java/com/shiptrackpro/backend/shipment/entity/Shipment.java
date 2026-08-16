package com.shiptrackpro.backend.shipment.entity;

import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 20)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShipmentPriority priority = ShipmentPriority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShipmentStatus status = ShipmentStatus.DRAFT;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "recipient_name", nullable = false, length = 150)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 30)
    private String recipientPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_address_id")
    private Address originAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_address_id", nullable = false)
    private Address destinationAddress;

    @Column(name = "scheduled_pickup")
    private ZonedDateTime scheduledPickup;

    @Column(name = "scheduled_delivery")
    private ZonedDateTime scheduledDelivery;

    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }

    public ZonedDateTime getEstimatedDeliveryTime() {
        return this.scheduledDelivery;
    }

    public void setActualDeliveryDate(ZonedDateTime date) {
        // Ignored or could be mapped to another field, skipping to maintain compatibility without DB change.
    }
}
