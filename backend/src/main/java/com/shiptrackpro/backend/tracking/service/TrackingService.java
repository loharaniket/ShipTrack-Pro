package com.shiptrackpro.backend.tracking.service;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.dto.*;
import com.shiptrackpro.backend.tracking.entity.ShipmentTrackingEvent;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingEventRepository;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingEventRepository trackingEventRepository;
    private final UserRepository userRepository;

    public TrackingTimelineDto getTrackingTimeline(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new IllegalArgumentException("Invalid tracking number"));

        List<ShipmentTrackingEvent> events = trackingEventRepository
                .findAllByShipmentIdOrderByCreatedAtDesc(shipment.getId());

        List<TrackingEventDto> eventDtos = events.stream()
                .map(this::toEventDto)
                .collect(Collectors.toList());

        return TrackingTimelineDto.builder()
                .trackingNumber(shipment.getTrackingNumber())
                .currentStatus(shipment.getStatus())
                .estimatedDelivery(shipment.getEstimatedDeliveryTime())
                .events(eventDtos)
                .build();
    }

    public TrackingEventDto addTrackingEvent(String trackingNumber, CreateTrackingEventRequest request, Authentication auth) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new IllegalArgumentException("Invalid tracking number"));

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ShipmentTrackingEvent event = new ShipmentTrackingEvent();
        event.setShipment(shipment);
        event.setStatus(request.getStatus());
        event.setEventType(request.getEventType());
        event.setDescription(request.getDescription());
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        event.setLocationName(request.getLocationName());
        event.setCreatedBy(user);

        ShipmentTrackingEvent savedEvent = trackingEventRepository.save(event);

        // update shipment status same as tracking status
        if (shipment.getStatus() != request.getStatus()) {
            shipment.setStatus(request.getStatus());
            if (request.getStatus().name().equals("DELIVERED")) {
                shipment.setActualDeliveryDate(ZonedDateTime.now());
            }
            shipmentRepository.save(shipment);
        }

        return toEventDto(savedEvent);
    }

    public LocationDto getLatestLocation(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new IllegalArgumentException("Invalid tracking number"));

        ShipmentTrackingEvent latestLocationEvent = trackingEventRepository
                .findFirstByShipmentIdAndLatitudeIsNotNullAndLongitudeIsNotNullOrderByCreatedAtDesc(shipment.getId())
                .orElseThrow(() -> new IllegalArgumentException("Location not available for this shipment"));

        return LocationDto.builder()
                .latitude(latestLocationEvent.getLatitude())
                .longitude(latestLocationEvent.getLongitude())
                .locationName(latestLocationEvent.getLocationName())
                .build();
    }

    private TrackingEventDto toEventDto(ShipmentTrackingEvent event) {
        return TrackingEventDto.builder()
                .id(event.getId())
                .status(event.getStatus())
                .eventType(event.getEventType())
                .description(event.getDescription())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .locationName(event.getLocationName())
                .createdByName(event.getCreatedBy() != null ? event.getCreatedBy().getFirstName() : "System")
                .createdAt(event.getCreatedAt())
                .build();
    }
}
