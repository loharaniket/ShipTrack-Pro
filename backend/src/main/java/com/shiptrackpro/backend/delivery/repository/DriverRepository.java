package com.shiptrackpro.backend.delivery.repository;

import com.shiptrackpro.backend.delivery.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
    Optional<Driver> findByUserId(UUID userId);
    List<Driver> findAllByOrganizationId(UUID organizationId);
    List<Driver> findAllByOrganizationIdAndStatus(UUID organizationId, String status);
    List<Driver> findAllByStatus(String status);
}
