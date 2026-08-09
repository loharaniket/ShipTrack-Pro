package com.shiptrackpro.backend.delivery.repository;

import com.shiptrackpro.backend.delivery.entity.ShipmentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ShipmentAssignmentRepository extends JpaRepository<ShipmentAssignment, UUID> {
    List<ShipmentAssignment> findAllByDriverId(UUID driverId);
}
