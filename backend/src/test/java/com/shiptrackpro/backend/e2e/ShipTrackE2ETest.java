package com.shiptrackpro.backend.e2e;

import com.shiptrackpro.backend.admin.dto.AdminReportResponse;
import com.shiptrackpro.backend.admin.dto.DashboardStatsResponse;
import com.shiptrackpro.backend.admin.service.AdminService;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.notifications.dto.NotificationDto;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.pod.dto.PodResponse;
import com.shiptrackpro.backend.pod.service.PodService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.support.dto.CreateTicketRequest;
import com.shiptrackpro.backend.support.dto.SupportTicketDto;
import com.shiptrackpro.backend.support.service.SupportService;
import com.shiptrackpro.backend.tracking.dto.PublicTrackingResponse;
import com.shiptrackpro.backend.tracking.service.TrackingService;
import com.shiptrackpro.backend.user.entity.Role;
import com.shiptrackpro.backend.user.entity.RoleName;
import com.shiptrackpro.backend.user.entity.User;
import com.shiptrackpro.backend.user.entity.UserStatus;
import com.shiptrackpro.backend.user.repository.RoleRepository;
import com.shiptrackpro.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
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
public class ShipTrackE2ETest {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private PodService podService;

    @Autowired
    private TrackingService trackingService;

    @Autowired
    private SupportService supportService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    private User createUser(String emailPrefix, RoleName roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException(roleName + " role not found in database"));

        User user = User.builder()
                .email(emailPrefix + "." + UUID.randomUUID() + "@shiptrack.com")
                .passwordHash(passwordEncoder.encode("SecretPass123"))
                .firstName("Test")
                .lastName(roleName.name())
                .status(UserStatus.ACTIVE)
                .roles(Set.of(role))
                .build();

