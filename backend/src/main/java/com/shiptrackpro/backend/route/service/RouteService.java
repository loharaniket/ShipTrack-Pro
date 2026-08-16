package com.shiptrackpro.backend.route.service;

import com.shiptrackpro.backend.organization.entity.Organization;
import com.shiptrackpro.backend.organization.entity.OrganizationMember;
import com.shiptrackpro.backend.organization.entity.OrganizationStatus;
import com.shiptrackpro.backend.organization.repository.OrganizationMemberRepository;
import com.shiptrackpro.backend.organization.repository.OrganizationRepository;
import com.shiptrackpro.backend.route.dto.*;
import com.shiptrackpro.backend.route.entity.Route;
import com.shiptrackpro.backend.route.entity.RouteStatus;
import com.shiptrackpro.backend.route.entity.RouteStop;
import com.shiptrackpro.backend.route.entity.RouteStopStatus;
import com.shiptrackpro.backend.route.repository.RouteRepository;
import com.shiptrackpro.backend.route.repository.RouteStopRepository;
import com.shiptrackpro.backend.shipment.entity.Address;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import com.shiptrackpro.backend.delivery.entity.Driver;
import com.shiptrackpro.backend.delivery.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final RouteStopRepository routeStopRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final DriverRepository driverRepository;

    private boolean isAdministrator(User user) {
        return user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR);
    }

    private Organization getUserOrganization(User user) {
        List<OrganizationMember> members = organizationMemberRepository.findByUserId(user.getId());
        if (members.isEmpty()) {
            String orgCode = "ORG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Organization org = Organization.builder()
                    .name(user.getFirstName() + "'s Organization")
                    .code(orgCode)
                    .status(OrganizationStatus.ACTIVE)
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .build();
            organizationRepository.save(org);

            OrganizationMember member = OrganizationMember.builder()
                    .organization(org)
                    .user(user)
                    .build();
            organizationMemberRepository.save(member);
            return org;
        }
        return members.get(0).getOrganization();
    }

    private UUID parseUuid(String str) {
        if (str == null || str.isBlank()) return null;
        try {
            return UUID.fromString(str);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public List<RouteDto> getAllRoutes(User user, RouteStatus status) {
        boolean isAdmin = isAdministrator(user);
        boolean isDriver = user.getRoles().stream().anyMatch(r -> r.getName() == com.shiptrackpro.backend.user.entity.RoleName.DRIVER);
        List<Route> routes = new java.util.ArrayList<>();

        if (isAdmin) {
            if (status != null) {
                routes = routeRepository.findAllByStatusOrderByCreatedAtDesc(status);
            } else {
                routes = routeRepository.findAllByOrderByCreatedAtDesc();
            }
        } else if (isDriver) {
            Optional<Driver> driverOpt = driverRepository.findByUserId(user.getId());
            if (driverOpt.isPresent()) {
                if (status != null) {
                    routes = routeRepository.findAllByDriverIdAndStatusIn(driverOpt.get().getId(), List.of(status));
                } else {
                    routes = routeRepository.findAllByDriverId(driverOpt.get().getId());
                }
            }
        } else {
            UUID orgId = getUserOrganization(user).getId();
            if (status != null) {
                routes = routeRepository.findAllByOrganizationIdAndStatusOrderByCreatedAtDesc(orgId, status);
            } else {
                routes = routeRepository.findAllByOrganizationIdOrderByCreatedAtDesc(orgId);
            }
        }

        return routes.stream().map(this::toRouteDto).collect(Collectors.toList());
    }

    public RouteDetailsDto getRouteDetails(UUID routeId, User user) {
        boolean isAdmin = isAdministrator(user);
        Route route;

        if (isAdmin) {
            route = routeRepository.findById(routeId)
                    .orElseThrow(() -> new IllegalArgumentException("Route not found: " + routeId));
        } else {
            UUID orgId = getUserOrganization(user).getId();
            route = routeRepository.findByIdAndOrganizationId(routeId, orgId)
                    .orElseThrow(() -> new IllegalArgumentException("Route not found: " + routeId));
        }

        List<RouteStop> stops = routeStopRepository.findAllByRouteIdOrderByStopOrderAsc(routeId);
        List<RouteStopDto> stopDtos = stops.stream()
                .map(this::toRouteStopDto)
                .collect(Collectors.toList());

        return RouteDetailsDto.builder()
                .id(route.getId())
                .name(route.getName())
                .organizationId(route.getOrganization().getId())
                .driverId(route.getDriverId() != null ? route.getDriverId().toString() : null)
                .status(route.getStatus())
                .totalDistanceKm(route.getTotalDistanceKm())
                .totalDurationMinutes(route.getTotalDurationMinutes())
                .plannedStart(route.getPlannedStart())
                .plannedEnd(route.getPlannedEnd())
                .actualStart(route.getActualStart())
                .actualEnd(route.getActualEnd())
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .stops(stopDtos)
                .build();
    }

    public List<RouteDetailsDto> getMyRoutes(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        boolean isAdmin = isAdministrator(user);

        List<RouteStatus> activeStatuses = List.of(
                RouteStatus.PLANNED,
                RouteStatus.ASSIGNED,
                RouteStatus.DISPATCHED,
                RouteStatus.IN_PROGRESS
        );

        List<Route> routes = new java.util.ArrayList<>();
        if (isAdmin) {
            routes = routeRepository.findAllByDriverIdAndStatusIn(user.getId(), activeStatuses);
            if (routes.isEmpty()) {
                routes = routeRepository.findAllByDriverId(user.getId());
            }
        } else {
            Optional<Driver> driverOpt = driverRepository.findByUserId(user.getId());
            if (driverOpt.isPresent()) {
                routes = routeRepository.findAllByDriverIdAndStatusIn(driverOpt.get().getId(), activeStatuses);
                if (routes.isEmpty()) {
                    routes = routeRepository.findAllByDriverId(driverOpt.get().getId());
                }
            }
        }


        return routes.stream().map(route -> {
            List<RouteStop> stops = routeStopRepository.findAllByRouteIdOrderByStopOrderAsc(route.getId());
            return RouteDetailsDto.builder()
                    .id(route.getId())
                    .name(route.getName())
                    .organizationId(route.getOrganization().getId())
                    .driverId(route.getDriverId() != null ? route.getDriverId().toString() : null)
                    .status(route.getStatus())
                    .totalDistanceKm(route.getTotalDistanceKm())
                    .totalDurationMinutes(route.getTotalDurationMinutes())
                    .plannedStart(route.getPlannedStart())
                    .plannedEnd(route.getPlannedEnd())
                    .actualStart(route.getActualStart())
                    .actualEnd(route.getActualEnd())
                    .createdAt(route.getCreatedAt())
                    .updatedAt(route.getUpdatedAt())
                    .stops(stops.stream().map(this::toRouteStopDto).collect(Collectors.toList()))
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public RouteDto createRoute(CreateRouteRequest request, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        boolean isAdmin = isAdministrator(user);
        Organization userOrg = getUserOrganization(user);

        if (request.getShipmentIds() == null || request.getShipmentIds().isEmpty()) {
            throw new IllegalArgumentException("At least one shipment is required to plan a route");
        }

        List<Shipment> shipments = new ArrayList<>();
        for (UUID shipmentId : request.getShipmentIds()) {
            Shipment shipment;
            if (isAdmin) {
                shipment = shipmentRepository.findById(shipmentId)
                        .orElseThrow(() -> new IllegalArgumentException("Shipment not found: " + shipmentId));
            } else {
                shipment = shipmentRepository.findByIdAndOrganizationId(shipmentId, userOrg.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Shipment not found or does not belong to your organization: " + shipmentId));
            }
            shipments.add(shipment);
        }

        // Determine route organization: if admin, use shipment's organization; else user's org
        Organization routeOrg = (isAdmin && !shipments.isEmpty() && shipments.get(0).getOrganization() != null)
                ? shipments.get(0).getOrganization()
                : userOrg;

        int stopCount = shipments.size();
        double estDistance = Math.round(stopCount * 15.5 * 10.0) / 10.0;
        int estDuration = stopCount * 25;

        UUID driverUuid = parseUuid(request.getDriverId());

        Route route = new Route();
        route.setName(request.getName());
        route.setOrganization(routeOrg);
        route.setDriverId(driverUuid);
        route.setStatus(driverUuid != null ? RouteStatus.ASSIGNED : RouteStatus.PLANNED);
        route.setTotalDistanceKm(estDistance);
        route.setTotalDurationMinutes(estDuration);
        route.setPlannedStart(request.getPlannedStart());
        route.setPlannedEnd(request.getPlannedEnd());

        Route savedRoute = routeRepository.save(route);

        int order = 1;
        for (Shipment shipment : shipments) {
            RouteStop stop = new RouteStop();
            stop.setRoute(savedRoute);
            stop.setShipment(shipment);
            stop.setStopOrder(order++);
            stop.setStatus(RouteStopStatus.PENDING);
            routeStopRepository.save(stop);

            shipment.setStatus(ShipmentStatus.READY_FOR_DISPATCH);
            shipmentRepository.save(shipment);
        }

        return toRouteDto(savedRoute);
    }

    @Transactional
    public RouteDto assignDriver(UUID routeId, AssignDriverRequest request, User user) {
        boolean isAdmin = isAdministrator(user);
        Route route = getRouteEntity(routeId, user, isAdmin);

        route.setDriverId(parseUuid(request.getDriverId()));
        route.setStatus(RouteStatus.ASSIGNED);
        Route saved = routeRepository.save(route);

        return toRouteDto(saved);
    }

    @Transactional
    public RouteDto dispatchRoute(UUID routeId, User user) {
        boolean isAdmin = isAdministrator(user);
        Route route = getRouteEntity(routeId, user, isAdmin);

        route.setStatus(RouteStatus.DISPATCHED);
        Route saved = routeRepository.save(route);

        return toRouteDto(saved);
    }

    @Transactional
    public RouteDto updateRouteStatus(UUID routeId, UpdateRouteStatusRequest request, User user) {
        boolean isAdmin = isAdministrator(user);
        Route route = getRouteEntity(routeId, user, isAdmin);

        route.setStatus(request.getStatus());
        if (request.getStatus() == RouteStatus.IN_PROGRESS && route.getActualStart() == null) {
            route.setActualStart(ZonedDateTime.now());
        } else if (request.getStatus() == RouteStatus.COMPLETED && route.getActualEnd() == null) {
            route.setActualEnd(ZonedDateTime.now());
        }

        Route saved = routeRepository.save(route);
        return toRouteDto(saved);
    }

    @Transactional
    public RouteStopDto updateStopStatus(UUID routeId, UUID stopId, UpdateStopStatusRequest request, User user) {
        boolean isAdmin = isAdministrator(user);
        Route route = getRouteEntity(routeId, user, isAdmin);

        RouteStop stop = routeStopRepository.findByRouteIdAndId(route.getId(), stopId)
                .orElseThrow(() -> new IllegalArgumentException("Route stop not found"));

        stop.setStatus(request.getStatus());
        if (request.getActualArrival() != null) {
            stop.setActualArrival(request.getActualArrival());
        } else if (request.getStatus() == RouteStopStatus.ARRIVED && stop.getActualArrival() == null) {
            stop.setActualArrival(ZonedDateTime.now());
        }

        if (request.getActualDeparture() != null) {
            stop.setActualDeparture(request.getActualDeparture());
        } else if (request.getStatus() == RouteStopStatus.COMPLETED && stop.getActualDeparture() == null) {
            stop.setActualDeparture(ZonedDateTime.now());
        }

        RouteStop savedStop = routeStopRepository.save(stop);
        return toRouteStopDto(savedStop);
    }

    @Transactional
    public RouteDetailsDto optimizeRoute(UUID routeId, OptimizeRouteRequest request, User user) {
        boolean isAdmin = isAdministrator(user);
        Route route = getRouteEntity(routeId, user, isAdmin);

        List<RouteStop> existingStops = routeStopRepository.findAllByRouteIdOrderByStopOrderAsc(routeId);
        if (request.getOptimizedStopSequence() != null && !request.getOptimizedStopSequence().isEmpty()) {
            Map<UUID, RouteStop> stopMap = existingStops.stream()
                    .collect(Collectors.toMap(RouteStop::getId, s -> s));

            int newOrder = 1;
            for (UUID stopId : request.getOptimizedStopSequence()) {
                RouteStop stop = stopMap.get(stopId);
                if (stop != null) {
                    stop.setStopOrder(newOrder++);
                    routeStopRepository.save(stop);
                }
            }
        }

        route.setTotalDistanceKm(Math.round(route.getTotalDistanceKm() * 0.8 * 10.0) / 10.0);
        route.setTotalDurationMinutes((int) Math.round(route.getTotalDurationMinutes() * 0.85));
        routeRepository.save(route);

        return getRouteDetails(routeId, user);
    }

    private Route getRouteEntity(UUID routeId, User user, boolean isAdmin) {
        if (isAdmin) {
            return routeRepository.findById(routeId)
                    .orElseThrow(() -> new IllegalArgumentException("Route not found: " + routeId));
        } else {
            UUID orgId = getUserOrganization(user).getId();
            return routeRepository.findByIdAndOrganizationId(routeId, orgId)
                    .orElseThrow(() -> new IllegalArgumentException("Route not found: " + routeId));
        }
    }

    private RouteDto toRouteDto(Route route) {
        int count = route.getStops() != null ? route.getStops().size() : 0;
        return RouteDto.builder()
                .id(route.getId())
                .name(route.getName())
                .organizationId(route.getOrganization().getId())
                .driverId(route.getDriverId() != null ? route.getDriverId().toString() : null)
                .status(route.getStatus())
                .totalDistanceKm(route.getTotalDistanceKm())
                .totalDurationMinutes(route.getTotalDurationMinutes())
                .plannedStart(route.getPlannedStart())
                .plannedEnd(route.getPlannedEnd())
                .actualStart(route.getActualStart())
                .actualEnd(route.getActualEnd())
                .stopsCount(count)
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }

    private RouteStopDto toRouteStopDto(RouteStop stop) {
        String trackingNumber = null;
        String recipientName = null;
        String destinationLabel = null;

        if (stop.getShipment() != null) {
            trackingNumber = stop.getShipment().getTrackingNumber();
            recipientName = stop.getShipment().getRecipientName();
            Address dest = stop.getShipment().getDestinationAddress();
            if (dest != null) {
                destinationLabel = String.format("%s, %s",
                        dest.getCity() != null ? dest.getCity() : "",
                        dest.getState() != null ? dest.getState() : "").trim().replaceAll("^,|,$", "");
            }
        }

        return RouteStopDto.builder()
                .id(stop.getId())
                .routeId(stop.getRoute().getId())
                .shipmentId(stop.getShipment() != null ? stop.getShipment().getId() : null)
                .trackingNumber(trackingNumber)
                .recipientName(recipientName)
                .destinationAddressLabel(destinationLabel)
                .stopOrder(stop.getStopOrder())
                .status(stop.getStatus())
                .plannedArrival(stop.getPlannedArrival())
                .actualArrival(stop.getActualArrival())
                .actualDeparture(stop.getActualDeparture())
                .createdAt(stop.getCreatedAt())
                .updatedAt(stop.getUpdatedAt())
                .build();
    }
}
