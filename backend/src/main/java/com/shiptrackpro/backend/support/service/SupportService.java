package com.shiptrackpro.backend.support.service;

import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.support.entity.SupportTicket;
import com.shiptrackpro.backend.support.repository.SupportTicketRepository;
import com.shiptrackpro.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository supportTicketRepository;
    private final ShipmentRepository shipmentRepository;

    @Transactional
    public SupportTicket createTicket(UUID shipmentId, String subject, String description, User customer) {
        Shipment shipment = null;
        if (shipmentId != null) {
            shipment = shipmentRepository.findById(shipmentId).orElse(null);
        }

        SupportTicket ticket = SupportTicket.builder()
                .customer(customer)
                .shipment(shipment)
                .subject(subject)
                .description(description)
                .status("OPEN")
                .build();

        return supportTicketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets(String status) {
        if (status != null && !status.isBlank()) {
            return supportTicketRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        }
        return supportTicketRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SupportTicket getTicketById(UUID id) {
        return supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found"));
    }

    @Transactional
    public SupportTicket updateTicketStatus(UUID id, String status) {
        SupportTicket ticket = getTicketById(id);
        ticket.setStatus(status.toUpperCase());
        return supportTicketRepository.save(ticket);
    }
}
