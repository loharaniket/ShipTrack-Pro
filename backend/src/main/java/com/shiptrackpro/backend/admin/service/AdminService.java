package com.shiptrackpro.backend.admin.service;

import com.shiptrackpro.backend.admin.dto.AdminReportResponse;
import com.shiptrackpro.backend.admin.dto.DashboardStatsResponse;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.support.entity.SupportTicket;
import com.shiptrackpro.backend.support.repository.SupportTicketRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ShipmentRepository shipmentRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        List<Shipment> shipments = shipmentRepository.findAll();
        List<SupportTicket> tickets = supportTicketRepository.findAll();
        List<User> users = userRepository.findAll();

        long totalShipments = shipments.size();

        long pendingDispatch = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.CREATED)
                .count();

        long inTransit = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.PICKED_UP ||
                             s.getStatus() == ShipmentStatus.IN_TRANSIT ||
                             s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY)
                .count();

        long delivered = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
                .count();

        long openComplaints = tickets.stream()
                .filter(t -> "OPEN".equalsIgnoreCase(t.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
                .count();

        long activeDrivers = users.stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE &&
                             u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.DRIVER))
                .count();

        return DashboardStatsResponse.builder()
                .totalShipments(totalShipments)
                .pendingDispatch(pendingDispatch)
                .inTransit(inTransit)
                .delivered(delivered)
                .openComplaints(openComplaints)
                .activeDrivers(activeDrivers)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse getAdminReports() {
        List<Shipment> shipments = shipmentRepository.findAll();
        List<SupportTicket> tickets = supportTicketRepository.findAll();
        List<User> users = userRepository.findAll();

        Map<String, Long> statusBreakdown = new HashMap<>();
        for (ShipmentStatus status : ShipmentStatus.values()) {
            long count = shipments.stream().filter(s -> s.getStatus() == status).count();
            statusBreakdown.put(status.name(), count);
        }

        Map<String, Long> ticketStatusBreakdown = tickets.stream()
                .collect(Collectors.groupingBy(SupportTicket::getStatus, Collectors.counting()));

        long deliveredCount = shipments.stream()
                .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
                .count();

        long driversCount = users.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.DRIVER))
                .count();

        long customersCount = users.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == RoleName.CUSTOMER))
                .count();

        return AdminReportResponse.builder()
                .totalShipments(shipments.size())
                .statusBreakdown(statusBreakdown)
                .totalDeliveriesCompleted(deliveredCount)
                .totalSupportTickets(tickets.size())
                .ticketStatusBreakdown(ticketStatusBreakdown)
                .totalDrivers(driversCount)
                .totalCustomers(customersCount)
                .build();
    }
}
