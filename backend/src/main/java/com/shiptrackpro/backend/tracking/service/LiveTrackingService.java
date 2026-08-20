package com.shiptrackpro.backend.tracking.service;

import com.shiptrackpro.backend.delivery.entity.DeliveryAssignment;
import com.shiptrackpro.backend.delivery.repository.DeliveryAssignmentRepository;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.dto.ActiveDriverTrackingDto;
import com.shiptrackpro.backend.tracking.dto.DriverLocationDto;
import com.shiptrackpro.backend.tracking.dto.StartTrackingRequest;
import com.shiptrackpro.backend.tracking.dto.UpdateLocationRequest;
import com.shiptrackpro.backend.tracking.entity.DriverLocation;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.entity.TrackingConnectionStatus;
import com.shiptrackpro.backend.tracking.entity.TrackingStatus;
import com.shiptrackpro.backend.tracking.repository.DriverLocationRepository;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveTrackingService {

    private final DriverLocationRepository driverLocationRepository;
    private final ShipmentRepository shipmentRepository;
    private final DeliveryAssignmentRepository deliveryAssignmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public DriverLocationDto startTracking(StartTrackingRequest request, User driver) {
        UUID shipmentId = request.getShipmentId();

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        // Validate driver assignment
        DeliveryAssignment assignment = deliveryAssignmentRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shipment is not assigned to any driver"));

        if (!assignment.getDriver().getId().equals(driver.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to deliver this shipment");
        }

        // Rule: One driver can have only ONE active OUT_FOR_DELIVERY shipment at a time
        Optional<DriverLocation> existingActive = driverLocationRepository.findByDriverIdAndStatus(driver.getId(), TrackingStatus.ACTIVE);
        if (existingActive.isPresent()) {
            if (!existingActive.get().getShipment().getId().equals(shipmentId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Driver already has an active delivery session.");
            } else {
                DriverLocationDto activeDto = mapToDto(existingActive.get());
                broadcastLocation(activeDto);
                return activeDto;
            }
        }

        // Advance shipment status to OUT_FOR_DELIVERY if not already
        if (shipment.getStatus() != ShipmentStatus.OUT_FOR_DELIVERY && shipment.getStatus() != ShipmentStatus.DELIVERED) {
            shipment.setStatus(ShipmentStatus.OUT_FOR_DELIVERY);
            shipmentRepository.save(shipment);

            String driverFullName = driver.getFirstName() + " " + driver.getLastName();
            ShipmentTracking tracking = ShipmentTracking.builder()
                    .shipment(shipment)
                    .status(ShipmentStatus.OUT_FOR_DELIVERY)
                    .description("Package is out for delivery with driver " + driverFullName)
                    .updatedBy(driverFullName)
                    .build();
            shipmentTrackingRepository.save(tracking);

            if (shipment.getCustomer() != null) {
                notificationService.createNotification(
                        shipment.getCustomer(),
                        "Out for Delivery",
                        "Your shipment " + shipment.getTrackingNumber() + " is now out for delivery with " + driverFullName + ".",
                        "SHIPMENT_OUT_FOR_DELIVERY"
                );
            }
        }

        DriverLocation location = DriverLocation.builder()
                .driver(driver)
                .shipment(shipment)
                .connectionStatus(TrackingConnectionStatus.CONNECTED)
                .status(TrackingStatus.ACTIVE)
                .startedAt(ZonedDateTime.now())
                .lastPingAt(ZonedDateTime.now())
                .build();

        DriverLocation saved = driverLocationRepository.save(location);
        DriverLocationDto dto = mapToDto(saved);
        broadcastLocation(dto);
        return dto;
    }

    @Transactional
    public DriverLocationDto updateLocation(UpdateLocationRequest request, User driver) {
        UUID shipmentId = request.getShipmentId();

        DriverLocation location = driverLocationRepository.findByShipmentIdAndStatus(shipmentId, TrackingStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active tracking session found for this shipment"));

        if (!location.getDriver().getId().equals(driver.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update location for this shipment");
        }

        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAccuracy(request.getAccuracy());
        location.setConnectionStatus(TrackingConnectionStatus.CONNECTED);
        location.setLastPingAt(ZonedDateTime.now());

        DriverLocation updated = driverLocationRepository.save(location);
        DriverLocationDto dto = mapToDto(updated);
        broadcastLocation(dto);
        return dto;
    }

    @Transactional
    public DriverLocationDto stopTracking(UUID shipmentId, String endedReason, User user) {
        Optional<DriverLocation> activeOpt = driverLocationRepository.findByShipmentIdAndStatus(shipmentId, TrackingStatus.ACTIVE);
        if (activeOpt.isEmpty()) {
            return driverLocationRepository.findFirstByShipmentIdOrderByStartedAtDesc(shipmentId)
                    .map(this::mapToDto)
                    .orElse(null);
        }

        DriverLocation location = activeOpt.get();

        boolean isAdminOrSupport = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR || r.getName() == RoleName.SUPPORT_AGENT);

        boolean isAssignedDriver = location.getDriver().getId().equals(user.getId());

        if (!isAdminOrSupport && !isAssignedDriver) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to stop tracking for this shipment");
        }

        location.setStatus(TrackingStatus.COMPLETED);
        location.setEndedAt(ZonedDateTime.now());
        location.setEndedReason((endedReason != null && !endedReason.isBlank()) ? endedReason : "DELIVERED");

        DriverLocation saved = driverLocationRepository.save(location);
        DriverLocationDto dto = mapToDto(saved);
        broadcastLocation(dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public DriverLocationDto getShipmentLiveLocation(UUID shipmentId, User user) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));

        // Access Control: Admin, Support, Assigned Driver, or Customer/Client owner
        boolean isAdminOrSupport = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR || r.getName() == RoleName.SUPPORT_AGENT);

        boolean isAssignedDriver = deliveryAssignmentRepository.findByShipmentId(shipmentId)
                .map(a -> a.getDriver().getId().equals(user.getId()))
                .orElse(false);

        boolean isCustomerOwner = shipment.getCustomer() != null && shipment.getCustomer().getId().equals(user.getId());

        if (!isAdminOrSupport && !isAssignedDriver && !isCustomerOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this shipment's live tracking");
        }

        DriverLocation location = driverLocationRepository.findByShipmentIdAndStatus(shipmentId, TrackingStatus.ACTIVE)
                .or(() -> driverLocationRepository.findFirstByShipmentIdOrderByStartedAtDesc(shipmentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No live location data available for this shipment"));

        return mapToDto(location);
    }

    @Transactional(readOnly = true)
    public List<ActiveDriverTrackingDto> getActiveDrivers() {
        return driverLocationRepository.findAllActiveWithDriverAndShipment(TrackingStatus.ACTIVE)
                .stream()
                .map(dl -> ActiveDriverTrackingDto.builder()
                        .trackingId(dl.getId())
                        .driverId(dl.getDriver().getId())
                        .driverName(dl.getDriver().getFirstName() + " " + dl.getDriver().getLastName())
                        .driverEmail(dl.getDriver().getEmail())
                        .driverPhone(dl.getDriver().getPhone())
                        .shipmentId(dl.getShipment().getId())
                        .trackingNumber(dl.getShipment().getTrackingNumber())
                        .receiverName(dl.getShipment().getReceiverName())
                        .deliveryAddress(dl.getShipment().getDeliveryAddress())
                        .latitude(dl.getLatitude())
                        .longitude(dl.getLongitude())
                        .accuracy(dl.getAccuracy())
                        .connectionStatus(dl.getConnectionStatus())
                        .status(dl.getStatus())
                        .startedAt(dl.getStartedAt())
                        .lastPingAt(dl.getLastPingAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateConnectionStatus(UUID shipmentId, TrackingConnectionStatus connectionStatus) {
        driverLocationRepository.findByShipmentIdAndStatus(shipmentId, TrackingStatus.ACTIVE)
                .ifPresent(location -> {
                    location.setConnectionStatus(connectionStatus);
                    DriverLocation updated = driverLocationRepository.save(location);
                    broadcastLocation(mapToDto(updated));
                });
    }

    public void broadcastLocation(DriverLocationDto dto) {
        if (dto == null || messagingTemplate == null) return;
        try {
            messagingTemplate.convertAndSend("/topic/shipment/" + dto.getShipmentId(), dto);
            messagingTemplate.convertAndSend("/topic/tracking/" + dto.getShipmentId(), dto);
            messagingTemplate.convertAndSend("/topic/admin/active-drivers", getActiveDrivers());
        } catch (Exception e) {
            log.warn("Failed to broadcast live location update: {}", e.getMessage());
        }
    }

    public DriverLocationDto mapToDto(DriverLocation location) {
        if (location == null) return null;
        return DriverLocationDto.builder()
                .id(location.getId())
                .shipmentId(location.getShipment().getId())
                .trackingNumber(location.getShipment().getTrackingNumber())
                .driverId(location.getDriver().getId())
                .driverName(location.getDriver().getFirstName() + " " + location.getDriver().getLastName())
                .driverPhone(location.getDriver().getPhone())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .accuracy(location.getAccuracy())
                .connectionStatus(location.getConnectionStatus())
                .status(location.getStatus())
                .shipmentStatus(location.getShipment().getStatus())
                .startedAt(location.getStartedAt())
                .endedAt(location.getEndedAt())
                .endedReason(location.getEndedReason())
                .lastPingAt(location.getLastPingAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}
