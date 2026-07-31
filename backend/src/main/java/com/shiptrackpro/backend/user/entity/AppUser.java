package com.shiptrackpro.backend.user.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String firstName;
    private String lastName;

    @Enumerated(EnumType.STRING)
    private AppRole role;

    private Boolean isActive = true;
    private ZonedDateTime lastLogin;

    @Column(updatable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();

    private ZonedDateTime updatedAt = ZonedDateTime.now();

    private ZonedDateTime deletedAt;
}
