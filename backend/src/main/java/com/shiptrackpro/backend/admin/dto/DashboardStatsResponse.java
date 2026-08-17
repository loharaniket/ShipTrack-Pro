package com.shiptrackpro.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalShipments;
    private long pendingDispatch;
    private long inTransit;
    private long delivered;
    private long openComplaints;
    private long activeDrivers;
}
