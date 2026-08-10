package com.shiptrackpro.backend.route.service;

import com.shiptrackpro.backend.delivery.entity.Driver;
import com.shiptrackpro.backend.delivery.repository.DriverRepository;
import com.shiptrackpro.backend.route.dto.*;
import com.shiptrackpro.backend.route.entity.Route;
import com.shiptrackpro.backend.route.entity.RouteStatus;
import com.shiptrackpro.backend.route.entity.RouteStop;
import com.shiptrackpro.backend.route.entity.RouteStopStatus;
import com.shiptrackpro.backend.route.repository.RouteRepository;
import com.shiptrackpro.backend.route.repository.RouteStopRepository;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.user.entity.AppUser;
import com.shiptrackpro.backend.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;
    private final RouteStopRepository routeStopRepository;
    private final DriverRepository driverRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;

    public List<RouteDto> getAllRoutes(RouteStatus status) {
        List<Route> routes;
        if (status != null) {
            routes = routeRepository.findAllByStatus(status);
        } else {
            routes = routeRepository.findAll();
        }
        return routes.stream().map(this::toRouteDto).collect(Collectors.toList());
    }

    public List<RouteDto> getMyRoutes(Authentication auth) {
        AppUser user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Driver profile not found"));
                
        List<Route> routes = routeRepository.findAllByDriverId(driver.getId());
        
        return routes.stream().map(this::toRouteDto).collect(Collectors.toList());
    }

    @Transactional
    public RouteDto createRoute(CreateRouteRequest request) {
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        Route route = new Route();
        route.setDriver(driver);
        route.setStatus(RouteStatus.PLANNED);
        route.setTotalDistanceKm(0.0); 

        Route savedRoute = routeRepository.save(route);

        int stopOrder = 1;
        for (UUID shipmentId : request.getShipmentIds()) {
            Shipment shipment = shipmentRepository.findById(shipmentId)
                    .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
                    
            RouteStop stop = new RouteStop();
            stop.setRoute(savedRoute);
            stop.setShipment(shipment);
            stop.setStopOrder(stopOrder++);
            stop.setStatus(RouteStopStatus.PENDING);
            
            routeStopRepository.save(stop);
        }

        return toRouteDto(savedRoute);
    }

    public RouteDetailsDto getRouteDetails(UUID routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
                
        List<RouteStop> stops = routeStopRepository.findAllByRouteIdOrderByStopOrderAsc(routeId);
        
        List<RouteStopDto> stopDtos = stops.stream()
                .map(this::toRouteStopDto)
                .collect(Collectors.toList());
                
        return RouteDetailsDto.builder()
                .id(route.getId())
                .driverId(route.getDriver().getId())
                .totalDistanceKm(route.getTotalDistanceKm())
                .status(route.getStatus())
                .startTime(route.getStartTime())
                .endTime(route.getEndTime())
                .stops(stopDtos)
                .build();
    }

    public RouteDto updateRouteStatus(UUID routeId, UpdateRouteStatusRequest request) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
                
        route.setStatus(request.getStatus());
        Route savedRoute = routeRepository.save(route);
        
        return toRouteDto(savedRoute);
    }

    public RouteStopDto addStopToRoute(UUID routeId, AddRouteStopRequest request) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
                
        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new IllegalArgumentException("Shipment not found"));
                
        RouteStop stop = new RouteStop();
        stop.setRoute(route);
        stop.setShipment(shipment);
        stop.setStopOrder(request.getStopOrder());
        stop.setStatus(RouteStopStatus.PENDING);
        
        RouteStop savedStop = routeStopRepository.save(stop);
        
        return toRouteStopDto(savedStop);
    }

    public RouteStopDto updateStopStatus(UUID routeId, UUID stopId, UpdateStopStatusRequest request) {
        RouteStop stop = routeStopRepository.findById(stopId)
                .orElseThrow(() -> new IllegalArgumentException("Route stop not found"));
                
        if (!stop.getRoute().getId().equals(routeId)) {
            throw new IllegalArgumentException("Stop does not belong to this route");
        }
        
        stop.setStatus(request.getStatus());
        if (request.getActualArrival() != null) {
            stop.setActualArrival(request.getActualArrival());
        }
        
        RouteStop savedStop = routeStopRepository.save(stop);
        
        return toRouteStopDto(savedStop);
    }

    private RouteDto toRouteDto(Route route) {
        return RouteDto.builder()
                .id(route.getId())
                .driverId(route.getDriver().getId())
                .totalDistanceKm(route.getTotalDistanceKm())
                .status(route.getStatus())
                .startTime(route.getStartTime())
                .endTime(route.getEndTime())
                .build();
    }
    
    private RouteStopDto toRouteStopDto(RouteStop stop) {
        return RouteStopDto.builder()
                .id(stop.getId())
                .routeId(stop.getRoute().getId())
                .shipmentId(stop.getShipment().getId())
                .stopOrder(stop.getStopOrder())
                .estimatedArrival(stop.getEstimatedArrival())
                .actualArrival(stop.getActualArrival())
                .status(stop.getStatus())
                .build();
    }
}
