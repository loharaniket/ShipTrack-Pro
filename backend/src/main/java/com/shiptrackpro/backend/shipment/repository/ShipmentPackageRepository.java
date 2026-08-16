package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.ShipmentPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ShipmentPackageRepository extends JpaRepository<ShipmentPackage, UUID> {
    List<ShipmentPackage> findByShipmentId(UUID shipmentId);
    void deleteByShipmentId(UUID shipmentId);
}
