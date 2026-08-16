package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {

    Optional<Shipment> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Shipment> findByTrackingNumberAndOrganizationId(String trackingNumber, UUID organizationId);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    Page<Shipment> findAllByOrganizationId(UUID organizationId, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.organization.id = :orgId AND " +
           "(LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.customerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Shipment> findAllByOrganizationIdAndSearch(
            @Param("orgId") UUID orgId, 
            @Param("search") String search, 
            Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.organization.id = :orgId AND " +
           "(LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.customerName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "s.status = :status")
    Page<Shipment> findAllByOrganizationIdAndSearchAndStatus(
            @Param("orgId") UUID orgId, 
            @Param("search") String search, 
            @Param("status") ShipmentStatus status,
            Pageable pageable);

    Page<Shipment> findAllByOrganizationIdAndStatus(UUID orgId, ShipmentStatus status, Pageable pageable);

    // Admin-level queries (no org filter)
    @Query("SELECT s FROM Shipment s WHERE " +
           "LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.customerName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Shipment> findAllBySearch(
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE " +
           "(LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.customerName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "s.status = :status")
    Page<Shipment> findAllBySearchAndStatus(
            @Param("search") String search,
            @Param("status") ShipmentStatus status,
            Pageable pageable);

    Page<Shipment> findAllByStatus(ShipmentStatus status, Pageable pageable);
}