        User saved = userRepository.save(user);
        entityManager.flush();
        return saved;
    }

    @Test
    @DisplayName("Complete B2C Logistics E2E Lifecycle: Creation, Assignment, Transit, POD Delivery, Support, and Admin Stats")
    public void testCompleteB2CLogisticsLifecycleE2E() {
        // Step 1: Initialize Platform Users
        User customerA = createUser("customerA", RoleName.CUSTOMER);
        User customerB = createUser("customerB", RoleName.CUSTOMER);
        User driver1 = createUser("driver1", RoleName.DRIVER);
        User driver2 = createUser("driver2", RoleName.DRIVER);
        User supportAgent = createUser("supportAgent", RoleName.SUPPORT_AGENT);
        User admin = createUser("admin", RoleName.ADMINISTRATOR);

        // Step 2: Customer A creates a new shipment
        CreateShipmentRequest createReq = CreateShipmentRequest.builder()
                .senderName("Customer A")
                .senderPhone("9876543210")
                .receiverName("Recipient B")
                .receiverPhone("9876543211")
                .pickupAddress("Aundh, Pune, MH")
                .deliveryAddress("Andheri East, Mumbai, MH")
                .packageDescription("Dell Laptop XPS 15")
                .weight(2.2)
                .build();

        CreateShipmentResponse shipmentCreated = shipmentService.createShipment(createReq, customerA);
        entityManager.flush();

        assertThat(shipmentCreated).isNotNull();
        assertThat(shipmentCreated.getTrackingNumber()).startsWith("STP");
        assertThat(shipmentCreated.getStatus()).isEqualTo("CREATED");

        UUID shipmentId = shipmentCreated.getId();
        String trackingNumber = shipmentCreated.getTrackingNumber();

        // Step 3: Customer Isolation Verification
        // Customer A can view own shipment
        CustomerShipmentDto custAShipment = shipmentService.getCustomerShipmentById(shipmentId, customerA);
        assertThat(custAShipment.getTrackingNumber()).isEqualTo(trackingNumber);

        // Customer B is forbidden from accessing Customer A's shipment (403)
        ResponseStatusException custBIsoEx = assertThrows(ResponseStatusException.class, () ->
                shipmentService.getCustomerShipmentById(shipmentId, customerB));
        assertThat(custBIsoEx.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // Step 4: Admin views pending dispatch and assigns Driver 1
        List<CustomerShipmentDto> pendingList = shipmentService.getPendingShipments();
        assertThat(pendingList).anyMatch(s -> s.getId().equals(shipmentId));

        deliveryService.assignShipment(shipmentId, driver1.getId());
        entityManager.flush();

        CustomerShipmentDto assignedShipment = shipmentService.getCustomerShipmentById(shipmentId, admin);
        assertThat(assignedShipment.getStatus()).isEqualTo(ShipmentStatus.ASSIGNED);

        // Step 5: Driver Security & Workflow Progression
        // Driver 2 (unassigned) attempts to mutate status -> 403 Forbidden
        ResponseStatusException unassignedEx = assertThrows(ResponseStatusException.class, () ->
                deliveryService.updateShipmentStatus(shipmentId, ShipmentStatus.PICKED_UP, "Driver 2 attempting pickup", driver2));
        assertThat(unassignedEx.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // Driver 1 progresses status: ASSIGNED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY
        deliveryService.updateShipmentStatus(shipmentId, ShipmentStatus.PICKED_UP, "Package picked up from warehouse", driver1);
        deliveryService.updateShipmentStatus(shipmentId, ShipmentStatus.IN_TRANSIT, "In transit via Mumbai Expressway", driver1);
        deliveryService.updateShipmentStatus(shipmentId, ShipmentStatus.OUT_FOR_DELIVERY, "Out for delivery with courier", driver1);
        entityManager.flush();

        // Step 6: Verify Direct Transition to DELIVERED is Rejected (must use POD API)
        ResponseStatusException invalidDeliveredEx = assertThrows(ResponseStatusException.class, () ->
                deliveryService.updateShipmentStatus(shipmentId, ShipmentStatus.DELIVERED, "Direct delivery attempt", driver1));
        assertThat(invalidDeliveredEx.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // Step 7: Public Tracking Inquiry (Sanitized, Chronological Timeline)
        PublicTrackingResponse publicTracking = trackingService.getPublicTrackingTimeline(trackingNumber);
        assertThat(publicTracking).isNotNull();
        assertThat(publicTracking.getCurrentStatus()).isEqualTo(ShipmentStatus.OUT_FOR_DELIVERY);
        assertThat(publicTracking.getTimeline()).hasSizeGreaterThanOrEqualTo(4);

        // Step 8: Proof of Delivery (POD) Validation & Upload
        // Dangerous file upload rejected (.exe)
        MockMultipartFile badFile = new MockMultipartFile("photo", "malware.exe", "application/octet-stream", "dummy".getBytes());
        ResponseStatusException badFileEx = assertThrows(ResponseStatusException.class, () ->
                podService.uploadPod(shipmentId, "Recipient B", badFile, driver1));
        assertThat(badFileEx.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        // Valid POD image upload (.png)
        MockMultipartFile validPhoto = new MockMultipartFile("photo", "pod_signature.png", "image/png", "VALID_IMAGE_BYTES".getBytes());
        PodResponse podResponse = podService.uploadPod(shipmentId, "Recipient B (Signed)", validPhoto, driver1);
        entityManager.flush();

        assertThat(podResponse).isNotNull();
        assertThat(podResponse.getPhotoUrl()).startsWith("/uploads/pod/");
        assertThat(podResponse.getReceiverName()).isEqualTo("Recipient B (Signed)");

        CustomerShipmentDto deliveredShipment = shipmentService.getCustomerShipmentById(shipmentId, customerA);
        assertThat(deliveredShipment.getStatus()).isEqualTo(ShipmentStatus.DELIVERED);

        // Step 9: Customer Support Ticket Lifecycle & Isolation
        CreateTicketRequest ticketReq = CreateTicketRequest.builder()
                .shipmentId(shipmentId)
                .subject("Package Handling Feedback")
                .description("Package arrived in pristine condition, great service!")
                .build();

        SupportTicketDto ticket = supportService.createTicket(ticketReq, customerA);
        entityManager.flush();

        assertThat(ticket.getStatus()).isEqualTo("OPEN");

        // Customer B is forbidden from reading Customer A's ticket (403)
        ResponseStatusException ticketIsoEx = assertThrows(ResponseStatusException.class, () ->
                supportService.getTicketDetails(ticket.getId(), customerB));
        assertThat(ticketIsoEx.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // Support Agent views and updates ticket to RESOLVED
        SupportTicketDto agentView = supportService.getTicketDetails(ticket.getId(), supportAgent);
        assertThat(agentView).isNotNull();

        SupportTicketDto resolvedTicket = supportService.updateTicketStatus(ticket.getId(), "RESOLVED", supportAgent);
        assertThat(resolvedTicket.getStatus()).isEqualTo("RESOLVED");

        // Step 10: Admin Dashboard Statistics & Reports
        DashboardStatsResponse dashboardStats = adminService.getDashboardStats();
        assertThat(dashboardStats.getTotalShipments()).isGreaterThanOrEqualTo(1);
        assertThat(dashboardStats.getDelivered()).isGreaterThanOrEqualTo(1);
        assertThat(dashboardStats.getActiveDrivers()).isGreaterThanOrEqualTo(2);

        AdminReportResponse adminReports = adminService.getAdminReports();
        assertThat(adminReports.getStatusBreakdown()).containsKey("DELIVERED");

        // Step 11: In-App Notifications & Mark As Read
        List<NotificationDto> customerAlerts = notificationService.getUserAlerts(customerA);
        assertThat(customerAlerts).isNotEmpty();

        NotificationDto firstAlert = customerAlerts.get(0);
        NotificationDto markedRead = notificationService.markNotificationAsRead(firstAlert.getId(), customerA);
        assertThat(markedRead.getIsRead()).isTrue();

        // Customer B cannot mark Customer A's alert as read (403)
        ResponseStatusException notifIsoEx = assertThrows(ResponseStatusException.class, () ->
                notificationService.markNotificationAsRead(firstAlert.getId(), customerB));
        assertThat(notifIsoEx.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
