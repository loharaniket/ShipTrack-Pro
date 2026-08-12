package com.shiptrackpro.backend.intelligence.controller;

import com.shiptrackpro.backend.common.response.ApiResponse;
import com.shiptrackpro.backend.intelligence.dto.AtRiskShipmentDto;
import com.shiptrackpro.backend.intelligence.dto.EtaKpiDto;
import com.shiptrackpro.backend.intelligence.dto.EtaPredictionDto;
import com.shiptrackpro.backend.intelligence.service.IntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/intelligence")
@RequiredArgsConstructor
public class IntelligenceController {

    private final IntelligenceService intelligenceService;

    @GetMapping("/eta/calculate/{shipmentId}")
    public ResponseEntity<ApiResponse<EtaPredictionDto>> calculateEta(@PathVariable UUID shipmentId) {
        EtaPredictionDto prediction = intelligenceService.calculateEta(shipmentId);
        return ResponseEntity.ok(ApiResponse.success("ETA calculated successfully", prediction));
    }

    @GetMapping("/eta/at-risk")
    public ResponseEntity<ApiResponse<List<AtRiskShipmentDto>>> getAtRiskShipments() {
        List<AtRiskShipmentDto> risks = intelligenceService.getAtRiskShipments();
        return ResponseEntity.ok(ApiResponse.success("At-risk shipments retrieved", risks));
    }

    @GetMapping("/eta/kpis")
    public ResponseEntity<ApiResponse<EtaKpiDto>> getKpis() {
        EtaKpiDto kpis = intelligenceService.getKpis();
        return ResponseEntity.ok(ApiResponse.success("ETA KPIs retrieved", kpis));
    }
}
