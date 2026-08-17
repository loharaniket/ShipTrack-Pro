package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    Optional<Shipment> findByIdAndCustomerId(UUID id, UUID customerId);

    List<Shipment> findAllByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    Page<Shipment> findAllByCustomerId(UUID customerId, Pageable pageable);

    List<Shipment> findAllByStatus(ShipmentStatus status);

    Page<Shipment> findAllByStatus(ShipmentStatus status, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE " +
           "(LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.senderName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.receiverName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Shipment> findAllBySearch(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT nextval('shipment_seq')", nativeQuery = true)
    Long getNextShipmentSequence();
}
