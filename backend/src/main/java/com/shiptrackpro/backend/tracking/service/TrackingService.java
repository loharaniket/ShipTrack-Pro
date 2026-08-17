package com.shiptrackpro.backend.tracking.service;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.shiptrackpro.backend.tracking.dto.PublicTrackingResponse;
import com.shiptrackpro.backend.tracking.dto.PublicTrackingTimelineDto;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final ShipmentRepository shipmentRepository;
    private final ShipmentTrackingRepository shipmentTrackingRepository;

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

        return PublicTrackingResponse.builder()
                .trackingNumber(shipment.getTrackingNumber())
                .currentStatus(shipment.getStatus())
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
