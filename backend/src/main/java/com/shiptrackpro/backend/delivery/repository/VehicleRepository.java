package com.shiptrackpro.backend.delivery.repository;

import com.shiptrackpro.backend.delivery.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findAllByOrganizationId(UUID organizationId);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
}
