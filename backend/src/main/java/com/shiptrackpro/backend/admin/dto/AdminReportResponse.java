package com.shiptrackpro.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportResponse {
    private long totalShipments;
    private Map<String, Long> statusBreakdown;
    private long totalDeliveriesCompleted;
    private long totalSupportTickets;
    private Map<String, Long> ticketStatusBreakdown;
    private long totalDrivers;
    private long totalCustomers;
}
