package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    Page<Shipment> findAllByCompanyId(UUID companyId, Pageable pageable);

    Page<Shipment> findAllByCreatedById(UUID userId, Pageable pageable);

    Optional<Shipment> findById(UUID id);
}
