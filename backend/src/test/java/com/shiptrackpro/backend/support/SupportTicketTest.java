package com.shiptrackpro.backend.support;

import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.support.dto.CreateTicketRequest;
import com.shiptrackpro.backend.support.dto.SupportTicketDto;
import com.shiptrackpro.backend.support.service.SupportService;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
public class SupportTicketTest {

    @Autowired
    private SupportService supportService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private User createUserWithRole(String emailPrefix, RoleName roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(roleName + " role not found"));

        User user = User.builder()
                .email(emailPrefix + "." + UUID.randomUUID() + "@test.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .firstName("Test")
                .lastName(roleName.name())
                .status(UserStatus.ACTIVE)
                .roles(Set.of(role))
                .build();

        User saved = userRepository.save(user);
        entityManager.flush();
        return saved;
    }

    private CreateShipmentRequest validShipmentRequest() {
        return CreateShipmentRequest.builder()
                .senderName("Sender Support Test")
                .senderPhone("9876543210")
                .receiverName("Receiver Support Test")
                .receiverPhone("9876543211")
                .pickupAddress("Baner, Pune")
                .deliveryAddress("Vashi, Navi Mumbai")
                .packageDescription("Medical equipment")
                .weight(1.5)
                .build();
    }

    @Test
    public void testCreateTicket_Success() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        CreateShipmentResponse shipment = shipmentService.createShipment(validShipmentRequest(), customer);

        CreateTicketRequest request = CreateTicketRequest.builder()
                .shipmentId(shipment.getId())
                .subject("Delivery Delay Inquiry")
                .description("My shipment was expected yesterday, please advise on ETA.")
                .build();

        SupportTicketDto ticket = supportService.createTicket(request, customer);
        entityManager.flush();

        assertThat(ticket).isNotNull();
        assertThat(ticket.getId()).isNotNull();
        assertThat(ticket.getCustomerId()).isEqualTo(customer.getId());
        assertThat(ticket.getShipmentId()).isEqualTo(shipment.getId());
        assertThat(ticket.getTrackingNumber()).isEqualTo(shipment.getTrackingNumber());
        assertThat(ticket.getSubject()).isEqualTo("Delivery Delay Inquiry");
        assertThat(ticket.getStatus()).isEqualTo("OPEN");

        // Verify customer notification
        List<Notification> notifications = notificationRepository.findByUserId(customer.getId());
        assertThat(notifications).anyMatch(n -> n.getType().equals("TICKET_CREATED"));
    }

    @Test
    public void testGetMyTickets_CustomerIsolation() {
        User customerA = createUserWithRole("custA", RoleName.CUSTOMER);
        User customerB = createUserWithRole("custB", RoleName.CUSTOMER);

        CreateTicketRequest req1 = CreateTicketRequest.builder().subject("Issue 1").description("Desc 1").build();
        CreateTicketRequest req2 = CreateTicketRequest.builder().subject("Issue 2").description("Desc 2").build();
        CreateTicketRequest req3 = CreateTicketRequest.builder().subject("Issue 3").description("Desc 3").build();

        supportService.createTicket(req1, customerA);
        supportService.createTicket(req2, customerB);
        supportService.createTicket(req3, customerA);
        entityManager.flush();

        List<SupportTicketDto> ticketsA = supportService.getMyTickets(customerA);
        List<SupportTicketDto> ticketsB = supportService.getMyTickets(customerB);

        assertThat(ticketsA).hasSize(2);
        assertThat(ticketsA).allMatch(t -> t.getCustomerId().equals(customerA.getId()));

        assertThat(ticketsB).hasSize(1);
        assertThat(ticketsB.get(0).getCustomerId()).isEqualTo(customerB.getId());
    }

    @Test
    public void testGetAllTickets_WithStatusFilter() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User supportAgent = createUserWithRole("agent", RoleName.SUPPORT_AGENT);

        CreateTicketRequest req1 = CreateTicketRequest.builder().subject("Open Issue").description("Desc").build();
        CreateTicketRequest req2 = CreateTicketRequest.builder().subject("Progress Issue").description("Desc").build();

        SupportTicketDto t1 = supportService.createTicket(req1, customer);
        SupportTicketDto t2 = supportService.createTicket(req2, customer);

        // Update t2 to IN_PROGRESS
        supportService.updateTicketStatus(t2.getId(), "IN_PROGRESS", supportAgent);
        entityManager.flush();

        List<SupportTicketDto> openTickets = supportService.getAllTickets("OPEN");
        List<SupportTicketDto> inProgressTickets = supportService.getAllTickets("IN_PROGRESS");

        assertThat(openTickets).anyMatch(t -> t.getId().equals(t1.getId()));
        assertThat(openTickets).noneMatch(t -> t.getId().equals(t2.getId()));

        assertThat(inProgressTickets).anyMatch(t -> t.getId().equals(t2.getId()));
        assertThat(inProgressTickets).noneMatch(t -> t.getId().equals(t1.getId()));
    }

    @Test
    public void testUpdateTicketStatus_Success() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User supportAgent = createUserWithRole("agent", RoleName.SUPPORT_AGENT);

        CreateTicketRequest req = CreateTicketRequest.builder().subject("Damaged Box").description("Corner crushed").build();
        SupportTicketDto ticket = supportService.createTicket(req, customer);

        SupportTicketDto updated = supportService.updateTicketStatus(ticket.getId(), "RESOLVED", supportAgent);
        entityManager.flush();

        assertThat(updated.getStatus()).isEqualTo("RESOLVED");

        // Verify customer notification
        List<Notification> notifications = notificationRepository.findByUserId(customer.getId());
        assertThat(notifications).anyMatch(n -> n.getType().equals("TICKET_UPDATED"));
    }

    @Test
    public void testUpdateTicketStatus_InvalidStatus_Fails() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User supportAgent = createUserWithRole("agent", RoleName.SUPPORT_AGENT);

        CreateTicketRequest req = CreateTicketRequest.builder().subject("Help").description("Need help").build();
        SupportTicketDto ticket = supportService.createTicket(req, customer);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                supportService.updateTicketStatus(ticket.getId(), "UNKNOWN_STATUS", supportAgent));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void testGetTicketDetails_AccessControl() {
        User customerA = createUserWithRole("custA", RoleName.CUSTOMER);
        User customerB = createUserWithRole("custB", RoleName.CUSTOMER);
        User supportAgent = createUserWithRole("agent", RoleName.SUPPORT_AGENT);
        User admin = createUserWithRole("admin", RoleName.ADMINISTRATOR);

        CreateTicketRequest req = CreateTicketRequest.builder().subject("Private Ticket").description("Details").build();
        SupportTicketDto ticket = supportService.createTicket(req, customerA);

        // 1. Owner can view
        SupportTicketDto ownerView = supportService.getTicketDetails(ticket.getId(), customerA);
        assertThat(ownerView).isNotNull();

        // 2. Support agent can view
        SupportTicketDto agentView = supportService.getTicketDetails(ticket.getId(), supportAgent);
        assertThat(agentView).isNotNull();

        // 3. Admin can view
        SupportTicketDto adminView = supportService.getTicketDetails(ticket.getId(), admin);
        assertThat(adminView).isNotNull();

        // 4. Other customer blocked (403)
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                supportService.getTicketDetails(ticket.getId(), customerB));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
