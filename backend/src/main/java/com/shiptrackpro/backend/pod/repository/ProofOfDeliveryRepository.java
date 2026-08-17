package com.shiptrackpro.backend.pod.repository;

import com.shiptrackpro.backend.pod.entity.ProofOfDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProofOfDeliveryRepository extends JpaRepository<ProofOfDelivery, UUID> {
    Optional<ProofOfDelivery> findByShipmentId(UUID shipmentId);
    Optional<ProofOfDelivery> findByShipmentTrackingNumber(String trackingNumber);
}
