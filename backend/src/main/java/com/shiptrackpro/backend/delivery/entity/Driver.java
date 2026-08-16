package com.shiptrackpro.backend.delivery.entity;

import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.user.entity.User;
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
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Builder.Default
    @Column(name = "experience_years")
    private Integer experienceYears = 1;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "Active";

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }
}
