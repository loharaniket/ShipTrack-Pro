package com.shiptrackpro.backend.delivery.repository;

import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, UUID> {
    List<DeliveryAssignment> findByDriverIdOrderByAssignedDateDesc(UUID driverId);
    Optional<DeliveryAssignment> findByShipmentId(UUID shipmentId);
    boolean existsByShipmentId(UUID shipmentId);
}
