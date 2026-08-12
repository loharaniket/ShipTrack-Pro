package com.shiptrackpro.backend.analytics.service;

import com.shiptrackpro.backend.analytics.dto.ChartDataDto;
import com.shiptrackpro.backend.analytics.dto.ExecutiveKpiDto;
import com.shiptrackpro.backend.analytics.dto.SystemHealthDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    public ExecutiveKpiDto getExecutiveKpis() {
        ExecutiveKpiDto dto = new ExecutiveKpiDto();
        dto.setTotalShipments(1524);
        dto.setActiveShipments(342);
        dto.setRevenue(125000.50);
        dto.setOnTimeDeliveryRate(94.5);
        return dto;
    }

    public ChartDataDto getVolumeTrend() {
        ChartDataDto dto = new ChartDataDto();
        dto.setLabels(List.of("Jan", "Feb", "Mar", "Apr", "May"));
        dto.setData(List.of(120.0, 150.0, 180.0, 170.0, 210.0));
        return dto;
    }

    public ChartDataDto getDelayDistribution() {
        ChartDataDto dto = new ChartDataDto();
        dto.setLabels(List.of("Weather", "Traffic", "Vehicle Issue", "Customer Not Available"));
        dto.setData(List.of(40.0, 30.0, 10.0, 20.0));
        return dto;
    }

    public byte[] generateReport(String type) {
        // Return dummy bytes representing a PDF or Excel
        return ("Dummy Report Data for " + type).getBytes();
    }

    public SystemHealthDto getSystemHealth() {
        SystemHealthDto dto = new SystemHealthDto();
        dto.setStatus("UP");
        dto.setServicesStatus(Map.of(
                "Database", "UP",
                "Redis", "UP",
                "Email Service", "UP"
        ));
        return dto;
    }
}
