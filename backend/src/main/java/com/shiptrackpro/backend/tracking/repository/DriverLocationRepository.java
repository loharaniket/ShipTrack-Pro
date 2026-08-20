package com.shiptrackpro.backend.tracking.repository;

import com.shiptrackpro.backend.tracking.entity.DriverLocation;
import com.shiptrackpro.backend.tracking.entity.TrackingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverLocationRepository extends JpaRepository<DriverLocation, UUID> {

    Optional<DriverLocation> findByDriverIdAndStatus(UUID driverId, TrackingStatus status);

    Optional<DriverLocation> findByShipmentIdAndStatus(UUID shipmentId, TrackingStatus status);

    Optional<DriverLocation> findFirstByShipmentIdOrderByStartedAtDesc(UUID shipmentId);

    List<DriverLocation> findByStatus(TrackingStatus status);

    boolean existsByDriverIdAndStatus(UUID driverId, TrackingStatus status);

    List<DriverLocation> findByDriverIdOrderByStartedAtDesc(UUID driverId);

    @Query("SELECT dl FROM DriverLocation dl " +
           "JOIN FETCH dl.driver d " +
           "JOIN FETCH dl.shipment s " +
           "WHERE dl.status = :status")
    List<DriverLocation> findAllActiveWithDriverAndShipment(@Param("status") TrackingStatus status);
}
