package com.shiptrackpro.backend.driver;

import com.shiptrackpro.backend.delivery.service.DeliveryService;
import com.shiptrackpro.backend.notifications.entity.Notification;
import com.shiptrackpro.backend.notifications.repository.NotificationRepository;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentRequest;
import com.shiptrackpro.backend.shipment.dto.CreateShipmentResponse;
import com.shiptrackpro.backend.shipment.dto.CustomerShipmentDto;
import com.shiptrackpro.backend.shipment.entity.Shipment;
import com.shiptrackpro.backend.shipment.entity.ShipmentStatus;
import com.shiptrackpro.backend.shipment.repository.ShipmentRepository;
import com.shiptrackpro.backend.shipment.service.ShipmentService;
import com.shiptrackpro.backend.tracking.entity.ShipmentTracking;
import com.shiptrackpro.backend.tracking.repository.ShipmentTrackingRepository;
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
public class DriverWorkflowTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentTrackingRepository shipmentTrackingRepository;

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
                .firstName("Driver")
                .lastName(emailPrefix)
                .status(UserStatus.ACTIVE)
                .roles(Set.of(role))
                .build();

        User saved = userRepository.save(user);
        entityManager.flush();
        return saved;
    }

    private CreateShipmentRequest validRequest() {
        return CreateShipmentRequest.builder()
                .senderName("Sender Driver Test")
                .senderPhone("9876543210")
                .receiverName("Receiver Driver Test")
                .receiverPhone("9876543211")
                .pickupAddress("Hub A, Pune")
                .deliveryAddress("Hub B, Mumbai")
                .packageDescription("Package Box")
                .weight(5.0)
                .build();
    }

    @Test
    public void testGetDriverDeliveries_Isolation() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driverA = createUserWithRole("driverA", RoleName.DRIVER);
        User driverB = createUserWithRole("driverB", RoleName.DRIVER);

        CreateShipmentResponse s1 = shipmentService.createShipment(validRequest(), customer);
        CreateShipmentResponse s2 = shipmentService.createShipment(validRequest(), customer);

        deliveryService.assignShipment(s1.getId(), driverA.getId());
        deliveryService.assignShipment(s2.getId(), driverB.getId());

        entityManager.flush();

        List<CustomerShipmentDto> deliveriesA = deliveryService.getDriverDeliveries(driverA);
        List<CustomerShipmentDto> deliveriesB = deliveryService.getDriverDeliveries(driverB);

        assertThat(deliveriesA).hasSize(1);
        assertThat(deliveriesA.get(0).getId()).isEqualTo(s1.getId());

        assertThat(deliveriesB).hasSize(1);
        assertThat(deliveriesB.get(0).getId()).isEqualTo(s2.getId());
    }

    @Test
    public void testSequentialStatusTransitions_Success() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());

        entityManager.flush();

        // 1. ASSIGNED -> PICKED_UP
        CustomerShipmentDto pickedUp = deliveryService.updateShipmentStatus(
                created.getId(), ShipmentStatus.PICKED_UP, "Package collected from sender", driver);
        assertThat(pickedUp.getStatus()).isEqualTo(ShipmentStatus.PICKED_UP);

        // 2. PICKED_UP -> IN_TRANSIT
        CustomerShipmentDto inTransit = deliveryService.updateShipmentStatus(
                created.getId(), ShipmentStatus.IN_TRANSIT, "Package arrived at sorting hub", driver);
        assertThat(inTransit.getStatus()).isEqualTo(ShipmentStatus.IN_TRANSIT);

        // 3. IN_TRANSIT -> OUT_FOR_DELIVERY
        CustomerShipmentDto outForDelivery = deliveryService.updateShipmentStatus(
                created.getId(), ShipmentStatus.OUT_FOR_DELIVERY, "Driver out for delivery to recipient", driver);
        assertThat(outForDelivery.getStatus()).isEqualTo(ShipmentStatus.OUT_FOR_DELIVERY);

        // Verify tracking timeline entries
        List<ShipmentTracking> trackings = shipmentTrackingRepository.findByShipmentIdOrderByCreatedAtAsc(created.getId());
        assertThat(trackings).hasSizeGreaterThanOrEqualTo(5); // CREATED + ASSIGNED + PICKED_UP + IN_TRANSIT + OUT_FOR_DELIVERY

        // Verify customer notifications
        List<Notification> customerNotifications = notificationRepository.findByUserId(customer.getId());
        assertThat(customerNotifications).anyMatch(n -> n.getMessage().contains("OUT_FOR_DELIVERY"));
    }

    @Test
    public void testDirectDeliveredTransition_IsBlocked() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());

        // Fast-forward to OUT_FOR_DELIVERY
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.PICKED_UP, "Picked up", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.IN_TRANSIT, "In transit", driver);
        deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.OUT_FOR_DELIVERY, "Out for delivery", driver);

        // Attempting to transition to DELIVERED directly via status endpoint must be rejected
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.DELIVERED, "Delivered", driver));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ex.getReason()).contains("Proof of Delivery");
    }

    @Test
    public void testSkippedTransition_IsBlocked() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User driver = createUserWithRole("driver", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), driver.getId());

        // Attempting ASSIGNED -> IN_TRANSIT (skipping PICKED_UP) must fail
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.IN_TRANSIT, "Skipped step", driver));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(ex.getReason()).contains("Invalid status transition");
    }

    @Test
    public void testUnassignedDriver_IsForbidden() {
        User customer = createUserWithRole("customer", RoleName.CUSTOMER);
        User assignedDriver = createUserWithRole("assigned", RoleName.DRIVER);
        User otherDriver = createUserWithRole("intruder", RoleName.DRIVER);

        CreateShipmentResponse created = shipmentService.createShipment(validRequest(), customer);
        deliveryService.assignShipment(created.getId(), assignedDriver.getId());

        // Other driver attempting to update status should be forbidden (403)
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                deliveryService.updateShipmentStatus(created.getId(), ShipmentStatus.PICKED_UP, "Illegal attempt", otherDriver));

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
