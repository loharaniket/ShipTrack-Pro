package com.shiptrackpro.backend.shipment.entity;

import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.entity.Company;
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

    @Column(nullable = false, unique = true)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private String senderPhone;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "sender_address_id", nullable = false)
    private Address senderAddress;

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverPhone;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "receiver_address_id", nullable = false)
    private Address receiverAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentPriority priority = ShipmentPriority.NORMAL;

    private ZonedDateTime estimatedDeliveryTime;
    private ZonedDateTime actualDeliveryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    @Column(updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
