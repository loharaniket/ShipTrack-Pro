package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.ShipmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ShipmentHistoryRepository extends JpaRepository<ShipmentHistory, UUID> {
    List<ShipmentHistory> findAllByShipmentIdOrderByChangeTimestampAsc(UUID shipmentId);
}
