package com.shiptrackpro.backend.admin;

import com.shiptrackpro.backend.admin.dto.AdminReportResponse;
import com.shiptrackpro.backend.admin.dto.DashboardStatsResponse;
import com.shiptrackpro.backend.admin.service.AdminService;
import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.notifications.dto.NotificationDto;
import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import com.shiptrackpro.backend.notifications.service.NotificationService;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.support.dto.CreateTicketRequest;
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
public class AdminDashboardAndNotificationTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private SupportService supportService;

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

    private CreateShipmentRequest validRequest(String desc) {
        return CreateShipmentRequest.builder()
                .senderName("Sender")
                .senderPhone("9876543210")
                .receiverName("Receiver")
                .receiverPhone("9876543211")
                .pickupAddress("Pune Hub")
                .deliveryAddress("Mumbai Hub")
                .packageDescription(desc)
                .weight(2.5)
                .build();
    }

    @Test
    public void testDashboardStatsCalculation() {
        User customer = createUserWithRole("customer_stats", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver_stats", RoleName.DRIVER);

        // Shipment 1: CREATED
        shipmentService.createShipment(validRequest("Pkg 1"), customer);

        // Shipment 2: IN_TRANSIT
        CreateShipmentResponse s2 = shipmentService.createShipment(validRequest("Pkg 2"), customer);
        deliveryService.assignShipment(s2.getId(), driver.getId());
        deliveryService.updateShipmentStatus(s2.getId(), ShipmentStatus.PICKED_UP, "Collected", driver);
        deliveryService.updateShipmentStatus(s2.getId(), ShipmentStatus.IN_TRANSIT, "On way", driver);

        // Support tickets
        supportService.createTicket(CreateTicketRequest.builder().subject("Issue 1").description("Desc").build(), customer);
        supportService.createTicket(CreateTicketRequest.builder().subject("Issue 2").description("Desc").build(), customer);

        entityManager.flush();

        DashboardStatsResponse stats = adminService.getDashboardStats();

        assertThat(stats).isNotNull();
        assertThat(stats.getTotalShipments()).isGreaterThanOrEqualTo(2);
        assertThat(stats.getPendingDispatch()).isGreaterThanOrEqualTo(1);
        assertThat(stats.getInTransit()).isGreaterThanOrEqualTo(1);
        assertThat(stats.getOpenComplaints()).isGreaterThanOrEqualTo(2);
        assertThat(stats.getActiveDrivers()).isGreaterThanOrEqualTo(1);
    }

    @Test
    public void testAdminReportSummary() {
        User customer = createUserWithRole("cust_report", RoleName.CUSTOMER);
        shipmentService.createShipment(validRequest("Report Pkg"), customer);
        entityManager.flush();

        AdminReportResponse report = adminService.getAdminReports();

        assertThat(report).isNotNull();
        assertThat(report.getTotalShipments()).isGreaterThanOrEqualTo(1);
        assertThat(report.getStatusBreakdown()).containsKey("CREATED");
        assertThat(report.getTotalCustomers()).isGreaterThanOrEqualTo(1);
    }

    @Test
    public void testGetMyAlerts_Isolation() {
        User userA = createUserWithRole("userA", RoleName.CUSTOMER);
        User userB = createUserWithRole("userB", RoleName.CUSTOMER);

        notificationService.createNotification(userA, "Alert A1", "Msg A1", "INFO");
        notificationService.createNotification(userA, "Alert A2", "Msg A2", "INFO");
        notificationService.createNotification(userB, "Alert B1", "Msg B1", "INFO");

        entityManager.flush();

        List<NotificationDto> alertsA = notificationService.getUserAlerts(userA);
        List<NotificationDto> alertsB = notificationService.getUserAlerts(userB);

        assertThat(alertsA).hasSize(2);
        assertThat(alertsA).allMatch(a -> a.getTitle().startsWith("Alert A"));

        assertThat(alertsB).hasSize(1);
        assertThat(alertsB.get(0).getTitle()).isEqualTo("Alert B1");
    }

    @Test
    public void testMarkNotificationAsRead_SuccessAndForbidden() {
        User userA = createUserWithRole("userA_read", RoleName.CUSTOMER);
        User userB = createUserWithRole("userB_read", RoleName.CUSTOMER);

        Notification n = notificationService.createNotification(userA, "Unread Alert", "Test", "INFO");
        entityManager.flush();

        // 1. userA marks own notification as read
        NotificationDto readDto = notificationService.markNotificationAsRead(n.getId(), userA);
        assertThat(readDto.getIsRead()).isTrue();

        // 2. userB trying to modify userA's alert gets 403 Forbidden
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                notificationService.markNotificationAsRead(n.getId(), userB));
        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
