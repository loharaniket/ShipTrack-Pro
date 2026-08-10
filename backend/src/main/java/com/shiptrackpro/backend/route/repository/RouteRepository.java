package com.shiptrackpro.backend.route.repository;

import com.shiptrackpro.backend.route.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrackpro.backend.route.entity.RouteStatus;
import java.util.List;
import java.util.UUID;

public interface RouteRepository extends JpaRepository<Route, UUID> {
    List<Route> findAllByStatus(RouteStatus status);
    List<Route> findAllByDriverId(UUID driverId);
}
