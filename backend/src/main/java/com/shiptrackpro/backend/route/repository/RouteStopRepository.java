package com.shiptrackpro.backend.route.repository;

import com.shiptrackpro.backend.route.entity.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RouteStopRepository extends JpaRepository<RouteStop, UUID> {
    List<RouteStop> findAllByRouteIdOrderByStopOrderAsc(UUID routeId);
}
