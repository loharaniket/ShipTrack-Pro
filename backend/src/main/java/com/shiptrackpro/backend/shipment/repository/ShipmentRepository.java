package com.shiptrackpro.backend.shipment.repository;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShipmentRepository extends JpaRepository<Shipment, UUID> {
    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    Page<Shipment> findAllByCompanyId(UUID companyId, Pageable pageable);

    Page<Shipment> findAllByCreatedById(UUID userId, Pageable pageable);

<<<<<<< HEAD
    @Query("SELECT sa.shipment FROM ShipmentAssignment sa WHERE sa.driver.user.id = :userId")
    Page<Shipment> findAllAssignedToDriverUserId(@Param("userId") UUID userId, Pageable pageable);
=======
    @Query("SELECT s FROM Shipment s WHERE " +
           "(:assigned IS NULL OR " +
           "(:assigned = true AND (EXISTS (SELECT 1 FROM ShipmentAssignment sa WHERE sa.shipment = s) OR EXISTS (SELECT 1 FROM RouteStop rs WHERE rs.shipment = s))) OR " +
           "(:assigned = false AND NOT EXISTS (SELECT 1 FROM ShipmentAssignment sa WHERE sa.shipment = s) AND NOT EXISTS (SELECT 1 FROM RouteStop rs WHERE rs.shipment = s)))")
    Page<Shipment> findAllWithFilters(@Param("assigned") Boolean assigned, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.company.id = :companyId AND " +
           "(:assigned IS NULL OR " +
           "(:assigned = true AND (EXISTS (SELECT 1 FROM ShipmentAssignment sa WHERE sa.shipment = s) OR EXISTS (SELECT 1 FROM RouteStop rs WHERE rs.shipment = s))) OR " +
           "(:assigned = false AND NOT EXISTS (SELECT 1 FROM ShipmentAssignment sa WHERE sa.shipment = s) AND NOT EXISTS (SELECT 1 FROM RouteStop rs WHERE rs.shipment = s)))")
    Page<Shipment> findAllByCompanyIdWithFilters(@Param("companyId") UUID companyId, @Param("assigned") Boolean assigned, Pageable pageable);

    @Query("SELECT s FROM Shipment s WHERE s.createdBy.id = :userId AND " +
           "(:assigned IS NULL OR " +
           "(:assigned = true AND (EXISTS (SELECT 1 FROM ShipmentAssignment sa WHERE sa.shipment = s) OR EXISTS (SELECT 1 FROM RouteStop rs WHERE rs.shipment = s))) OR " +
           "(:assigned = false AND NOT EXISTS (SELECT 1 FROM ShipmentAssignment sa WHERE sa.shipment = s) AND NOT EXISTS (SELECT 1 FROM RouteStop rs WHERE rs.shipment = s)))")
    Page<Shipment> findAllByCreatedByIdWithFilters(@Param("userId") UUID userId, @Param("assigned") Boolean assigned, Pageable pageable);
>>>>>>> feat/route_management_service

    Optional<Shipment> findById(UUID id);
}
