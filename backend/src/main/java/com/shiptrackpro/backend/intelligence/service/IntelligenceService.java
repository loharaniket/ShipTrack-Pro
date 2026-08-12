package com.shiptrackpro.backend.intelligence.service;

import com.shiptrackpro.backend.intelligence.dto.AtRiskShipmentDto;
import com.shiptrackpro.backend.intelligence.dto.EtaKpiDto;
import com.shiptrackpro.backend.intelligence.dto.EtaPredictionDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IntelligenceService {

    private final ShipmentRepository shipmentRepository;

    public EtaPredictionDto calculateEta(UUID shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        EtaPredictionDto dto = new EtaPredictionDto();
        dto.setShipmentId(shipmentId);
        dto.setOriginalEta(shipment.getEstimatedDeliveryTime());
        
        // Mock prediction logic
        dto.setPredictedEta(shipment.getEstimatedDeliveryTime() != null 
                ? shipment.getEstimatedDeliveryTime().plusHours(2) 
                : ZonedDateTime.now().plusDays(2));
        dto.setConfidenceLevel("HIGH");
        dto.setReasonForChange("Traffic delay on route");
        
        return dto;
    }

    public List<AtRiskShipmentDto> getAtRiskShipments() {
        // Mock data
        AtRiskShipmentDto dto = new AtRiskShipmentDto();
        dto.setShipmentId(UUID.randomUUID());
        dto.setTrackingNumber("TRK-AT-RISK-1");
        dto.setRiskLevel("HIGH");
        dto.setRiskFactor("Weather Delay");
        dto.setDelayedByMinutes(120);

        return List.of(dto);
    }

    public EtaKpiDto getKpis() {
        EtaKpiDto dto = new EtaKpiDto();
        dto.setOnTimeDeliveryRate(94.2);
        dto.setTotalDelayedShipments(15);
        dto.setAverageDelayMinutes(45.5);
        return dto;
    }
}
