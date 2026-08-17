package com.shiptrackpro.backend.support.service;

import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.support.dto.CreateTicketRequest;
import com.shiptrackpro.backend.support.dto.SupportTicketDto;
import com.shiptrackpro.backend.support.entity.SupportTicket;
import com.shiptrackpro.backend.support.repository.SupportTicketRepository;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private static final Set<String> VALID_STATUSES = Set.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");

    private final SupportTicketRepository supportTicketRepository;
    private final ShipmentRepository shipmentRepository;
    private final NotificationService notificationService;

    @Transactional
    public SupportTicketDto createTicket(CreateTicketRequest request, User customer) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Customer must be authenticated");
        }

        Shipment shipment = null;
        if (request.getShipmentId() != null) {
            shipment = shipmentRepository.findById(request.getShipmentId()).orElse(null);
        }

        SupportTicket ticket = SupportTicket.builder()
                .customer(customer)
                .shipment(shipment)
                .subject(request.getSubject().trim())
                .description(request.getDescription().trim())
                .status("OPEN")
                .build();

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        // Notify customer of ticket creation
        notificationService.createNotification(
                customer,
                "Support Ticket Created",
                "Your support ticket #" + savedTicket.getId().toString().substring(0, 8) + " has been submitted successfully.",
                "TICKET_CREATED"
        );

        return mapToDto(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getMyTickets(User customer) {
        return supportTicketRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupportTicketDto> getAllTickets(String status) {
        if (status != null && !status.isBlank()) {
            return supportTicketRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase())
                    .stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }
        return supportTicketRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupportTicketDto getTicketDetails(UUID id, User user) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found"));

        boolean isAdminOrSupport = user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ADMINISTRATOR || r.getName() == RoleName.SUPPORT_AGENT);

        boolean isCustomerOwner = ticket.getCustomer().getId().equals(user.getId());

        if (!isAdminOrSupport && !isCustomerOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this support ticket");
        }

        return mapToDto(ticket);
    }

    @Transactional
    public SupportTicketDto updateTicketStatus(UUID id, String status, User user) {
        if (status == null || !VALID_STATUSES.contains(status.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status. Allowed values: " + VALID_STATUSES);
        }

        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found"));

        String normalizedStatus = status.toUpperCase();
        ticket.setStatus(normalizedStatus);
        SupportTicket updatedTicket = supportTicketRepository.save(ticket);

        // Notify customer of status change
        if (updatedTicket.getCustomer() != null) {
            notificationService.createNotification(
                    updatedTicket.getCustomer(),
                    "Ticket Status Updated",
                    "Your ticket #" + updatedTicket.getId().toString().substring(0, 8) + " status is now " + normalizedStatus + ".",
                    "TICKET_UPDATED"
            );
        }

        return mapToDto(updatedTicket);
    }

    public SupportTicketDto mapToDto(SupportTicket ticket) {
        return SupportTicketDto.builder()
                .id(ticket.getId())
                .customerId(ticket.getCustomer() != null ? ticket.getCustomer().getId() : null)
                .customerName(ticket.getCustomer() != null ? 
                        ticket.getCustomer().getFirstName() + " " + ticket.getCustomer().getLastName() : "Unknown")
                .customerEmail(ticket.getCustomer() != null ? ticket.getCustomer().getEmail() : null)
                .shipmentId(ticket.getShipment() != null ? ticket.getShipment().getId() : null)
                .trackingNumber(ticket.getShipment() != null ? ticket.getShipment().getTrackingNumber() : null)
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
