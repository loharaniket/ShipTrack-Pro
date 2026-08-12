package com.shiptrackpro.backend.analytics.controller;

import com.shiptrackpro.backend.analytics.dto.ChartDataDto;
import com.shiptrackpro.backend.analytics.dto.ExecutiveKpiDto;
import com.shiptrackpro.backend.analytics.dto.SystemHealthDto;
import com.shiptrackpro.backend.analytics.service.AnalyticsService;
import com.shiptrackpro.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/executive-kpis")
    public ResponseEntity<ApiResponse<ExecutiveKpiDto>> getExecutiveKpis() {
        return ResponseEntity.ok(ApiResponse.success("KPIs retrieved", analyticsService.getExecutiveKpis()));
    }

    @GetMapping("/charts/volume-trend")
    public ResponseEntity<ApiResponse<ChartDataDto>> getVolumeTrend() {
        return ResponseEntity.ok(ApiResponse.success("Volume trend retrieved", analyticsService.getVolumeTrend()));
    }

    @GetMapping("/charts/delay-distribution")
    public ResponseEntity<ApiResponse<ChartDataDto>> getDelayDistribution() {
        return ResponseEntity.ok(ApiResponse.success("Delay distribution retrieved", analyticsService.getDelayDistribution()));
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<byte[]> generateReport(@RequestParam(defaultValue = "pdf") String format) {
        byte[] report = analyticsService.generateReport(format);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(format.equalsIgnoreCase("pdf") ? MediaType.APPLICATION_PDF : MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "report." + format);
        return ResponseEntity.ok().headers(headers).body(report);
    }

    @GetMapping("/system-health")
    public ResponseEntity<ApiResponse<SystemHealthDto>> getSystemHealth() {
        return ResponseEntity.ok(ApiResponse.success("System health retrieved", analyticsService.getSystemHealth()));
    }
}
