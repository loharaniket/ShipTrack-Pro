package com.shiptrackpro.backend.tracking.repository;

import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTracking, UUID> {
    List<ShipmentTracking> findByShipmentIdOrderByCreatedAtAsc(UUID shipmentId);
    List<ShipmentTracking> findByShipmentTrackingNumberOrderByCreatedAtAsc(String trackingNumber);
}
