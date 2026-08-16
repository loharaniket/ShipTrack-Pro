package com.shiptrackpro.backend.delivery.entity;

import com.shiptrackpro.backend.organization.entity.Organization;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "license_plate", length = 50)
    private String licensePlate;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String type = "Van";

    @Builder.Default
    @Column(name = "capacity_kg", nullable = false)
    private Double capacityKg = 500.0;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "Active";

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.updatedAt = ZonedDateTime.now();
        if (this.licensePlate == null && this.registrationNumber != null) {
            this.licensePlate = this.registrationNumber;
        }
    }
}
