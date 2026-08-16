package com.shiptrackpro.backend.route.repository;

import com.shiptrackpro.backend.route.entity.Route;
import com.shiptrackpro.backend.route.entity.RouteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteRepository extends JpaRepository<Route, UUID> {

    List<Route> findAllByOrderByCreatedAtDesc();

    List<Route> findAllByStatusOrderByCreatedAtDesc(RouteStatus status);

    List<Route> findAllByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    List<Route> findAllByOrganizationIdAndStatusOrderByCreatedAtDesc(UUID organizationId, RouteStatus status);

    Optional<Route> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<Route> findAllByDriverIdAndOrganizationId(UUID driverId, UUID organizationId);

    List<Route> findAllByDriverIdAndStatusInAndOrganizationId(UUID driverId, List<RouteStatus> statuses, UUID organizationId);

    List<Route> findAllByDriverIdAndStatusIn(UUID driverId, List<RouteStatus> statuses);

    List<Route> findAllByDriverId(UUID driverId);
}
