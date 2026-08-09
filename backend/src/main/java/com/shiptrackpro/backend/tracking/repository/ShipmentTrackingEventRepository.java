package com.shiptrackpro.backend.tracking.repository;

import com.shiptrackpro.backend.tracking.entity.ShipmentTrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShipmentTrackingEventRepository extends JpaRepository<ShipmentTrackingEvent, UUID> {
    List<ShipmentTrackingEvent> findAllByShipmentIdOrderByCreatedAtDesc(UUID shipmentId);
    Optional<ShipmentTrackingEvent> findFirstByShipmentIdAndLatitudeIsNotNullAndLongitudeIsNotNullOrderByCreatedAtDesc(UUID shipmentId);
}
