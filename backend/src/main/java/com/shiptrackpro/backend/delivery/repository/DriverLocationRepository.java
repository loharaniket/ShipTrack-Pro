package com.shiptrackpro.backend.delivery.repository;

import com.shiptrackpro.backend.delivery.entity.DriverLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DriverLocationRepository extends JpaRepository<DriverLocation, UUID> {
    Optional<DriverLocation> findFirstByDriverIdOrderByRecordedAtDesc(UUID driverId);
}
