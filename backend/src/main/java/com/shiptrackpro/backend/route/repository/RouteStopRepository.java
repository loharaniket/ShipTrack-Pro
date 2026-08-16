package com.shiptrackpro.backend.route.repository;

import com.shiptrackpro.backend.route.entity.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, UUID> {

    List<RouteStop> findAllByRouteIdOrderByStopOrderAsc(UUID routeId);

    Optional<RouteStop> findByRouteIdAndId(UUID routeId, UUID id);

    Optional<RouteStop> findByShipmentId(UUID shipmentId);
}
