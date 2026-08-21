package com.shiptrackpro.backend.tracking.service;

import com.shiptrackpro.backend.address.service.AddressService;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.dto.PublicTrackingResponse;
import com.shiptrackpro.backend.tracking.dto.PublicTrackingTimelineDto;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final AddressService addressService;

    @Transactional(readOnly = true)
    public PublicTrackingResponse getPublicTrackingTimeline(String trackingNumber) {
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found with tracking number: " + trackingNumber));

        List<ShipmentTracking> events = shipmentTrackingRepository.findByShipmentIdOrderByCreatedAtAsc(shipment.getId());

        List<PublicTrackingTimelineDto> timeline = events.stream()
                .map(e -> PublicTrackingTimelineDto.builder()
                        .status(e.getStatus())
                        .description(e.getDescription())
                        .createdAt(e.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        BigDecimal originLat = shipment.getOriginAddress() != null ? shipment.getOriginAddress().getLatitude() : null;
        BigDecimal originLng = shipment.getOriginAddress() != null ? shipment.getOriginAddress().getLongitude() : null;
        BigDecimal destLat = shipment.getDestinationAddress() != null ? shipment.getDestinationAddress().getLatitude() : null;
        BigDecimal destLng = shipment.getDestinationAddress() != null ? shipment.getDestinationAddress().getLongitude() : null;

        return PublicTrackingResponse.builder()
                .trackingNumber(shipment.getTrackingNumber())
                .currentStatus(shipment.getStatus())
                .pickupAddress(shipment.getPickupAddress())
                .deliveryAddress(shipment.getDeliveryAddress())
                .originAddress(shipment.getOriginAddress() != null ? addressService.toDto(shipment.getOriginAddress()) : null)
                .destinationAddress(shipment.getDestinationAddress() != null ? addressService.toDto(shipment.getDestinationAddress()) : null)
                .originLatitude(originLat)
                .originLongitude(originLng)
                .destLatitude(destLat)
                .destLongitude(destLng)
                .timeline(timeline)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ShipmentTracking> getTrackingHistory(String trackingNumber) {
        return shipmentTrackingRepository.findByShipmentTrackingNumberOrderByCreatedAtAsc(trackingNumber);
    }

    @Transactional(readOnly = true)
    public List<ShipmentTracking> getTrackingHistoryByShipmentId(UUID shipmentId) {
        return shipmentTrackingRepository.findByShipmentIdOrderByCreatedAtAsc(shipmentId);
    }

    @Transactional
    public ShipmentTracking addTrackingEvent(Shipment shipment, String description, String updatedBy) {
        ShipmentTracking tracking = ShipmentTracking.builder()
                .shipment(shipment)
                .status(shipment.getStatus())
                .description(description)
                .updatedBy(updatedBy)
                .build();
        return shipmentTrackingRepository.save(tracking);
    }
}
